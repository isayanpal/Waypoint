# Waypoint

Personal learning-roadmap platform. Describe a skill you want to learn, get an AI-generated phase-by-phase roadmap, and track your progress across multiple skill projects.

## Features

- **AI-generated roadmaps** — describe a goal, get a structured, phase-by-phase learning plan from Google Gemini (`gemini-flash-lite-latest`, structured JSON output).
- **Multi-user, multi-project** — sign up, create up to 4 skill projects, track each independently.
- **Progress tracking** — check off topics, monitor phase and project completion.
- **Portfolio projects** — track hands-on projects tied to a skill's roadmap.
- **Username-only sign-in** — auth via Supabase, username + password only (no user-facing email; a synthetic internal email is generated at signup).
- **Rate-limited generation** — 2 AI roadmap generations per rolling 24h per user, enforced at the database level.
- **Three color themes** — indigo_ink (default), graphite_gold, emerald_slate, switchable from the sidebar.

## Stack

| Concern                | Choice                                    |
| ----------------------- | ----------------------------------------- |
| Framework               | Next.js 16 (App Router)                   |
| UI runtime               | React 19                                  |
| Language                | TypeScript                                |
| Database / Auth         | Supabase (Postgres + Supabase Auth + RLS) |
| UI                      | shadcn/ui (v4, @base-ui/react) + Tailwind CSS v4 |
| Client state            | Zustand                                   |
| Server state            | TanStack Query                            |
| Forms                   | react-hook-form + Zod                     |
| AI roadmap generation   | Google Gemini API (`@google/genai`)       |
| Fonts                   | Inter, Manrope, JetBrains Mono (`next/font`) |
| Deployment              | Vercel                                    |

See [`architecture/README.md`](./architecture/README.md) for the architecture overview, [`architecture/backend-architecture.md`](./architecture/backend-architecture.md) for schema/RLS/API details, and [`architecture/frontend-architecture.md`](./architecture/frontend-architecture.md) for route structure and component boundaries.

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API](https://ai.google.dev) key

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings.
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only, used for username lookups (signup/signin) and signup-race cleanup. Never expose to the browser.
   - `GEMINI_API_KEY` — server-only, used by `/api/roadmap/generate`.

3. Apply the SQL migrations in `supabase/migrations/` to your Supabase project, in order (via the Supabase CLI's `supabase db push`, or paste each file into the SQL editor in order).

4. Generate database types once the schema is live:

   ```bash
   supabase gen types typescript --project-id <id> > lib/types/database.ts
   ```

   `lib/types/database.ts` currently ships as an un-generated placeholder (`export type Database = any`) — run this before relying on typed Supabase queries.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # run production build
npm run lint    # lint
```

## Project structure

```
app/
  page.tsx       # redirects to /dashboard
  (auth)/        # sign-in, sign-up (no sidebar)
  (app)/         # authenticated shell: dashboard, roadmap, projects, new-skill
  api/
    auth/        # signin, signup, signout route handlers
    roadmap/     # generate route handler (Gemini)
components/      # feature-organized UI components (auth, dashboard, layout, onboarding, projects, roadmap, shared, ui)
lib/
  domain/        # pure functions: phase-status recompute, dashboard stats
  gemini/        # Gemini client + prompt + response schema
  queries/       # TanStack Query hooks (reads + mutations)
  server/        # server-only helpers (active project resolution)
  stores/        # Zustand UI store (theme, sidebar, mobile nav)
  supabase/      # browser/server/admin Supabase clients
  types/         # generated + hand-written domain types
  validations/   # zod schemas (auth, new-skill)
supabase/
  migrations/    # ordered SQL migrations
architecture/    # architecture docs
```

Note: auth session refresh/gating happens in `app/(app)/layout.tsx` (a server component), not in a `middleware.ts` file — none exists in this repo.
