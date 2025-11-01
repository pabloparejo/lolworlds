# Tasks: Manual Match Authoring & Simulation Controls

**Input**: `specs/003-manual-winner-draw-simulation/` (spec.md, plan.md, research.md)  
**Prerequisites**: data-model.md, quickstart.md, contracts/ (to be produced during implementation)

## Phase 0: Research & Baseline Inventory

- [ ] T000 [P] [Shared] Document current tournament state shape from `src/application/hooks/useTournament.ts` in `specs/003-manual-winner-draw-simulation/research.md`.
- [ ] T001 [P] [Shared] Audit `public/teams.json` to confirm region/seed fields; outline required JSON extensions (tiers, baseline rounds) in `research.md`.
- [ ] T002 [Shared] Map existing persistence helpers (likely `tournamentStorage`) and note gaps for baseline restoration + locked winners in `research.md`.

---

## Phase 1: Foundational Work (Blocking)

- [ ] T010 [Shared] Define JSON schema updates (teams, tiers, baseline rounds) in `specs/003-manual-winner-draw-simulation/data-model.md`.
- [ ] T011 [Shared] Add `specs/003-manual-winner-draw-simulation/contracts/seeding.md` describing JSON contract and loader expectations.
- [ ] T012 [Shared] Create `specs/003-manual-winner-draw-simulation/quickstart.md` outline covering curator flows (import JSON, manual round, reset).
- [ ] T013 [Shared] Implement `src/infrastructure/persistence/seedingLoader.ts` to read JSON into normalized `SeedingConfig`.
- [ ] T014 [Shared] Extend `src/infrastructure/persistence/tournamentStorage.ts` to persist seeding config reference, round history (manual/simulated flag), locked winners, knockout snapshot, and baseline rounds.
- [ ] T015 [Shared] Introduce domain entities:
  - [ ] T015a [P] [Shared] Add `src/domain/entities/RoundDefinition.ts`.
  - [ ] T015b [P] [Shared] Add `src/domain/entities/MatchSlot.ts`.
  - [ ] T015c [P] [Shared] Add `src/domain/entities/SeedingConfig.ts`.
  - [ ] T015d [P] [Shared] Add `src/domain/entities/KnockoutBracket.ts`.
- [ ] T016 [Shared] Create `src/domain/services/swiss/SwissDrawService.ts` skeleton with interfaces for tier pairing and redraw hooks.
- [ ] T017 [Shared] Create `src/domain/services/knockout/KnockoutDrawService.ts` skeleton ensuring 3-0 vs 3-2 constraint.
- [ ] T018 [Shared] Update `specs/003-manual-winner-draw-simulation/data-model.md` with finalized entity diagrams and persistence relationships.

**Checkpoint**: Domain + infrastructure primitives ready; user stories can proceed.

---

## Phase 2: User Story 1 — Curate Initial Swiss Round (Priority: P1) 🎯

**Goal**: Generate and persist the opening Swiss round using JSON-provided seeding tiers while enforcing region and repeat protections.  
**Independent Test**: Trigger initial draw, verify pairings (Tier1 vs Tier3, Tier2 vs Tier2, no same-region) and confirm state persists from JSON config.

### Tests (write before implementation)

- [ ] T020 [P] [US1] Vitest unit tests for `SwissDrawService` covering tier pairing, no same-region round 1, same-record grouping, redraw logic (`src/domain/services/swiss/__tests__/SwissDrawService.test.ts`).
- [ ] T021 [P] [US1] Vitest unit tests for `seedingLoader` ensuring JSON parsing + validation (`src/infrastructure/persistence/__tests__/seedingLoader.test.ts`).

### Implementation

- [ ] T022 [US1] Complete `SwissDrawService` implementation to:
  - Build round 1 pairings (Tier1 vs Tier3, Tier2 vs Tier2).
  - Handle same-record pairing + redraw logic for subsequent rounds.
  - Respect JSON-defined tier membership.
- [ ] T023 [US1] Wire JSON loader into application startup (likely in `useTournament.ts` or infra bootstrap) to hydrate `SeedingConfig`.
- [ ] T024 [US1] Extend `src/application/usecases/generateSwissRound.ts` (new file) to invoke `SwissDrawService`, persist round with metadata, and reference seeding config.
- [ ] T025 [US1] Update `useTournament.ts` to expose `generateInitialRound` action and selectors for seeded matchup display.
- [ ] T026 [US1] Enhance UI: display seeding tiers & round info in `src/presentation/components/swiss/SwissStageHorizontal.tsx` and/or `SwissInfoBar.tsx`; ensure region/tier context visible.

**Checkpoint**: Initial round can be generated from JSON config and verified independently.

---

## Phase 3: User Story 2 — Author Real-World Rounds (Priority: P1)

**Goal**: Let curators define manual rounds using JSON baseline as a starting point, avoiding duplicate matchups and persisting manual metadata.  
**Independent Test**: Manually create a round, validate duplicates prevented, persist manual flag, and confirm tournament progression uses manual data.

### Tests

- [ ] T030 [P] [US2] Vitest tests for manual round validation (duplicate team assignment, repeat match prevention) in `src/domain/services/swiss/__tests__/ManualRoundValidation.test.ts`.
- [ ] T031 [P] [US2] UI test (Testing Library) covering manual round creation flow in `src/presentation/components/swiss/__tests__/RoundEditor.test.tsx`.

### Implementation

- [ ] T033 [US2] Extend `src/application/usecases/advanceSwissRound.ts` to accept manual rounds as authoritative when progressing.
- [ ] T034 [US2] Build `RoundEditor.tsx` with tier display, team selection, validation errors, and save flow integrated with `useTournament`.
- [ ] T035 [US2] Update `SwissControlBar.tsx` to expose “Create Manual Round” entry point and show round provenance (manual vs simulated).
- [ ] T036 [US2] Ensure persistence baseline logic records JSON-provided rounds so partial reset knows where to revert.

**Checkpoint**: Manual round authoring works end-to-end with validation and UI feedback.

---

## Phase 4: User Story 3 — Lock Outcomes & Reset Control (Priority: P2)

**Goal**: Allow manual winner locks, switch simulate/advance CTA appropriately, and offer full/partial reset adhering to JSON baseline.  
**Independent Test**: Lock winners, simulate remaining matches (locks persist), perform partial/full reset verifying baseline restoration.

### Tests

- [ ] T040 [P] [US3] Vitest tests for manual lock behavior during simulation (`src/application/usecases/__tests__/simulateRoundWithLocks.test.ts`).
- [ ] T041 [P] [US3] Vitest tests for reset logic ensuring baseline restoration vs full clear (`src/application/usecases/__tests__/resetTournament.test.ts`).
- [ ] T042 [P] [US3] Testing Library test for `SwissControlBar` CTA changes (simulate vs advance) in `src/presentation/components/swiss/__tests__/SwissControlBar.test.tsx`.

### Implementation

- [ ] T043 [US3] Implement `src/application/usecases/lockMatchResult.ts` to toggle lock state and persist manual winner.
- [ ] T044 [US3] Update `generateSwissRound`/simulation logic to skip locked matches while randomizing remaining outcomes.
- [ ] T045 [US3] Implement `resetTournament.ts` use case handling full vs partial reset (restore JSON baseline).
- [ ] T046 [US3] Extend `useTournament.ts` to expose locking, simulate, and reset actions/selectors; ensure memoized selectors avoid re-renders.
- [ ] T047 [US3] Update UI components:
  - [ ] T047a [P] [US3] Modify match cards (`TeamCard.tsx` / `MatchCard.tsx`) to support lock toggles and visual indicators.
  - [ ] T047b [P] [US3] Update `SwissControlBar.tsx` to switch button label between “Simulate Round” and “Advance Round” when all matches locked.
  - [ ] T047c [P] [US3] Add reset controls (full vs partial) with confirmation states.
- [ ] T048 [US3] Ensure knockout bracket generation is triggered after Swiss completion and rendered in `KnockoutBracket.tsx` (read-only display).

**Checkpoint**: Manual locks + reset workflows operate reliably and respect JSON baseline.

---

## Phase 5: Polish & Cross-Cutting

- [ ] T050 [Shared] Update `specs/003-manual-winner-draw-simulation/quickstart.md` with verified curator flows and testing steps.
- [ ] T051 [Shared] Add documentation/comments explaining JSON configuration format in `public/teams.json`.
- [ ] T052 [Shared] Audit UI for theme compliance (light/dark/auto) and adjust Tailwind classes if required.
- [ ] T053 [Shared] Run `npm run lint` and `npm exec vitest -- --run`; log results in research or plan as needed.
- [ ] T054 [Shared] Capture follow-up TODOs (manual knockout edits, play-in automation) in `specs/003-manual-winner-draw-simulation/research.md`.

---

## Dependencies & Execution Order

- Phase 0 tasks unblock data-model and quickstart authoring.
- Phase 1 tasks (T010–T018) must complete before any user story work.
- User Story 1 (Phase 2) is the MVP and should ship first; User Story 2 depends on JSON baseline + Swiss services; User Story 3 depends on both previous stories for context/state.
- Tests marked [P] can be implemented in parallel; ensure failure-first workflow before feature code.
- Presentation tasks should coordinate to avoid merge conflicts; prefer working story-by-story to maintain independence.
