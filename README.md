# Waypoint

Personal learning-roadmap platform. Describe a skill you want to learn, get an AI-generated phase-by-phase roadmap, and track your progress across multiple skill projects.

## Features

- **AI-generated roadmaps** — describe a goal, get a structured, phase-by-phase learning plan from Google Gemini.
- **Multi-user, multi-project** — sign up, create multiple skill projects, track each independently.
- **Progress tracking** — check off topics, monitor phase and project completion.
- **Portfolio projects** — track hands-on projects tied to a skill's roadmap.
- **Username or email sign-in** — auth via Supabase, with username-to-email resolution on sign-in.
- **Rate-limited generation** — 2 AI roadmap generations per rolling 24h per user, enforced at the database level.

## Stack

| Concern               | Choice                                    |
| --------------------- | ----------------------------------------- |
| Framework             | Next.js (App Router)                      |
| Language              | TypeScript                                |
| Database / Auth       | Supabase (Postgres + Supabase Auth + RLS) |
| UI                    | shadcn/ui + Tailwind CSS                  |
| Client state          | Zustand                                   |
| Server state          | TanStack Query                            |
| AI roadmap generation | Google Gemini API                         |
| Deployment            | Vercel                                    |

See [`architecture/README.md`](./architecture/README.md) for the full architecture plan, [`architecture/backend-architecture.md`](./architecture/backend-architecture.md) for schema/RLS/API details, and [`architecture/frontend-architecture.md`](./architecture/frontend-architecture.md) for route structure and component boundaries.

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
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only, used for username lookups and signup-race cleanup. Never expose to the browser.
   - `GEMINI_API_KEY` — server-only, used by `/api/roadmap/generate`.

3. Apply the SQL migrations in `supabase/migrations/` to your Supabase project, in order (via the Supabase CLI's `supabase db push`, or paste each file into the SQL editor in order).

4. Generate database types once the schema is live:

   ```bash
   supabase gen types typescript --project-id <id> > lib/types/database.ts
   ```

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
  (app)/         # authenticated routes: dashboard, projects, roadmap, new-skill
  (auth)/        # sign-in, sign-up
  api/
    auth/        # signin, signup, signout route handlers
    roadmap/     # generate route handler (Gemini)
components/      # feature-organized UI components (auth, dashboard, roadmap, projects, onboarding, shared, ui)
lib/
  domain/        # domain logic
  gemini/        # Gemini client + prompting
  queries/       # TanStack Query hooks
  server/        # server-only helpers
  stores/        # Zustand stores
  supabase/      # Supabase client setup
  types/         # generated + hand-written types
  validations/   # zod schemas
supabase/
  migrations/    # ordered SQL migrations
architecture/    # architecture plan and design docs
```
