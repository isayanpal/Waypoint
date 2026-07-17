# Waypoint — Architecture Overview

Personal learning-roadmap platform.
Multi-user web app: users sign up with a username, describe a skill goal, get an AI-generated phase-by-phase roadmap, and track progress across multiple "skill projects."

This app grew from an initial prototype/design spec into a production Next.js + Supabase app. See the two detail docs below for schema/route/component specifics.

## Stack (as built)

| Concern | Choice |
|---|---|
| Language | TypeScript |
| Database / Auth | Supabase (Postgres + Supabase Auth + RLS) |
| Framework | Next.js 16 (App Router), React 19 |
| UI components | shadcn/ui v4 (@base-ui/react) + Tailwind CSS v4 |
| Client state | Zustand (`persist` middleware, UI-only state) |
| Server state / data fetching | TanStack Query |
| AI roadmap generation | Google Gemini API (`@google/genai`, `gemini-flash-lite-latest`, structured JSON output) |
| Deployment | Vercel |
| Rate limiting | DB-based (Postgres log table + count check), 2 AI generations / rolling 24h / user, no external service |
| Auth method | Username + password only. No user-facing email, no password-reset flow. |
| Project cap | 4 skill projects per user, enforced server-side in the generate route |
| Tenancy | Standard multi-user, row-level isolation per `auth.uid()` |

## Docs in this folder

- [`backend-architecture.md`](./backend-architecture.md) — Supabase schema, RLS, auth flow, Gemini integration, DB functions, rate limiting, API route inventory.
- [`frontend-architecture.md`](./frontend-architecture.md) — Next.js route structure, component tree, Zustand vs TanStack Query boundary, theming, responsive/sidebar behavior.

## Key decisions and departures from the original plan

1. **Real routing, no client-side `page` state.** Routes: `/dashboard/[projectId]`, `/roadmap/[projectId]`, `/projects/[projectId]`, `/new-skill` — proper browser history, shareable URLs.
2. **Server-owned data, not localStorage.** All skill-project data (phases, topics, portfolio projects) lives in Postgres, scoped per user via RLS. TanStack Query is the client-side source of truth for server data.
3. **AI generation is a real backend call.** A rate-limited Next.js route handler calls Gemini with structured/JSON-mode output, validates the response with Zod, and writes the roadmap atomically via a Postgres function.
4. **Username-only auth, no email collected from users.** Supabase Auth is email-keyed internally, so signup synthesizes a placeholder address (`{username}@users.waypoint.internal`) that the user never sees. Sign-in resolves username → internal email via a service-role lookup, then calls `signInWithPassword`. This replaced an earlier "email or username" plan — see the backend doc §5.
5. **Auth gating lives in a server component, not middleware.** `app/(app)/layout.tsx` calls `supabase.auth.getUser()` and redirects unauthenticated users; there is no `middleware.ts` in this repo.
6. **A 4-project-per-user cap** is enforced in `/api/roadmap/generate` alongside the generation rate limit — not part of the original plan, added to bound per-user storage/AI usage.

## Known gaps between schema and wired UI

These exist in the database but aren't currently read by any component — flagged here so they aren't mistaken for bugs:

- `activity_log` is written to by `toggle_topic_done` (one row/day per skill project, incrementing `weight`) but nothing renders a heatmap or streak from it. `skill_projects.streak` was removed entirely (migration `0012_drop_skill_projects_streak.sql`).
- `user_settings` (`theme`, `sidebar_collapsed`) is created by the signup trigger but never read or written by the client — theme and sidebar state live entirely in the Zustand store, persisted to `localStorage`, not synced to Supabase.
- `lib/types/database.ts` is an un-generated placeholder (`export type Database = any`) — run `supabase gen types typescript` to get real types.
