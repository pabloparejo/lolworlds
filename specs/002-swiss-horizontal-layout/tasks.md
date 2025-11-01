# Tasks: Swiss Stage Horizontal Layout Redesign

**Inputs**: `specs/002-swiss-horizontal-layout/spec.md`, `plan.md`  
**Tests to run**: `npm test`, `npm run test:playwright`, manual responsive + accessibility checklist

Tasks are grouped by phase; within each phase, items generally depend on previous ones unless marked `[P]` (parallel).

---

## Phase 0 – Discovery & Setup

- [x] T000 [P] Capture current Swiss layout screenshots / notes for comparison (attach to `research.md`)
- [x] T001 [P] Inventory existing Swiss components and identify reusable pieces (`SwissStage.tsx`, `MatchCard.tsx`, `TeamCard.tsx`)

## Phase 1 – Data & Interface Design

- [x] T010 Outline horizontal timeline data flow in `data-model.md` (round → record groups → match rows)
- [x] T011 Document animation sequence and control flow in `quickstart.md`
- [x] T012 Define view model helper for Swiss matches with resolved team entities (note in `research.md`)

## Phase 2 – Core Layout Refactor (Top Timeline)

- [x] T020 Create or refactor `SwissStageHorizontal.tsx` to align with clarified layout (columns, results, knockout)
- [x] T021 Update `RoundColumn.tsx` to remove outer border, adjust spacing, and support card-style groups
- [x] T022 Update `RecordGroup.tsx` to render card container (header, body slot) and accept horizontal match rows
- [x] T023 Add responsive spacing and aria roles to round/record components

## Phase 3 – Match Row Presentation

- [x] T030 Introduce `MatchRow.tsx` (or refactor `MatchCard.tsx`) for horizontal team display with center VS chip
- [x] T031 Ensure record label only appears in group header; remove duplicates from match row
- [x] T032 Implement responsive stacking for match rows on small screens
- [ ] T033 Update tests for match row/record group rendering

## Phase 4 – Navigation & Control Bars

- [x] T040 Split navigation into top info bar (`SwissInfoBar.tsx`) and bottom control bar (`SwissControlBar.tsx`)
- [x] T041 Implement sticky positioning and theme-friendly styling for both bars
- [x] T042 Wire bottom control bar to `simulateRound`, `resetTournament`, and draw algorithm selector
- [x] T043 Update `TournamentPage.tsx` to render new bars and remove obsolete controls

## Phase 5 – Results & Knockout Integration

- [x] T050 Align `ResultsSection.tsx` with card styling and horizontal layout
- [x] T051 Integrate knockout bracket as final column with min-width container
- [x] T052 Remove legacy vertical knockout section and verify state flow

## Phase 6 – Simulation Flow & Animation

- [ ] T060 Implement preview → animation → reveal flow in `SwissStageHorizontal.tsx`
- [ ] T061 Create `useRoundSimulationAnimation` hook (or equivalent) to orchestrate animation timing
- [ ] T062 Add reduced-motion fallback that skips animation gracefully
- [ ] T063 Ensure auto-scroll triggers after animation completes

## Phase 7 – Accessibility, Theme, Responsiveness

- [ ] T070 Audit ARIA labels and focus order; update components as needed
- [ ] T071 Confirm color tokens for card borders/backgrounds comply with theme variables
- [ ] T072 Add body padding/margin adjustments so sticky bars do not overlap content
- [ ] T073 Manual responsive checks (mobile, tablet, desktop) with notes in `quickstart.md`

## Phase 8 – Testing & QA

- [ ] T080 Add/update unit tests for hooks (`useHorizontalScroll`, `useAutoScroll`, `useRoundSimulationAnimation`)
- [ ] T081 Add component tests for `RoundColumn`, `RecordGroup`, `MatchRow`, `SwissInfoBar`, `SwissControlBar`
- [ ] T082 Add integration test validating sticky bars + simulation flow
- [ ] T083 Update Playwright e2e to cover preview → animation → results, knockout reveal
- [ ] T084 Execute manual QA checklist (dark/light mode, keyboard nav, reduced motion) and document findings

## Polish / Cleanup

- [ ] T090 Run lint/format checks and fix issues
- [ ] T091 Update `research.md` / `quickstart.md` with final implementation notes
- [ ] T092 Prepare summary for PR, referencing spec sections and tests
