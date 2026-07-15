# Backend Architecture

## 1. Overview

Backend responsibility splits three ways:

1. **Direct-to-Supabase reads/mutations from the client**, protected entirely by Row-Level Security (RLS). Used for everything that's a simple per-user CRUD op: reading a skill project's phases/topics, cycling a portfolio project's status, deleting a skill project.
2. **Postgres functions (RPC)**, called via the Supabase client, for anything that must be atomic or encodes business logic that shouldn't live duplicated in the frontend (toggling a topic and recomputing phase/streak state; writing an entire AI-generated roadmap in one transaction).
3. **Next.js Route Handlers**, for anything that needs a secret the browser must never see (Gemini API key, Supabase service-role key) or needs centralized rate limiting: auth signup/signin (username resolution), AI roadmap generation.

This keeps the backend "thin" — no separate API server, no ORM layer — while still getting real transactional guarantees and secret isolation.

## 2. Database schema (Supabase Postgres)

All tables use `uuid` primary keys (`gen_random_uuid()`), denormalize `user_id` on every row (simplifies RLS to a single equality check, avoids join-based policies), and use `timestamptz` for all timestamps.

```
profiles
  id            uuid PK, references auth.users(id) on delete cascade
  username      text unique, not null, citext or lower() indexed for case-insensitive lookup
  email         text not null            -- mirrored from auth.users for lookup convenience
  created_at    timestamptz default now()

skill_projects
  id            uuid PK
  user_id       uuid not null references auth.users(id) on delete cascade
  name          text not null
  goal          text                      -- "Goal & context" from onboarding form
  level         text                      -- Beginner | Intermediate | Advanced
  timeline_months integer                 -- 3 | 6 | 12
  streak        integer default 0         -- denormalized cache, recomputed from activity_log
  created_at    timestamptz default now()
  updated_at    timestamptz default now()

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

activity_log                      -- backs the contribution heatmap + streak calc
  id                uuid PK
  user_id           uuid not null references auth.users(id) on delete cascade
  skill_project_id  uuid not null references skill_projects(id) on delete cascade
  occurred_on       date not null
  weight            integer not null default 1   -- topics completed that day, drives heatmap shading level
  unique (skill_project_id, occurred_on)

user_settings
  user_id            uuid PK references auth.users(id) on delete cascade
  theme              text not null default 'indigo_ink' check (theme in ('indigo_ink','graphite_gold','emerald_slate'))
  sidebar_collapsed  boolean not null default false

ai_generations                    -- backs rate limiting, see §7
  id            uuid PK
  user_id       uuid not null references auth.users(id) on delete cascade
  created_at    timestamptz not null default now()
```

Notes:
- `sidebarCollapsed` / `mobileNavOpen` from the prototype's state list — only `sidebar_collapsed` is persisted server-side (cross-device preference worth keeping). `mobileNavOpen` is transient UI state, stays client-only (Zustand, not persisted).
- Heatmap cell shading levels (5 buckets) are a frontend computation over `activity_log.weight`, not stored as a separate column — keeps the AI/mutation layer from needing to know about presentation buckets.
- `phases.status = 'current'` is maintained by the topic-toggle function (§4), not set directly by the client.

## 3. Row-Level Security

RLS enabled on every table above. Uniform policy shape since `user_id` is denormalized everywhere:

```sql
alter table skill_projects enable row level security;
create policy "owner full access" on skill_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- repeat per table (phases, topics, portfolio_projects, activity_log, user_settings)
```

`portfolio_project_phases` has no `user_id` column (pure join table) — policy instead checks ownership via a subquery against `portfolio_projects`:

```sql
create policy "owner full access" on portfolio_project_phases
  for all using (
    exists (select 1 from portfolio_projects p
            where p.id = portfolio_project_id and p.user_id = auth.uid())
  );
```

`profiles`: `select` policy scoped to `auth.uid() = id` for normal clients. Username-lookup during sign-in (§5) goes through the **service-role** client in a route handler, which bypasses RLS entirely — no public read policy on `profiles` is needed or created. This avoids leaking the username↔email mapping to anonymous clients.

## 4. Postgres functions (RPC)

Business logic that must be atomic lives in `SECURITY INVOKER` functions (run with the calling user's privileges, so RLS still applies) called via `supabase.rpc(...)`.

### `toggle_topic_done(p_topic_id uuid)`
Single entry point for the prototype's "click checkbox → flips done → recomputes phase status → recomputes stats" chain.
1. Flip `topics.done` for the given row (RLS ensures caller owns it).
2. Recompute the parent phase's status:
   - `complete` if all sibling topics are now `done`.
   - `current` if it's the first non-complete phase in the skill project (predecessor complete or is phase 1).
   - `not_started` otherwise.
3. If the phase just became `complete`, and a next phase exists, ensure that next phase is marked `current` (unlocking it) unless it's already complete.
4. Upsert today's row in `activity_log` for this `skill_project_id`, incrementing `weight`.
5. Return the updated phase + topic (or the full skill project's phases, to keep the client simple — one round trip, no manual client-side recompute needed).

### `cycle_portfolio_project_status(p_project_id uuid)`
Rotates `not_started → in_progress → complete → not_started`. Trivial, but centralized so the cycle order is defined once, not duplicated in a frontend switch statement.

### `check_and_log_ai_generation(p_user_id uuid) returns boolean`
Rate-limit gate, replaces the earlier Redis-based design (see §7). `SECURITY DEFINER` function, single SQL statement:
1. Count rows in `ai_generations` for `p_user_id` where `created_at > now() - interval '24 hours'`.
2. If count `>= 2`, return `false` (caller rejects with 429), no insert.
3. Otherwise insert a new `ai_generations` row for this user, return `true`.
Doing the count-then-insert as one statement (CTE, not two round trips) keeps the race window for concurrent double-submits negligible — acceptable at this app's scale; a full `SELECT ... FOR UPDATE` row lock is unnecessary overhead here.

### `delete_skill_project(p_skill_project_id uuid)`
Deletes the skill project (cascades handle children). Wrapped as a function only so the frontend has one call site consistent with the others; a plain `.delete()` via the Supabase client would work equally well since RLS + `on delete cascade` already make this safe — either is fine, function form recommended for consistency with the mutation hooks in the frontend doc.

### `create_skill_project_from_ai(p_payload jsonb)`
Used only by the AI-generation route handler (§6), not called directly from the browser. Takes the validated Gemini output (already shaped by the route handler's Zod schema) and inserts `skill_projects` + `phases` + `topics` + `portfolio_projects` + `portfolio_project_phases` in one transaction, returning the new `skill_project_id`. Atomicity here matters: a partial roadmap (phases with no topics because the request died halfway) is worse than an outright failed generation.

## 5. Authentication

Supabase Auth, email/password grant. Requirement: sign in with **either username or email**.

### Sign-up (`POST /api/auth/signup`, Route Handler, Node runtime)
1. Validate input (Zod): `username` (3-24 chars, alphanumeric + underscore), `email`, `password` (min length per Supabase default policy).
2. Pre-check username availability: query `profiles` for `lower(username) = lower(input)` using the **service-role** client (bypasses RLS; anon clients have no read access to `profiles`). If taken, return 409 before touching auth.
3. Call `supabase.auth.signUp({ email, password, options: { data: { username } } })` using the anon/server client — `username` lands in `raw_user_meta_data`.
4. A Postgres trigger on `auth.users` (`after insert`) reads `NEW.raw_user_meta_data->>'username'` and inserts the `profiles` row + a default `user_settings` row. Keeps profile creation atomic with user creation regardless of which client path creates the user.
5. Race handling: if the trigger's unique-constraint on `username` fails (two concurrent signups for the same name), the trigger raises, `auth.signUp` fails, and the route handler calls `supabase.auth.admin.deleteUser(id)` (service-role) to avoid an orphaned auth user with no profile, then returns 409.
6. Email verification: **decision needed** (flagged in the overview doc) — if enabled, Supabase sends the confirmation email automatically and the response tells the frontend to show a "check your email" state instead of signing in immediately.

### Sign-in (`POST /api/auth/signin`, Route Handler)
Supabase Auth only knows email. Resolving "username or email" requires a server hop:
1. Validate input: `identifier` (string), `password`.
2. If `identifier` contains `@`, treat as email directly.
3. Otherwise, look up `profiles` by `lower(username)` via service-role client to get the associated `email`. Not found → return a generic "invalid credentials" (don't leak whether the username exists).
4. Call `supabase.auth.signInWithPassword({ email, password })` and forward the resulting session cookies to the browser (via `@supabase/ssr` cookie handling in the route handler).

Client-side, both forms post to these route handlers rather than calling `supabase.auth` directly — necessary for the username-resolution step and keeps the service-role key server-only.

### Session handling
`@supabase/ssr` for cookie-based sessions across server components, route handlers, and middleware. `middleware.ts` refreshes the session on every request and redirects unauthenticated users away from `(app)` routes to `/sign-in`.

## 6. AI roadmap generation

`POST /api/roadmap/generate` — Route Handler, Node runtime (not Edge — needs the Gemini SDK and a longer execution window than Edge's default).

1. **Auth check**: resolve user from the request's Supabase session (server client). 401 if absent.
2. **Rate limit check** (see §7): call `check_and_log_ai_generation(user_id)`. `false` → return 429 immediately, no Gemini call made (cheap check happens before the expensive one).
3. **Input validation** (Zod): `name`, `goal`, `level` (enum), `timelineMonths` (enum 3/6/12).
4. **Prompt construction**: build a structured prompt asking Gemini for a 5-phase roadmap (Fundamentals → Core practices → Intermediate techniques → Advanced topics → Portfolio capstone, per the onboarding spec) plus 2 portfolio projects, tailored to `goal`/`level`/`timelineMonths`.
5. **Call Gemini** using its structured-output mode (`responseMimeType: "application/json"` + a `responseSchema`) so the model is constrained to a JSON shape matching the DB — avoids brittle free-text parsing.
6. **Validate the response** against a Zod schema mirroring the DB shape (phase names + ordered topics; project name/timeline/difficulty/description/hook/proves/stack/linked-phase-indices). If validation fails, retry once with a stricter reminder, then fail with a 502 and a user-facing "generation failed, try again" message — never write partial/malformed data.
7. **Persist**: call `create_skill_project_from_ai` (§4) with the validated payload.
8. **Respond** with the new `skill_project_id`; frontend navigates to its dashboard.

The prototype's "~1.4s fake spinner" becomes a real loading state sized to actual Gemini latency (likely 3-8s for this payload size) — frontend should show the same "Generating your roadmap…" copy, no fixed timer.

## 7. Rate limiting

Scope, per your call: **AI generation endpoint only**. Auth endpoints and general API routes are not rate-limited in v1 (revisit if abuse shows up).

- **Mechanism**: no external service. Enforced entirely in Postgres via `check_and_log_ai_generation` (§4) — an `ai_generations` log table plus a count check, called from the route handler before the Gemini request goes out. No Redis, no extra env vars, no extra infra to provision — the DB is already the source of truth for everything else, so it's the source of truth for this too.
- **Key**: `user_id` — per-user, not per-IP (a shared IP shouldn't throttle unrelated users; an authenticated endpoint always has a user_id).
- **Limit**: **2 generations per rolling 24h window per user**, hard cap — not 2-per-calendar-day (a calendar-day cap resets at UTC midnight regardless of when the user's window actually started, which is easier to game and inconsistent with "2, that's it" per your framing). Rolling window means exactly 2 successful generations in any 24h lookback, no more, ever, regardless of timing.
- **Response on limit hit**: HTTP 429, JSON body `{ error: "rate_limited", retryAt: <iso timestamp of oldest-of-the-2 generation + 24h> }` — the route handler computes `retryAt` from the `ai_generations` rows it already queried. Frontend shows this as a toast/inline error on the onboarding form, not a silent failure.
- **This governs successful generations only.** A generation that fails validation (§6 step 6, malformed Gemini output) still consumes one of the 2 slots since the log row is written before the Gemini call — deliberate: it's a rate limit on generation *attempts*, not on Gemini's reliability, and prevents a user from retrying a broken prompt indefinitely. If this turns out too strict in practice, move the log-insert to after successful persistence instead — noted as a tuning knob, not a v1 blocker.
- **Trade-off accepted**: this cap is per authenticated user only. It does nothing against someone scripting many signups to get many free generation batches — out of scope for a personal-use-scale app; revisit (e.g. add email verification + a per-IP secondary check) only if that's observed in practice.

## 8. API route inventory

| Route | Method | Purpose | Auth | Rate limited |
|---|---|---|---|---|
| `/api/auth/signup` | POST | Create account, resolve username uniqueness | Public | No |
| `/api/auth/signin` | POST | Resolve username→email, sign in | Public | No |
| `/api/roadmap/generate` | POST | Gemini call + atomic roadmap write | Required | Yes |

Everything else (toggle topic, cycle project status, delete skill project, list/read skill projects, update theme/sidebar pref) goes directly through the Supabase JS client from the browser — either a plain table query (RLS-protected) or an RPC call (§4). No custom route handler needed; this is intentional, not an oversight — it avoids a pile of pass-through API routes that add latency and no real logic.

## 9. Folder structure

No separate backend service — it lives inside the Next.js repo as route handlers + a Supabase project. Layout:

```
supabase/
  migrations/
    0001_init_profiles.sql              -- profiles table + auth.users trigger
    0002_skill_projects.sql             -- skill_projects, phases, topics
    0003_portfolio_projects.sql         -- portfolio_projects, portfolio_project_phases
    0004_activity_and_settings.sql      -- activity_log, user_settings
    0005_ai_generations.sql             -- rate-limit log table
    0006_rls_policies.sql               -- all "owner full access" policies, one file, easy to audit
    0007_functions_toggle_topic.sql     -- toggle_topic_done()
    0008_functions_portfolio_status.sql -- cycle_portfolio_project_status()
    0009_functions_delete_project.sql   -- delete_skill_project()
    0010_functions_ai_write.sql         -- create_skill_project_from_ai()
    0011_functions_rate_limit.sql       -- check_and_log_ai_generation()
  config.toml                           -- Supabase CLI project config (local dev + link to remote)
  seed.sql                              -- optional: the prototype's demo data (Backend Engineering +
                                            Frontend Architecture examples) for local dev only

app/
  api/
    auth/
      signup/route.ts                   -- §5 sign-up flow
      signin/route.ts                   -- §5 sign-in flow (username-or-email resolve)
    roadmap/
      generate/route.ts                 -- §6 Gemini call + rate-limit gate + atomic write

lib/
  supabase/
    client.ts                           -- browser client (anon key)
    server.ts                           -- server client, cookie-bound (@supabase/ssr), used in
                                            route handlers, server components, middleware
    admin.ts                            -- service-role client, server-only — username lookups,
                                            orphaned-auth-user cleanup on signup race
  gemini/
    client.ts                           -- Gemini SDK instance, reads GEMINI_API_KEY
    prompts.ts                          -- roadmap-generation prompt template
    schema.ts                           -- Gemini responseSchema (JSON mode) + matching Zod schema
                                            used to validate the response before persisting
  domain/
    phase-status.ts                     -- pure functions for phase status / progress recompute —
                                            shared reference so the frontend's optimistic-update
                                            logic (see frontend doc §7) mirrors the DB function's
                                            rules instead of drifting from them
  validations/
    auth.ts                             -- signup/signin Zod schemas, imported by both the route
                                            handlers and the frontend forms
    new-skill.ts                        -- onboarding form Zod schema, same dual use
  types/
    database.ts                         -- generated via `supabase gen types typescript`, the single
                                            source of truth for row/table types across front + back

middleware.ts                           -- session refresh + auth gate (uses lib/supabase/server.ts)
```

Notes:
- Migrations are numbered and one-concern-per-file — matches how `supabase db diff`/`supabase migration new` output naturally accumulates, and keeps `git blame` on schema changes meaningful.
- `lib/domain/phase-status.ts` is the one deliberate piece of "business logic" duplicated between Postgres (source of truth) and TypeScript (optimistic-UI mirror) — everything else lives in exactly one place (either a DB function or a route handler), by design, to avoid two implementations drifting apart.
- `lib/types/database.ts` being generated (not hand-written) means schema changes in `supabase/migrations` flow into type safety on both the route handlers and the TanStack Query hooks with one `supabase gen types` run — no manually-maintained interface duplicating the SQL.

## 10. Environment variables

| Var | Exposed to browser | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + server Supabase clients (RLS-scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only client — username lookup, orphaned-user cleanup on signup race |
| `GEMINI_API_KEY` | No | `/api/roadmap/generate` |
