# Frontend Architecture

## 1. Routing (App Router)

```
app/
  page.tsx                     -- redirect("/dashboard")
  layout.tsx                   -- root: fonts, ThemeProvider, QueryProvider
  globals.css
  (auth)/
    layout.tsx                 -- centered, no sidebar
    sign-in/page.tsx
    sign-up/page.tsx
  (app)/
    layout.tsx                 -- SERVER COMPONENT auth gate: calls supabase.auth.getUser(),
                                   redirect("/sign-in") if absent; renders AppSidebar (desktop) /
                                   MobileTopBar + MobileDrawer (mobile)
    dashboard/
      page.tsx                 -- redirects to dashboard/[activeProjectId], or /new-skill if none
      [projectId]/page.tsx
    roadmap/
      page.tsx                 -- redirects to roadmap/[activeProjectId], or /new-skill if none
      [projectId]/page.tsx
    projects/
      page.tsx                 -- redirects to projects/[activeProjectId], or /new-skill if none
      [projectId]/page.tsx
    new-skill/
      page.tsx                 -- no projectId; creates one on submit
  api/
    auth/
      signup/route.ts
      signin/route.ts
      signout/route.ts
    roadmap/
      generate/route.ts
```

There is **no `middleware.ts`** in this repo. Session refresh + the auth gate on `(app)/*` both happen inside `app/(app)/layout.tsx`, which is a server component — not a middleware chain.

`[projectId]` in the URL is the source of truth for "which skill project is active" — no client-side `activeSkillProjectId` state. The sidebar's skill-project list links directly to `/dashboard/[id]`. Bare `/dashboard`, `/roadmap`, `/projects` redirect server-side via `lib/server/active-project.ts`'s `getActiveProjectId()` (most-recently-created skill project for the user), or to `/new-skill` if the user has none.

## 2. State management split

Strict boundary, two tools, non-overlapping responsibilities.

**Zustand — client-only UI state (`lib/stores/ui-store.ts`), `persist` middleware, localStorage key `waypoint-ui-store`:**
```
theme: 'indigo_ink' | 'graphite_gold' | 'emerald_slate'
sidebarCollapsed: boolean
mobileNavOpen: boolean
setTheme(theme), toggleSidebarCollapsed(), setMobileNavOpen(open)
```
- Only `theme` and `sidebarCollapsed` are persisted to `localStorage`; `mobileNavOpen` is pure ephemeral state.
- A `user_settings` table exists in Supabase with matching `theme`/`sidebar_collapsed` columns (created by the signup trigger), but **nothing in `lib/queries/` currently reads from or writes to it** — localStorage via Zustand is the actual, sole source of truth today. Cross-device theme sync is not implemented despite the schema supporting it; see [`architecture/README.md`](./README.md).
- Deliberately **not** in Zustand: `activeSkillProjectId` (the URL param), skill project/phase/topic/portfolio data (TanStack Query), delete-confirmation target (local `useState` in the dialog trigger).

**TanStack Query — all server data:**
```
lib/queries/
  skill-projects.ts     -- useSkillProjects() (sidebar list), useSkillProject(projectId)
                            (full detail: phases+topics+portfolioProjects, joined),
                            withComputedPhaseStatus() helper
  dashboard.ts          -- useDashboardStats(projectId) -- derived from useSkillProject's data
                            via computeDashboardStats(), not a separate fetch
  mutations.ts          -- useToggleTopic(), useCycleProjectStatus(), useDeleteSkillProject(),
                            useCreateSkillProjectFromAI() (+ RoadmapGenerationError class)
  ai-generations.ts     -- useAiGenerationUsage() -- remaining-quota UI, mirrors the
                            2-per-24h server rule client-side (DAILY_GENERATION_LIMIT = 2)
lib/query-keys.ts       -- centralized key factory: skillProjects.all(), skillProjects.detail(id), etc.
```
- Reads call the Supabase browser client directly inside the query function — RLS does the access control, no route handler needed.
- `useSkillProject(projectId)` does one query with nested selects (`phases(*, topics(*))`, `portfolio_projects(*, portfolio_project_phases(phase_id))`) — one round trip for the whole dashboard/roadmap/projects view.
- Mutations call the RPC functions from the backend doc (`toggle_topic_done`, `cycle_portfolio_project_status`, `delete_skill_project`) and use **optimistic updates** via `onMutate` (flip the checkbox / cycle the pill instantly in the query cache) with rollback in `onError`. `onSettled` invalidates the query to reconcile with the server's recomputed phase-status.
- `useCreateSkillProjectFromAI()` posts to `/api/roadmap/generate` (needs the rate-limit/project-cap/secret-key hop server-side), then on success invalidates `skillProjects.all()` and the caller navigates to `/dashboard/[newId]`.

## 3. Component structure

```
components/
  ui/                              -- shadcn v4 primitives (badge, button, card, dialog, input,
                                       label, progress, select, sheet, spinner, textarea, tooltip) —
                                       generated via shadcn CLI, not hand-rolled
  layout/
    app-sidebar.tsx                -- composes nav + skill-project list + new-skill button;
                                       reads sidebarCollapsed/mobileNavOpen from ui-store
    sidebar-nav-item.tsx           -- Dashboard/Roadmap/Projects link, icon + label
    sidebar-skill-project-item.tsx -- icon tile, name, mini progress bar, delete trigger
    mobile-top-bar.tsx             -- sticky bar, hamburger, shown below the mobile breakpoint
    mobile-drawer.tsx              -- shadcn Sheet wrapping app-sidebar for the mobile case
    theme-provider.tsx             -- sets document.documentElement.dataset.theme from ui-store.theme
    theme-switcher.tsx             -- 3 colored dot buttons, reads/writes ui-store.theme
    delete-project-dialog.tsx      -- shadcn Dialog, confirm copy, calls useDeleteSkillProject
    logout-button.tsx              -- posts to /api/auth/signout
    query-provider.tsx             -- TanStack QueryClientProvider wrapper
  dashboard/
    stat-row.tsx                   -- grid of stat-tile
    stat-tile.tsx
    progress-card.tsx              -- overall progress card (wraps circular-progress)
    current-phase-card.tsx         -- watermark number + checklist + fraction badge + arrow-to-roadmap
    all-phases-list.tsx
    phase-row.tsx                  -- compact row: number, name, mini progress, fraction, status pill
    portfolio-summary-list.tsx     -- compact right-column list
  roadmap/
    phase-card.tsx                 -- full card: watermark, header, progress bar, wrapping checklist
  projects/
    project-card.tsx
    project-index-number.tsx       -- large muted monospace 01/02/...
    linked-phase-chips.tsx         -- "Phase N — ShortName" chips back to roadmap
  onboarding/
    new-skill-form.tsx
    generating-overlay.tsx         -- spinner + "Generating your roadmap…" while the mutation is pending
  shared/
    phase-watermark-number.tsx     -- shared by dashboard current-phase-card + roadmap phase-card
    topic-checklist.tsx            -- shared by dashboard + roadmap (layout prop for the two column
                                       treatments)
    topic-checkbox-item.tsx
    fraction-badge.tsx
    status-pill.tsx                -- shared visual for phase status + portfolio project status;
                                       optional onClick to support the cycling behavior
    mini-progress-bar.tsx
    circular-progress.tsx          -- used by dashboard/progress-card
    section-label.tsx
    empty-state.tsx
  auth/
    sign-in-form.tsx
    sign-up-form.tsx               -- username + password only, no email field
```

Sharing `phase-watermark-number`, `topic-checklist`, and `status-pill` across Dashboard/Roadmap/Projects keeps them prop-driven rather than forked per-page copies.

## 4. Styling / theming

- Tailwind CSS v4 for layout/spacing/typography utilities (`@tailwindcss/postcss`).
- The 3-theme palette is CSS custom properties set on `:root[data-theme="..."]` in `app/globals.css`, toggled by `theme-provider.tsx` writing `document.documentElement.dataset.theme` from `ui-store.theme`. Variables: `--wp-sidebar-bg`, `--wp-main-bg`, `--wp-accent`, `--wp-accent-soft`, `--wp-card-border` (indigo_ink is the base `:root` block; `graphite_gold` and `emerald_slate` are override blocks). shadcn components and Tailwind reference these variables rather than hardcoding hex per component.
- Status colors (complete/in-progress/not-started) are **not** theme variables — fixed hex, defined in `status-pill.tsx`, same across all three palettes.
- Fonts via `next/font/google`, loaded once in the root layout and exposed as CSS variables: `--font-inter` (body/UI), `--font-manrope` (headings/wordmark), `--font-jetbrains-mono` (stats/fractions/dates). Base document font-size is fixed at `15px` (`app/globals.css`, `@layer base`).
- shadcn/ui is v4, built on `@base-ui/react` primitives (not the older Radix-based shadcn stack).

## 5. Responsive / sidebar behavior

- Sidebar collapse is a desktop-only Zustand toggle (`ui-store.sidebarCollapsed`), replaced below the mobile breakpoint by the drawer pattern.
- Below the mobile breakpoint: `app-sidebar` is not rendered inline; `mobile-drawer` (shadcn `Sheet`, slide from left) renders it instead, toggled by `mobile-top-bar`'s hamburger button, driven by `ui-store.mobileNavOpen`.
- Dashboard's two-column grid collapses to one column at the same breakpoint via a Tailwind responsive class.

## 6. Forms / validation

- `new-skill-form.tsx`, `sign-in-form.tsx`, `sign-up-form.tsx` use `react-hook-form` + `@hookform/resolvers`' Zod resolver, sharing the **same Zod schemas** the corresponding route handler validates with (`lib/validations/auth.ts`, `lib/validations/new-skill.ts`) — one source of truth for field rules (username pattern, password length, timeline enum), no drift between client and server validation.
- `sign-up-form.tsx` collects only `username` + `password` — no email field anywhere in the UI (see backend doc §5).
- "Generate roadmap with AI" button disabled state (until name entered) is plain `formState.isValid`/watched-field logic.

## 7. Data flow summary (topic toggle, as the representative case)

1. User clicks a `topic-checkbox-item`.
2. `useToggleTopic().mutate(topicId)` fires.
3. `onMutate`: cache for `skillProjects.detail(projectId)` is optimistically patched (topic flipped, phase status/progress recomputed client-side via `lib/domain/phase-status.ts`, which hand-mirrors the DB function's rules) — stat row reflows immediately.
4. Supabase RPC `toggle_topic_done` runs server-side, is the actual source of truth, and also logs today's activity in `activity_log` (currently unread by any UI).
5. `onSuccess`/`onSettled`: invalidate the query; the optimistic guess is replaced by the server's real recomputed state, handling edge cases (e.g. the last topic in the last phase completing the whole roadmap) the client-side shortcut doesn't special-case.

## 8. AI generation flow (new-skill, as the second representative case)

1. User fills `new-skill-form.tsx` (name, goal, level, timelineMonths) and submits.
2. `useCreateSkillProjectFromAI().mutate(...)` posts to `/api/roadmap/generate`; `generating-overlay.tsx` renders while the mutation is pending — real Gemini latency (no fixed timer), not a fake spinner.
3. Route handler: auth check → validate input → project-count check (max 4) → rate-limit RPC → build prompt → call Gemini with structured output + retry → validate response shape → persist via `create_skill_project_from_ai` → return `skillProjectId`.
4. On error, `RoadmapGenerationError` (from `lib/queries/mutations.ts`) carries the route's error code (`rate_limited`, `project_limit_reached`, `generation_unavailable`, `generation_failed`, etc.) so the form can show a specific message (e.g. remaining-quota countdown using the `retryAt` from a 429).
5. On success, invalidate `skillProjects.all()` and navigate to `/dashboard/[newId]`.
