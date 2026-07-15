# Frontend Architecture

## 1. Routing (App Router)

The prototype drives everything off a single `page` state string. Next.js gets real segments instead — same four screens, plus auth:

```
app/
  (auth)/
    layout.tsx              -- centered, no sidebar
    sign-in/page.tsx
    sign-up/page.tsx
  (app)/
    layout.tsx               -- sidebar + main shell, requires session (middleware-enforced)
    dashboard/
      page.tsx                -- redirects to dashboard/[most-recently-active projectId]
      [projectId]/page.tsx
    roadmap/
      [projectId]/page.tsx
    projects/
      [projectId]/page.tsx
    new-skill/
      page.tsx                -- no projectId; creates one on submit
  layout.tsx                  -- root: fonts, ThemeProvider, QueryClientProvider
  globals.css
  api/
    auth/
      signup/route.ts
      signin/route.ts
    roadmap/
      generate/route.ts
middleware.ts                 -- session refresh + auth gate on (app)/*
```

`[projectId]` in the URL replaces the prototype's `activeSkillProjectId` state — makes the current view shareable/bookmarkable and gives back/forward the correct behavior. The sidebar's skill-project list links directly to `/dashboard/[id]`. If a user hits a bare `/dashboard`, `/roadmap`, or `/projects` with no id, redirect server-side to the most recently active project (tracked in `user_settings` or simply "most recently created" as a fallback), or to `new-skill` if the user has none — this is the server-rendered equivalent of the prototype's empty-state logic.

## 2. State management split

Strict boundary, two tools, non-overlapping responsibilities:

**Zustand — client-only UI state, never server data.**
```
lib/stores/ui-store.ts
  theme: 'indigo_ink' | 'graphite_gold' | 'emerald_slate'
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  setTheme(theme), toggleSidebarCollapsed(), setMobileNavOpen(open)
```
- `theme` and `sidebarCollapsed` are also persisted to `user_settings` server-side (§backend doc) for cross-device consistency; the Zustand `persist` middleware still mirrors them to `localStorage` as the instant-hydration fallback so there's no flash-of-default-theme before the server value loads. On login, a one-time query hydrates the store from `user_settings` and overwrites the localStorage guess if they differ.
- `mobileNavOpen` is pure ephemeral UI state, never persisted anywhere.
- Deliberately **not** in Zustand: `activeSkillProjectId` (that's the URL param now), skill project/phase/topic/portfolio data (that's TanStack Query), delete-confirmation target (local `useState` in the dialog trigger, doesn't need to be global).

**TanStack Query — all server data.**
```
lib/queries/
  skill-projects.ts    -- useSkillProjects() (sidebar list), useSkillProject(projectId) (full detail: phases+topics+portfolioProjects, joined)
  dashboard.ts         -- useDashboardStats(projectId) -- derived from useSkillProject's data via a selector, not a separate fetch
  mutations.ts         -- useToggleTopic(), useCycleProjectStatus(), useDeleteSkillProject(), useCreateSkillProjectFromAI()
lib/query-keys.ts      -- centralized key factory: skillProjects.all(), skillProjects.detail(id), etc.
```
- Reads call the Supabase browser client directly inside the query function (`supabase.from('skill_projects').select(...)`) — RLS does the access control, no route handler needed.
- `useSkillProject(projectId)` does one query with nested selects (`phases(*, topics(*))`, `portfolio_projects(*, portfolio_project_phases(phase_id))`) rather than waterfalling — one round trip for the whole dashboard/roadmap/projects view.
- Mutations call the RPC functions from the backend doc (`toggle_topic_done`, `cycle_portfolio_project_status`, `delete_skill_project`) and use **optimistic updates** via `onMutate` (flip the checkbox / cycle the pill instantly in the query cache) with rollback in `onError` — this reproduces the prototype's "updates live" feel without waiting on a round trip. `onSettled` invalidates the query to reconcile with the server's recomputed phase-status/streak.
- `useCreateSkillProjectFromAI()` posts to `/api/roadmap/generate` (needs the rate-limit + secret-key hop server-side), then on success invalidates `skillProjects.all()` and the caller navigates to `/dashboard/[newId]`.

## 3. Component structure

```
components/
  ui/                              -- shadcn primitives (button, card, badge, dialog, select,
                                       progress, sheet, input, textarea, tooltip...) — generated,
                                       not hand-rolled
  layout/
    app-sidebar.tsx                -- composes nav + skill-project list + new-skill button;
                                       reads sidebarCollapsed/mobileNavOpen from ui-store
    sidebar-nav-item.tsx           -- Dashboard/Roadmap/Projects link, icon + label
    sidebar-skill-project-item.tsx -- icon tile, name, mini progress bar, delete trigger
    mobile-top-bar.tsx             -- sticky bar, hamburger, shown < 760px
    mobile-drawer.tsx              -- shadcn Sheet wrapping app-sidebar for the mobile case
    theme-switcher.tsx             -- reads/writes ui-store.theme
    delete-project-dialog.tsx      -- shadcn Dialog, confirm copy, calls useDeleteSkillProject
  dashboard/
    stat-row.tsx                   -- grid of stat-tile
    stat-tile.tsx
    activity-heatmap.tsx           -- year grid + legend; owns the horizontal scroll wrapper
    heatmap-cell.tsx
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
                                       treatments: dashboard's simple list vs roadmap's wrapping multi-col)
    topic-checkbox-item.tsx
    fraction-badge.tsx
    status-pill.tsx                -- shared visual for phase status + portfolio project status;
                                       optional onClick to support the cycling behavior
    mini-progress-bar.tsx
    section-label.tsx
    empty-state.tsx
auth/
  sign-in-form.tsx
  sign-up-form.tsx
```

Sharing `phase-watermark-number`, `topic-checklist`, and `status-pill` between Dashboard and Roadmap (and Projects, for `status-pill`) mirrors the prototype's own reuse of these visual patterns across screens — keep them prop-driven rather than forking per-page copies.

## 4. Styling / theming

- Tailwind for layout/spacing/typography utilities.
- The 3-theme palette (§design tokens in the handoff) is implemented as CSS custom properties set on `:root` by a `ThemeProvider` client component that reads `ui-store.theme` and writes `--sidebar-bg`, `--main-bg`, `--accent`, `--accent-soft`, `--card-border` (plus the derived heatmap tint stops). shadcn components and Tailwind config both reference these variables (`bg-[var(--accent)]` or mapped into `tailwind.config` theme extension) rather than hardcoding hex per component — this is what makes the theme switcher a single state change instead of a conditional in every component.
- Status colors (complete/in-progress/not-started) are **not** theme variables — fixed hex per the spec, defined once in `status-pill.tsx` or a shared constants file, same across all three palettes.
- Fonts via `next/font/google`: Manrope (headings/wordmark, 600-800), Inter (body/UI, 400-600), JetBrains Mono (stats/fractions/dates, 500-600) — loaded once in the root layout, exposed as CSS variables, mapped in Tailwind config.

## 5. Responsive / sidebar behavior

- Sidebar collapse (232px ↔ 68px) is a desktop-only CSS/state toggle (`ui-store.sidebarCollapsed`), irrelevant below the 760px breakpoint where it's replaced entirely by the drawer pattern.
- Below 760px: `app-sidebar` is not rendered inline; `mobile-drawer` (shadcn `Sheet`, slide from left, backdrop) renders it instead, toggled by `mobile-top-bar`'s hamburger. Auto-close (`setMobileNavOpen(false)`) on every route navigation — a `usePathname()` effect in the `(app)` layout, since navigation is now real routing rather than a state change the prototype could hook directly.
- Dashboard two-column grid (`1.35fr 1fr`) collapses to one column via a Tailwind responsive class (`grid-cols-1 lg:grid-cols-[1.35fr_1fr]`), matching the 760px breakpoint used elsewhere — define it once as a Tailwind custom breakpoint (e.g. `mobile: '760px'`) rather than repeating the raw value.

## 6. Forms / validation

- `new-skill-form.tsx`, `sign-in-form.tsx`, `sign-up-form.tsx` use `react-hook-form` + a Zod resolver, with the **same Zod schemas** the corresponding route handler validates with (shared module under `lib/validations/`, imported by both client and server) — one source of truth for field rules (username pattern, password length, timeline enum), no drift between client and server validation.
- "Generate roadmap with AI" button disabled state (until name entered) is plain `formState.isValid`/watched-field logic, no extra state needed.

## 7. Data flow summary (topic toggle, as the representative case)

1. User clicks a `topic-checkbox-item`.
2. `useToggleTopic().mutate(topicId)` fires.
3. `onMutate`: cache for `skillProjects.detail(projectId)` is optimistically patched (topic flipped, phase status/progress recomputed client-side with the same rules as the DB function, stat row reflows immediately) — this client-side recompute logic is a small pure function shared conceptually with the DB function's rules, kept in `lib/domain/phase-status.ts` so dashboard stats can also derive from it without a round trip.
4. Supabase RPC `toggle_topic_done` runs server-side, is the actual source of truth.
5. `onSuccess`/`onSettled`: invalidate the query; the optimistic guess is replaced by the server's real recomputed state (handles edge cases like the last topic in the last phase completing the whole roadmap, which the client-side shortcut doesn't need to special-case perfectly since it's immediately reconciled).
