# Implementation Plan: Swiss Stage Horizontal Layout Redesign

**Branch**: `002-swiss-horizontal-layout` | **Date**: 2025-10-23 | **Spec**: [spec.md](spec.md)  
**Input**: Clarified feature spec stored at `/specs/002-swiss-horizontal-layout/spec.md`

---

## 1. Summary

Modernise the Swiss stage experience into a horizontally scrolling timeline. Each Swiss round appears as a column with card-styled record groups that list horizontal match rows (`Team A vs Team B`). Qualified and eliminated teams surface in a results column, followed seamlessly by the knockout bracket. Navigation info moves to a sticky top bar while simulation controls (draw algorithm selector, next round, reset) relocate to a sticky bottom bar. Round simulation is now a two-step interaction: show the round preview, play a hype animation, then reveal winners.

---

## 2. Technical Context

- **Stack**: Vite + React 19 + TypeScript 5.9, Tailwind CSS 4, Vitest/RTL, Playwright (existing harnesses).  
- **Architecture**: Clean Architecture; only the presentation layer changes. Domain/application logic stays intact.  
- **Relevant Modules**:
  - `src/presentation/components/swiss/*` – Swiss stage components.
  - `src/presentation/pages/TournamentPage.tsx` – assembles Swiss + knockout views.  
  - `src/application/hooks/useTournament.ts` – provides tournament state/actions.  
  - `src/domain/entities/*` – match and team models (read only).  
- **Constraints**: Maintain dark/light theming via CSS variables, WCAG AA contrast, keyboard and touch navigation, no new dependencies without review.  
- **Animation**: Prefer CSS transitions/animations; if a helper library is required, justify during implementation (likely not needed).

---

## 3. Constitution Check (Revalidated)

| Principle | Status | Notes |
|-----------|--------|-------|
| Clean Architecture layering | ✅ | Presentation changes only; domain/application untouched. |
| Theme adherence | ✅ | Use existing CSS variable palette; new bars/groups reuse Tailwind with `rgb(var(--color-*)))`. |
| React best practices | ✅ | Functional components, hooks for state/effects, memoisation where useful, custom hooks for scroll/animation. |
| Accessibility baseline | ✅ | Respect ARIA roles, focus management, keyboard access, reduced-motion fallback for animations. |

No constitution blockers detected.

---

## 4. Open Questions / Assumptions

- Animation style unspecified beyond “hype”; default plan uses CSS keyframes (scale + glow) with reduced-motion fallback.  
- Knockout bracket stays functionally identical, only repositioned within horizontal flow.  
- Drag-and-drop work (spec 003) is out of scope for this feature branch.

---

## 5. Implementation Strategy

### Phase 0 – Discovery & Setup
1. Audit existing Swiss UI components and styles (SwissStage, MatchCard, TeamCard, navigation controls).  
2. Catalogue reusable logic (winner highlighting, matchcards) vs items to refactor/remove.  
3. Identify any shared layout helpers that can host sticky bars.  
**Deliverables**: Notes appended to `research.md`.

### Phase 1 – Data & Interface Design
1. Define view-model helpers for Swiss matches with resolved team entities.  
2. Update `data-model.md` with horizontal timeline structure (round → record groups → horizontal rows).  
3. Document animation states and control flow in `quickstart.md`.  
**Deliverables**: Updated documentation artifacts describing UI and hook contracts.

### Phase 2 – Core Layout Refactor
1. Create/refresh `SwissStageHorizontal.tsx` as the primary container (if already present, refactor to new spec).  
2. Implement sticky top info bar placeholder, horizontal scroll container, and record group mapping using new card styling.  
3. Update `RoundColumn.tsx` to remove outer borders, adjust padding, add focus handling.  
4. Update `RecordGroup.tsx` to render horizontal `MatchRow` layout with card border, header, and gap spacing.  
**Files**: `src/presentation/components/swiss/SwissStageHorizontal.tsx`, `RoundColumn.tsx`, `RecordGroup.tsx`.

### Phase 3 – Match Row Presentation
1. Introduce `MatchRow.tsx` (or adapt `MatchCard.tsx`) to render horizontal `TeamCard` instances with central VS chip; ensure record not repeated.  
2. Ensure responsiveness (stack vertically on narrow screens).  
3. Validate keyboard/tab order: header → match rows; ensure `onVsClick` still fires.  
**Files**: `MatchCard.tsx` (rename?)/new component, `TeamCard.tsx` (styling adjustments if necessary).

### Phase 4 – Navigation & Control Bars
1. Split responsibilities: top bar = read-only info; bottom bar = controls.  
2. Build `SwissInfoBar.tsx` (top) and `SwissControlBar.tsx` (bottom).  
3. Integrate both inside `SwissStageHorizontal`, add sticky positioning and responsive layout (bottom bar spans width with left/right content).  
4. Wire control bar to `simulateRound`, `resetTournament`, and draw algorithm setter passed from `TournamentPage`.  
**Files**: `SwissNavigation.tsx` (rename/split), `TournamentPage.tsx`, new `SwissControlBar.tsx`.

### Phase 5 – Results Column & Knockout Integration
1. Ensure results column aligns with new card style and sits after final round.  
2. Mount knockout bracket container within horizontal scroll as final column; ensure min-width and spacing align with new design.  
3. Remove legacy vertical knockout section from page (already partially done) and confirm state flows correctly.  
**Files**: `ResultsSection.tsx`, `SwissStageHorizontal.tsx`, `TournamentPage.tsx`, `KnockoutStage.tsx` (styling tweaks only).

### Phase 6 – Simulation Flow & Animation
1. Introduce state machine for round simulation preview:  
   - Step 1: Present upcoming matches (no winners).  
   - Step 2: On user click, play hype animation (CSS keyframe or utility).  
   - Step 3: Reveal results and trigger auto-scroll.  
2. Update hooks/usecases if additional timing is needed (likely in presentation layer using `useEffect`).  
3. Provide reduced-motion fallback: skip animation, go straight to results.  
**Files**: `SwissStageHorizontal.tsx`, possible new hook `useRoundSimulationAnimation.ts`.

### Phase 7 – Accessibility, Theme, and Responsiveness
1. Validate ARIA labels on new bars/groups; ensure focus ring and keyboard navigation across sticky regions.  
2. Confirm color tokens (success/danger etc.) align with new card styling.  
3. Cross-device layout checks: mobile (vertical stacking), tablet, desktop.  
**Files**: CSS/Tailwind utilities, `index.css` (if new tokens needed).

### Phase 8 – Testing & QA
1. Unit:  
   - `groupMatchesByRecord` (already existing).  
   - New animation/scroll hooks (`useHorizontalScroll`, `useAutoScroll`, `useRoundSimulationAnimation`).  
2. Component tests:  
   - `RoundColumn`, `RecordGroup`, `MatchRow`, `SwissInfoBar`, `SwissControlBar`.  
3. Integration/E2E (Playwright): simulate round flow verifying preview → animation → results, sticky bars, knockout visibility toggle.  
4. Manual QA checklist covering spec success criteria, dark/light mode, responsive breakpoints.  
**Files**: `src/test/...` as needed, update `quickstart.md` with manual test steps.

---

## 6. Dependencies & Coordination

- Coordinate with drag-and-drop feature (spec 003) to avoid conflicting changes in shared components.  
- Ensure animation timing doesn’t clash with any planned live data update cadence.  
- Confirm persistence layer requires no schema updates (simulation flow still reuses existing state writes).

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sticky bottom bar overlaps content on small screens | Medium | Medium | Add body padding equal to bar height; test on mobile browsers. |
| Animation delays create perceived latency | Medium | Medium | Keep animation under 1s, allow skip for reduced motion, ensure state updates occur promptly after animation end. |
| Horizontal layout introduces performance issues with many DOM nodes | Low | Medium | Memoise record groups, virtualise only if profiling shows need (unlikely with 16 teams). |
| Regression in knockout staging due to relocation | Low | High | Add integration test verifying knockout unlocks post-Swiss completion. |
| Theming inconsistencies with new bars | Medium | Medium | Reuse existing CSS variable palette; add new tokens if necessary with both light/dark definitions. |

---

## 8. Deliverables Checklist

- [ ] Research notes (`research.md`) capturing layout/animation references.  
- [ ] Data & interface updates (`data-model.md`, `quickstart.md`).  
- [ ] Updated presentation components as per phases.  
- [ ] Sticky top/bottom bars wired to tournament controls.  
- [ ] Preview → animation → reveal simulation flow implemented.  
- [ ] Responsive + accessibility audit completed.  
- [ ] Automated test coverage added (unit + component + e2e).  
- [ ] Manual QA checklist executed and recorded.  
- [ ] Task breakdown generated via `/speckit.tasks` once plan approved.

---

## 9. Next Steps

1. Review this plan with stakeholders/teammates.  
2. Upon approval, execute `/speckit.tasks` to materialise actionable todo list.  
3. Begin implementation following the phased approach.

