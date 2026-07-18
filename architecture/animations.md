# Animation Plan

Status: proposal, not approved.
Scope: dashboard cards + app-wide micro-interactions.

## Current state

Stack: Next 16.2.10 (custom fork, see AGENTS.md), React 19.2.4, Tailwind v4, `tw-animate-css` already imported in [app/globals.css](app/globals.css:2).
No Framer Motion or GSAP installed today.
Components in scope: [components/dashboard](components/dashboard), [components/projects](components/projects), [components/roadmap](components/roadmap), [components/shared](components/shared), [components/layout](components/layout).
Design tokens live in `app/globals.css` as `--wp-*` CSS vars, consumed via Tailwind's `--color-wp-*` bridge.

## Library choice

Recommend **Framer Motion** (package `motion`), not GSAP.

Reasons:
- Declarative, React-first API fits existing component style (small functional components, no imperative refs needed).
- Built-in `layout` prop handles list reflow (phase lists, project cards) without manual FLIP code.
- Tree-shakeable; only animate what's mounted.
- GSAP is stronger for complex timelines/SVG/scroll-scrubbing — not needed here. This app is cards, lists, counters, page transitions: Framer Motion's sweet spot.
- Next 16 custom fork: check `node_modules/next/dist/docs/` for any changed transition/streaming behavior before wiring page-transition animations, since AGENTS.md flags breaking changes vs stock Next.

Package to add: `motion` (the renamed `framer-motion` package, current major).

## Principles

- Respect `prefers-reduced-motion` globally (wrap in a shared `MotionConfig reducedMotion="user"` at root layout).
- Animate only `transform` and `opacity` — never `width`/`height`/`top`/`left` — to stay on the compositor thread.
- Durations: 120-200ms for hover/tap micro-feedback, 200-320ms for entrance/exit, nothing above 400ms.
- Easing: standard `easeOut` for entrances, `easeInOut` for state changes.
- No animation should block interactivity (no `await` on animation before allowing next click).

## Phase 1 — Foundation

1. `npm install motion`.
2. Add `MotionConfig` (reduced-motion aware) in root layout (`app/(app)/layout.tsx` or wherever the shared shell lives).
3. Define a small `lib/motion/variants.ts` with shared variants: `fadeInUp`, `scaleIn`, `staggerContainer` — so every component pulls from one source instead of ad hoc numbers.

## Phase 2 — Dashboard cards

Target files: [components/dashboard/stat-tile.tsx](components/dashboard/stat-tile.tsx), [stat-row.tsx](components/dashboard/stat-row.tsx), [progress-card.tsx](components/dashboard/progress-card.tsx), [current-phase-card.tsx](components/dashboard/current-phase-card.tsx), [portfolio-summary-list.tsx](components/dashboard/portfolio-summary-list.tsx), [all-phases-list.tsx](components/dashboard/all-phases-list.tsx), [phase-row.tsx](components/dashboard/phase-row.tsx).

- **Entrance**: stagger-fade-up on first mount (dashboard load), via `staggerContainer` on the list wrapper + `fadeInUp` per child.
- **Hover**: subtle lift (`scale: 1.015`, shadow increase) on `stat-tile`, `progress-card`, `current-phase-card`. Use `whileHover`/`whileTap`, no JS state needed.
- **Value change**: when a stat value updates (e.g. after a mutation), animate the number with a short count-up/cross-fade rather than a hard swap — use `AnimatePresence mode="popLayout"` keyed by value, or a numeric tween via `useSpring`/`useTransform` from `motion`.
- **Progress bars/circular progress** ([components/shared/circular-progress.tsx](components/shared/circular-progress.tsx), [mini-progress-bar.tsx](components/shared/mini-progress-bar.tsx)): animate stroke/width from 0 to target on mount and on value change, not just CSS `transition` (more control over easing + respects reduced motion via the shared config).
- **List reflow**: `phase-row.tsx` / `all-phases-list.tsx` items get `layout` prop so add/remove/reorder animates position instead of jumping.

## Phase 3 — App-wide

- **Route/page transitions**: fade+slight-slide on route change for `app/(app)/*` segments. Needs checking how this Next fork handles transitions (App Router transition APIs may differ per AGENTS.md warning) before implementing — read the relevant fork doc first.
- **Sidebar** ([components/layout/app-sidebar.tsx](components/layout/app-sidebar.tsx), [mobile-drawer.tsx](components/layout/mobile-drawer.tsx)): slide/fade for mobile drawer open-close (`AnimatePresence` + `motion.div` instead of current CSS-only approach, if any); active nav item indicator animates position (`layoutId` shared element) instead of snapping between [sidebar-nav-item.tsx](components/layout/sidebar-nav-item.tsx) entries.
- **Dialogs/Sheets** ([components/ui/dialog.tsx](components/ui/dialog.tsx), [sheet.tsx](components/ui/sheet.tsx)): these likely already use Radix/base-ui + `tw-animate-css` CSS animations. Leave as-is unless inconsistent with new Framer-driven motion elsewhere — don't run two animation systems for the same primitive.
- **Project cards** ([components/projects/project-card.tsx](components/projects/project-card.tsx)): hover lift + entrance stagger, same treatment as dashboard cards.
- **Checklist interactions** ([components/shared/topic-checkbox-item.tsx](components/shared/topic-checkbox-item.tsx), [topic-checklist.tsx](components/shared/topic-checklist.tsx)): checkbox check animates (scale+opacity on the check icon), row fades/collapses on complete.
- **Status pill / fraction badge** ([status-pill.tsx](components/shared/status-pill.tsx), [fraction-badge.tsx](components/shared/fraction-badge.tsx)): cross-fade on status change instead of instant repaint.
- **Toasts / empty states**: entrance animation on [empty-state.tsx](components/shared/empty-state.tsx) when a list transitions to empty.

## Phase 4 — Polish pass

- Audit for double-animation (element animating via both CSS transition and Framer Motion simultaneously).
- Verify `prefers-reduced-motion` actually disables all of the above (manual OS toggle test).
- Perf check: no layout thrash, no dropped frames on dashboard with full card set (Chrome DevTools performance recording) — deferred until user says testing is in scope, per standing instruction not to spend tokens on browser/localhost testing until told.

## Explicitly out of scope for v1

- GSAP (not needed, adds a second animation runtime for no benefit here).
- Scroll-triggered/scrubbing animations.
- Custom physics/spring tuning beyond `motion`'s defaults, unless something looks off.

## Open questions for approval

1. OK to add `motion` as a new dependency?
2. Confirm dashboard-first rollout (Phase 2) before touching sidebar/dialogs/app-wide (Phase 3)?
3. Any specific interaction the user already has in mind that isn't listed above?
