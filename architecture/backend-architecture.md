# Backend Architecture

## 1. Overview

Backend responsibility splits three ways:

1. **Direct-to-Supabase reads/mutations from the client**, protected entirely by Row-Level Security (RLS). Used for simple per-user CRUD: reading a skill project's phases/topics.
2. **Postgres functions (RPC)**, called via the Supabase client, for anything that must be atomic or encodes business logic that shouldn't live duplicated in the frontend (toggling a topic and recomputing phase state; writing an entire AI-generated roadmap in one transaction).
3. **Next.js Route Handlers**, for anything that needs a secret the browser must never see (Gemini API key, Supabase service-role key) or needs centralized rate limiting: auth signup/signin/signout (username resolution), AI roadmap generation.

No separate API server, no ORM layer, no `middleware.ts` — session auth-gating happens in `app/(app)/layout.tsx` as a server component (see frontend doc §1).

## 2. Database schema (Supabase Postgres)

All tables use `uuid` primary keys (`gen_random_uuid()`), denormalize `user_id` on every row (simplifies RLS to a single equality check), and use `timestamptz` for timestamps. Reflects the schema after all migrations through `0012`.

```
profiles
  id            uuid PK, references auth.users(id) on delete cascade
  username      text not null unique          -- unique index on lower(username) for case-insensitive lookup
  email         text not null                  -- mirrors auth.users.email; see §5, this is a synthetic
                                                   internal address, never shown to the user
  created_at    timestamptz default now()

skill_projects
  id              uuid PK
  user_id         uuid not null references auth.users(id) on delete cascade
  name            text not null
  goal            text                      -- "Goal & context" from onboarding form
  level           text                      -- Beginner | Intermediate | Advanced
  timeline_months integer                   -- 3 | 6 | 12
  created_at      timestamptz default now()
  updated_at      timestamptz default now()
  -- streak column removed in migration 0012_drop_skill_projects_streak.sql

phases
  id                uuid PK
  skill_project_id  uuid not null references skill_projects(id) on delete cascade
  user_id           uuid not null references auth.users(id) on delete cascade
  order_index       integer not null
  name              text not null
  status            text not null check (status in ('not_started','current','complete')) default 'not_started'
  created_at        timestamptz default now()
  unique (skill_project_id, order_index)

topics
  id            uuid PK
  phase_id      uuid not null references phases(id) on delete cascade
  user_id       uuid not null references auth.users(id) on delete cascade
  order_index   integer not null
  label         text not null
  done          boolean not null default false
  unique (phase_id, order_index)

portfolio_projects
  id                uuid PK
  skill_project_id  uuid not null references skill_projects(id) on delete cascade
  user_id           uuid not null references auth.users(id) on delete cascade
  order_index       integer not null
  name              text not null
  timeline          text                  -- free-text, e.g. "Week 3-4"
  difficulty        text                  -- e.g. Beginner | Intermediate | Advanced
  status            text not null check (status in ('not_started','in_progress','complete')) default 'not_started'
  description       text
  hook              text                  -- "why this matters" sentence
  proves            text                  -- "what it proves" callout copy
  stack             text[]                -- tech stack chips
  created_at        timestamptz default now()

portfolio_project_phases          -- many-to-many: "Phase N — ShortName" chips
  portfolio_project_id  uuid not null references portfolio_projects(id) on delete cascade
  phase_id              uuid not null references phases(id) on delete cascade
  primary key (portfolio_project_id, phase_id)

activity_log                      -- written by toggle_topic_done; not currently read by any UI (see architecture/README.md)
  id                uuid PK
  user_id           uuid not null references auth.users(id) on delete cascade
  skill_project_id  uuid not null references skill_projects(id) on delete cascade
  occurred_on       date not null
  weight            integer not null default 1   -- topics completed that day
  unique (skill_project_id, occurred_on)

user_settings                     -- created by the signup trigger; not currently read/written by the client
  user_id            uuid PK references auth.users(id) on delete cascade
  theme              text not null default 'indigo_ink' check (theme in ('indigo_ink','graphite_gold','emerald_slate'))
  sidebar_collapsed  boolean not null default false

ai_generations                    -- backs rate limiting, see §7
  id            uuid PK
  user_id       uuid not null references auth.users(id) on delete cascade
  created_at    timestamptz not null default now()
```

Notes:
- `activity_log` and `user_settings` exist and are populated (the former by `toggle_topic_done`, the latter by the signup trigger) but neither is currently read back by the frontend. Theme and sidebar-collapsed state live in the client-only Zustand store (`localStorage`), not Supabase. Treat these two tables as write-only until a heatmap/cross-device-settings feature is built against them.
- `phases.status = 'current'` is maintained by the topic-toggle function (§4), not set directly by the client.

## 3. Row-Level Security

RLS enabled on every table above. Uniform policy shape since `user_id` is denormalized everywhere:

```sql
alter table skill_projects enable row level security;
create policy "owner full access" on skill_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- repeat per table (phases, topics, portfolio_projects, activity_log, user_settings, ai_generations)
```

`portfolio_project_phases` has no `user_id` column (pure join table) — policy checks ownership via a subquery against `portfolio_projects`:

```sql
create policy "owner full access" on portfolio_project_phases
  for all using (
    exists (select 1 from portfolio_projects p
            where p.id = portfolio_project_id and p.user_id = auth.uid())
  );
```

`profiles`: only a `select` policy scoped to `auth.uid() = id`. No insert/update/delete policy — the only writer is the `handle_new_user()` trigger, which is `security definer` and bypasses RLS. Username-lookup during sign-up/sign-in goes through the **service-role** client in a route handler, also bypassing RLS — no public read policy on `profiles` exists, so the username↔email mapping is never exposed to anonymous or other users' clients.

## 4. Postgres functions (RPC)

`SECURITY INVOKER` unless noted (runs with the calling user's privileges, so RLS still applies), called via `supabase.rpc(...)`.

### `handle_new_user()` — trigger, `security definer`
Fires `after insert` on `auth.users`. Reads `username` from `raw_user_meta_data` and `email` from the new row, inserts the corresponding `profiles` row and a default `user_settings` row. Keeps profile creation atomic with user creation.

### `toggle_topic_done(p_topic_id uuid) returns setof phases`
Single entry point for "click checkbox → flip done → recompute phase status → log activity."
1. Flip `topics.done` for the given row (RLS ensures caller owns it).
2. Recompute the parent phase's status:
   - `complete` if all sibling topics are now `done`.
   - `current` if it's the first non-complete phase in the skill project (`order_index = 0`, or the previous phase is `complete`).
   - `not_started` otherwise.
3. If the phase just became `complete` and a next phase exists, mark it `current` (unlocking it) unless already complete.
4. Upsert today's row in `activity_log` for this `skill_project_id` (`on conflict (skill_project_id, occurred_on) do update set weight = weight + 1`).
5. Return all phases for the skill project, ordered by `order_index` — one round trip, client doesn't need to manually recompute.

### `cycle_portfolio_project_status(p_project_id uuid) returns portfolio_projects`
Rotates `not_started → in_progress → complete → not_started`. Returns the updated row.

### `delete_skill_project(p_skill_project_id uuid) returns void`
Deletes the skill project; `on delete cascade` handles children.

### `create_skill_project_from_ai(p_payload jsonb) returns uuid`
Called only from `/api/roadmap/generate`, never directly from the browser. Takes the validated Gemini output and inserts `skill_projects` + 5 `phases` (first `current`, rest `not_started`) + their `topics` + `portfolio_projects` + `portfolio_project_phases` in one transaction, returning the new `skill_project_id`. Runs with the caller's own session (not service-role) — RLS applies to every insert. Atomicity matters here: a partial roadmap (phases with no topics) is worse than a failed generation.

### `check_and_log_ai_generation(p_user_id uuid) returns boolean` — `security definer`
Rate-limit gate (§7). Single statement:
1. Count `ai_generations` rows for `p_user_id` where `created_at > now() - interval '24 hours'`.
2. If count `>= 2`, return `false` (caller rejects with 429), no insert.
3. Otherwise insert a new `ai_generations` row, return `true`.
Count-and-insert as one statement keeps the race window for concurrent double-submits negligible.

## 5. Authentication

Supabase Auth, email/password grant under the hood — but **the app collects only a username and password from the user**. No email field exists anywhere in the signup UI or its Zod schema.

### Sign-up (`POST /api/auth/signup`, Route Handler)
1. Validate input (Zod, `lib/validations/auth.ts`): `username` (3-24 chars, alphanumeric + underscore), `password` (min 6 chars).
2. Pre-check username availability: query `profiles` for `lower(username) = lower(input)` using the **service-role** client (bypasses RLS; anon clients have no read access to `profiles`). If taken, return 409 before touching auth.
3. Synthesize a placeholder email: `` `${username.toLowerCase()}@users.waypoint.internal` ``. This satisfies Supabase Auth's email requirement without ever asking the user for one.
4. Call `supabase.auth.signUp({ email, password, options: { data: { username } } })`. `username` lands in `raw_user_meta_data`.
5. The `handle_new_user()` trigger (§4) reads `raw_user_meta_data->>'username'` and inserts the `profiles` + `user_settings` rows.
6. Race handling: if the trigger's unique constraint on `username` fails (two concurrent signups for the same name), `auth.signUp` fails and the route handler calls `supabase.auth.admin.deleteUser(id)` (service-role) to avoid an orphaned auth user with no profile, then returns 409.
7. No email verification flow — resolved by removing email collection entirely rather than adding verification.

### Sign-in (`POST /api/auth/signin`, Route Handler)
1. Validate input: `identifier` (string), `password`.
2. If `identifier` contains `@`, treat as an email directly (dead code from the UI's perspective, since signup never collects a real email — kept for API robustness).
3. Otherwise, look up `profiles` by `lower(username)` via the service-role client to get the associated (synthetic) `email`. Not found → generic "invalid credentials" (don't leak whether the username exists).
4. Call `supabase.auth.signInWithPassword({ email, password })`, forward the resulting session cookies to the browser via `@supabase/ssr`.

### Sign-out (`POST /api/auth/signout`, Route Handler)
Calls `supabase.auth.signOut()` with the server client, clearing session cookies.

Client-side, all three forms post to these route handlers rather than calling `supabase.auth` directly — necessary for the username-resolution step and keeps the service-role key server-only.

### Session handling
`@supabase/ssr` for cookie-based sessions across server components and route handlers. `app/(app)/layout.tsx` is a server component that calls `supabase.auth.getUser()` on every request to that route group and `redirect("/sign-in")` if there's no session. There is no `middleware.ts` in this repo.

## 6. AI roadmap generation

`POST /api/roadmap/generate` — Route Handler, Node runtime.

1. **Auth check**: resolve user from the request's Supabase session (server client). 401 (`unauthorized`) if absent.
2. **Input validation** (Zod): `name`, `goal`, `level` (enum), `timelineMonths` (enum 3/6/12). 400 (`invalid_input`) on failure.
3. **Project cap check**: count the user's `skill_projects`; `>= 4` → 403 (`project_limit_reached`). 500 (`project_count_check_failed`) on query error.
4. **Rate limit check** (§7): call `check_and_log_ai_generation(user_id)`. `false` → 429 (`rate_limited`) with a computed `retryAt` (oldest of the 2 recent `ai_generations` rows + 24h), no Gemini call made. 500 (`rate_limit_check_failed`) on query error.
5. **Prompt construction** (`lib/gemini/prompts.ts`): fixed 5-phase progression (Fundamentals → Core practices → Intermediate techniques → Advanced topics → Portfolio capstone), 3-8 topics per phase scaled to `timelineMonths`, exactly 2 portfolio projects, tailored to `goal`/`level`.
6. **Call Gemini** (`gemini-flash-lite-latest`, `lib/gemini/client.ts`) using structured output (`responseMimeType: "application/json"` + a `responseSchema` built from `@google/genai`'s `Type.*` enums) — avoids free-text parsing. Wrapped in `generateContentWithRetry`: up to 2 retries with exponential backoff (`500ms * 2^attempt`), retrying only on transient 503/429 errors from Gemini. Exhausted retries → 503 (`generation_unavailable`).
7. **Validate the response** against `roadmapPayloadSchema` (Zod, `lib/gemini/schema.ts`) mirroring the DB shape — exactly 5 phases, exactly 2 portfolio projects, ordered topics, project name/timeline/difficulty/description/hook/proves/stack/linked-phase-indices. On mismatch, retry once with an amended prompt telling Gemini it got the shape wrong; still invalid → 502 (`generation_failed`). Never writes partial/malformed data.
8. **Persist**: call `create_skill_project_from_ai` (§4) with the validated payload. DB failure → 502 (`generation_failed`).
9. **Respond** `201` with the new `skillProjectId`; frontend navigates to its dashboard.

## 7. Rate limiting

Scope: **AI generation endpoint only**. Auth endpoints and general API routes are not rate-limited.

- **Mechanism**: no external service. Enforced in Postgres via `check_and_log_ai_generation` (§4) — an `ai_generations` log table plus a count check, called from the route handler before the Gemini request goes out.
- **Key**: `user_id` — per-user, not per-IP.
- **Limit**: **2 generations per rolling 24h window per user**, hard cap — not per-calendar-day. `DAILY_GENERATION_LIMIT = 2` is also duplicated client-side in `lib/queries/ai-generations.ts` (`useAiGenerationUsage()`) to drive a remaining-quota UI without a round trip.
- **Response on limit hit**: HTTP 429, JSON body `{ error: "rate_limited", retryAt: <iso timestamp> }` computed from the oldest of the 2 recent `ai_generations` rows + 24h.
- **This governs generation attempts, not successes.** The log row is written before the Gemini call, so a generation that later fails schema validation still consumes one of the 2 slots.
- **Separate cap**: a **4-skill-project limit per user** is enforced in the same route handler (`project_limit_reached`, 403) before the rate-limit check runs. This bounds per-user storage/AI usage independent of the 24h window.
- **Trade-off accepted**: caps are per authenticated user only; no per-IP secondary check exists. Out of scope at this app's scale.

## 8. API route inventory

| Route | Method | Purpose | Auth | Rate limited |
|---|---|---|---|---|
| `/api/auth/signup` | POST | Create account (username + password), resolve username uniqueness | Public | No |
| `/api/auth/signin` | POST | Resolve username→email, sign in | Public | No |
| `/api/auth/signout` | POST | Clear session | Required | No |
| `/api/roadmap/generate` | POST | Gemini call + atomic roadmap write | Required | Yes (2/24h + 4-project cap) |

Everything else (toggle topic, cycle project status, delete skill project, list/read skill projects) goes directly through the Supabase JS client from the browser — either a plain table query (RLS-protected) or an RPC call (§4). No custom route handler needed.

## 9. Folder structure

No separate backend service — it lives inside the Next.js repo as route handlers + a Supabase project.

```
supabase/
  migrations/
    0001_init_profiles.sql              -- profiles table + auth.users trigger
    0002_skill_projects.sql             -- skill_projects, phases, topics
    0003_portfolio_projects.sql         -- portfolio_projects, portfolio_project_phases
    0004_activity_and_settings.sql      -- activity_log, user_settings
    0005_ai_generations.sql             -- rate-limit log table
    0006_rls_policies.sql               -- all "owner full access" policies, one file
    0007_functions_toggle_topic.sql     -- toggle_topic_done()
    0008_functions_portfolio_status.sql -- cycle_portfolio_project_status()
    0009_functions_delete_project.sql   -- delete_skill_project()
    0010_functions_ai_write.sql         -- create_skill_project_from_ai()
    0011_functions_rate_limit.sql       -- check_and_log_ai_generation()
    0012_drop_skill_projects_streak.sql -- drops skill_projects.streak (feature removed)

app/
  api/
    auth/
      signup/route.ts                   -- §5 sign-up flow
      signin/route.ts                   -- §5 sign-in flow (username-or-email resolve)
      signout/route.ts                  -- §5 sign-out
    roadmap/
      generate/route.ts                 -- §6 Gemini call + caps + atomic write

lib/
  supabase/
    client.ts                           -- browser client (anon key)
    server.ts                           -- server client, cookie-bound (@supabase/ssr)
    admin.ts                            -- service-role client, server-only — username lookups,
                                            orphaned-auth-user cleanup on signup race
  gemini/
    client.ts                           -- Gemini SDK instance (@google/genai), GEMINI_MODEL constant
    prompts.ts                          -- roadmap-generation prompt template
    schema.ts                           -- Gemini responseSchema (JSON mode) + matching Zod schema
  domain/
    phase-status.ts                     -- pure client-side mirror of the toggle_topic_done recompute
                                            rules (hand-kept in sync, never the source of truth)
    dashboard-stats.ts                  -- pure computeDashboardStats() over a SkillProjectDetail
  validations/
    auth.ts                             -- signup/signin Zod schemas (no email field)
    new-skill.ts                        -- onboarding form Zod schema
  server/
    active-project.ts                   -- getActiveProjectId(), server-only
  types/
    database.ts                         -- placeholder (`export type Database = any`) until
                                            `supabase gen types` is run
    domain.ts                           -- hand-written domain types (Topic, Phase, PortfolioProject, ...)
```

Notes:
- Migrations are numbered and one-concern-per-file, including `0012` which removed the streak column after the feature was dropped.
- `lib/domain/phase-status.ts` is the one deliberate piece of business logic duplicated between Postgres (source of truth) and TypeScript (optimistic-UI mirror).
- `lib/types/database.ts` should be regenerated via `supabase gen types typescript` before relying on typed Supabase queries — it currently ships as `any`.

## 10. Environment variables

| Var | Exposed to browser | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + server Supabase clients (RLS-scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only client — username lookup, orphaned-user cleanup on signup race |
| `GEMINI_API_KEY` | No | `/api/roadmap/generate` |
