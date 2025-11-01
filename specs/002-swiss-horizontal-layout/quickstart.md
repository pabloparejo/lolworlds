# Quickstart Guide: Swiss Stage Horizontal Layout

**Feature**: 002-swiss-horizontal-layout  
**Date**: 2025-10-23  
**Phase**: 1 – Design & Contracts

---

## Overview

Follow this guide to implement the current horizontal Swiss stage experience: horizontal round columns with card-style record groups, streamlined winner highlighting, full-width control bar, and compact spacing. Deferred items (two-step simulation flow, region-aware draws, embedded qualified groups) are documented separately in `checklists/followup-domain.md`.

---

## Prerequisites

1. Review the latest spec, plan, data model, and research files in `specs/002-swiss-horizontal-layout`.
2. Ensure `npm install` has been run and `npm run dev` works locally.
3. Confirm you are on branch `002-swiss-horizontal-layout` with a clean git status.
4. Launch Storybook or the main dev server for rapid UI iteration (optional but recommended).

---

## Development Workflow

### Phase 0 – Discovery
- Capture baseline screenshots/notes of the vertical Swiss layout and log them in `research.md`.
- Audit reusable presentation components (`MatchCard`, `TeamCard`, `SwissStage`) and note what can be kept vs. replaced.

### Phase 1 – Data & Interface Design
- Update `data-model.md` with the `SwissMatchWithTeams` view model plus prop contracts for `SwissInfoBar`, `SwissControlBar`, and `MatchRow`.
- Replace this quickstart with the phased workflow (done in this version).

### Phase 2 – Core Layout Refactor
1. Refactor `SwissStageHorizontal.tsx`:
   - Resolve matches to `SwissMatchWithTeams`.
   - Map rounds → record groups → match rows.
   - Append results + knockout columns to the horizontal scroll container.
2. Update `RoundColumn.tsx`:
   - Remove outer border, add padding, apply `data-round` and ARIA attributes.
3. Update `RecordGroup.tsx`:
   - Render as a card (`rounded-lg`, border, shadow optional).
   - Ensure header shows record string, body renders `MatchRow` children.

### Phase 3 – Match Row Presentation
1. Introduce `MatchRow.tsx` (or refactor `MatchCard.tsx`) to render:
   - Horizontal layout: `[TeamCard] — vs — [TeamCard]`.
   - Accessible VS button for match actions (`onVsClick`).
2. Remove record strings from `TeamCard` in Swiss context; rely on group header.
3. Handle responsive collapse (`flex-col` below `sm`) and maintain winner highlighting.

### Phase 4 – Navigation & Control Bars
1. Split existing `SwissNavigation` into:
   - `SwissInfoBar` (top, read-only round summary).
   - `SwissControlBar` (bottom, draw selector + buttons).
2. Apply sticky positioning:
   - Top bar: `sticky top-0 z-20`.
   - Bottom bar: `sticky bottom-0 z-20`.
3. Add body padding/margins so sticky bars do not cover content (`pb-[var(--control-bar-height)]`).
4. Update `TournamentPage.tsx` to pass handlers (`simulateRound`, `resetTournament`, `setDrawAlgorithm`).

### Phase 5 – Results & Knockout Integration
1. Style `ResultsSection.tsx` as a card column with consistent spacing.
2. Place the knockout bracket (`KnockoutStage`) as the final column inside the horizontal scroll (`min-w-[600px]`).
3. Remove the legacy vertical knockout panel from `TournamentPage` (already partially done).

### Phase 6 – Deferred Work (see follow-up doc)
- Two-step draw/sim flow, hype animation, region constraints, and qualified group placement inside columns are **not** part of this branch. Track these in `checklists/followup-domain.md` before changing domain logic.

### Phase 7 – Accessibility, Theme, Responsiveness
1. Verify ARIA roles/labels:
   - `role="region"` for rounds/results, `aria-live` if needed for outcome announcements.
   - Ensure sticky bars are reachable via keyboard (`tabindex`, focus outlines).
2. Confirm all new colors reference theme tokens (`--color-success`, `--color-warning`, etc.).
3. Manually test mobile, tablet, desktop, plus dark/light modes and reduced motion; document observations at the end of this file.

### Phase 8 – Testing & QA
1. Unit tests:
   - `groupMatchesByRecord` (already existing) to cover new view-model mapping.
   - Hooks: `useHorizontalScroll`, `useAutoScroll`, `useRoundSimulationAnimation`.
2. Component tests:
   - `RoundColumn`, `RecordGroup`, `MatchRow`, `SwissInfoBar`, `SwissControlBar`.
3. Integration / E2E (Playwright):
   - Simulate a round: preview → animation → reveal, ensure sticky bars persist, knockout unlocks at completion.
4. Manual QA:
   - Use the checklist in `checklists/` or append a “Manual QA Notes” section below with viewport/theme findings.

---

## Manual QA Notes

Document responsive/theme/reduced-motion observations here as you test. Example:

- ✅ Mobile (375px): Horizontal scroll works, sticky bars visible, bottom bar does not overlap content.
- ✅ Dark mode: Card borders use `--color-border` with sufficient contrast.
- ⚠️ TODO: Polish animation timing on low-end devices (currently feels sluggish).
