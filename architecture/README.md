# Waypoint — Architecture Plan

Personal learning-roadmap platform.
Multi-user web app: users sign up, describe a skill goal, get an AI-generated phase-by-phase roadmap, and track progress across multiple "skill projects."

Source design spec: `design_handoff_waypoint/README.md` + `waypoint-design.dc.html` (clickable HTML prototype).
This plan translates that prototype into a production Next.js + Supabase app. It does not contain implementation code — see the two detail docs below.

## Stack decisions (confirmed)

| Concern | Choice |
|---|---|
| Language | TypeScript |
| Database / Auth | Supabase (Postgres + Supabase Auth + RLS) |
| Framework | Next.js (App Router) |
| UI components | shadcn/ui + Tailwind |
| Client state | Zustand (UI-only state) |
| Server state / data fetching | TanStack Query |
| AI roadmap generation | Google Gemini API |
| Deployment | Vercel |
| Rate limiting | DB-based (Postgres log table + count check), 2 AI generations / rolling 24h / user, no external service |
| Auth method | Email or username + password. No password-reset flow in v1. |
| Tenancy | Standard multi-user, row-level isolation per `auth.uid()` |

## Docs in this folder

- [`backend-architecture.md`](./backend-architecture.md) — Supabase schema, RLS, auth flow (username-or-email sign-in), Gemini integration, DB functions, rate limiting, API route inventory.
- [`frontend-architecture.md`](./frontend-architecture.md) — Next.js route structure, component tree, Zustand vs TanStack Query boundary, theming, responsive/sidebar behavior.

## Key departures from the prototype (and why)

1. **Real routing instead of a `page` state string.** The prototype is a single-page app with a JS variable for "current page." Next.js gets real routes (`/dashboard/[projectId]`, `/roadmap/[projectId]`, etc.) — proper browser history, shareable URLs, no behavior lost.
2. **Server-owned data instead of localStorage.** Every entity the prototype kept in `localStorage` (skill projects, phases, topics, portfolio projects, theme, streak) moves to Postgres, scoped per user via RLS. TanStack Query replaces the prototype's in-memory state object as the source of truth on the client.
3. **AI generation is a real backend call**, not a 1.4s fake spinner — a rate-limited Next.js route handler calls Gemini, validates the structured response, and writes the roadmap atomically via a Postgres function.
4. **Username sign-in requires a resolve step.** Supabase Auth is email-keyed. Signing in "by username" needs a server-side lookup (username → email) before calling `signInWithPassword`. Detailed in the backend doc.

## Open items to confirm before/while building

- Exact Gemini model + whether to use its structured/JSON-mode output (recommended) vs. free-text parsing.
- Whether skill/topic/portfolio-project edits are ever needed post-generation (manual edit UI), or v1 is generate-once + checklist/status toggling only, per the prototype's scope. Current plan assumes the latter.
- Email verification requirement on signup (Supabase supports it out of the box; adds a "check your email" step to the UX). Not yet decided — flagged in backend doc.
