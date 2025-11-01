# Implementation Plan: Manual Match Authoring & Simulation Controls

**Branch**: `003-manual-winner-draw-simulation` | **Date**: 2025-10-24 | **Spec**: `specs/003-manual-winner-draw-simulation/spec.md`
**Input**: Feature specification from `/specs/003-manual-winner-draw-simulation/spec.md`

## Summary

Deliver curator controls that honor official Worlds seeding rules, allow manual round authoring, lock match outcomes, and reset tournament progress without losing curated data. Key work includes loading a JSON-driven `SeedingConfig`, enhancing Swiss pairing logic for tiers/same-record/redraws, orchestrating read-only knockout draws, and expanding UI flows for manual editing and reset options.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Zustand (tournament state/store), Vite, TailwindCSS  
**Storage**: JSON configuration assets + local storage via existing tournament persistence service  
**Testing**: Vitest + Testing Library (jsdom environment)  
**Target Platform**: Web (desktop-first responsive simulator)  
**Project Type**: Single web application using Clean Architecture layering under `src/`  
**Performance Goals**: Swiss pairing/redraw under 50ms for full team set; UI interactions ≤16ms frame budget  
**Constraints**: Respect Clean Architecture boundaries, maintain light/dark/auto theme support, keep state serializable for persistence  
**Scale/Scope**: Swiss stage (5 rounds) + knockout bracket for 16 teams; configurable seeding tiers for future Worlds formats

## Constitution Check

Plan maintains Clean Architecture by confining new domain logic to entities/services, exposing behavior through application use cases/hooks, and keeping presentation components free of persistence or business rules. Theme support remains intact (UI changes reuse existing contexts and Tailwind utilities). React best practices preserved via functional components, hooks, and memoization where necessary. No constitution violations anticipated; complexity tracking remains empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-manual-winner-draw-simulation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── entities/
│   │   ├── Stage.ts
│   │   ├── RoundDefinition.ts        # new
│   │   ├── MatchSlot.ts              # new
│   │   └── SeedingConfig.ts          # new (JSON-backed)
│   └── services/
│       ├── swiss/
│       │   └── SwissDrawService.ts   # new
│       └── knockout/
│           └── KnockoutDrawService.ts # new
├── application/
│   ├── hooks/
│   │   └── useTournament.ts          # extend
│   └── usecases/
│       ├── generateSwissRound.ts     # new
│       ├── advanceSwissRound.ts      # new
│       ├── createManualRound.ts      # new
│       ├── lockMatchResult.ts        # new
│       └── resetTournament.ts        # new
├── infrastructure/
│   └── persistence/
│       ├── tournamentStorage.ts      # extend for baseline restoration
│       └── seedingLoader.ts          # new helper to read JSON assets
└── presentation/
    ├── components/
    │   └── swiss/
    │       ├── SwissControlBar.tsx   # extend
    │       ├── RoundEditor.tsx       # new
    │       ├── ResultsSection.tsx    # extend
│       ├── KnockoutBracket.tsx   # new (read-only)
│       └── helpers/validation.ts # new (optional)
    └── pages/
        └── TournamentPage.tsx        # extend

tests/ (co-located Vitest specs alongside implementation files)
```

**Structure Decision**: Continue with single-project web structure leveraging existing Clean Architecture layers. New domain entities/services encapsulate seeding and draw logic; application layer mediates persistence/state; presentation layer consumes hooks and remains UI-focused. Tests stay co-located per repository convention.

## Implementation Phases

### Phase 0 — Research & Data Inventory
- Audit current tournament state shape (`useTournament`, persistence helpers) and identify extension points for rounds/knockout data.
- Review Swiss pairing utilities (if any) to understand existing constraints and randomness seeding.
- Inventory JSON configuration (`public/teams.json` or replacement) for required fields: region, seed rank, tier membership, baseline rounds.
- Capture findings, gaps, and open questions in `research.md`.

### Phase 1 — Domain & Application Design
- Define domain entities (`RoundDefinition`, `MatchSlot`, `SeedingConfig`, `KnockoutBracket`) with validation rules reflecting the spec (tiers, repeat avoidance, knockout pairing).
- Design `SwissDrawService` for tier-aware initial draw and same-record pairing with redraw fallback; create deterministic hooks for testing.
- Draft application use cases (`generateSwissRound`, `advanceSwissRound`, `createManualRound`, `lockMatchResult`, `resetTournament`, `generateKnockoutBracket`) detailing inputs/outputs and failure states.
- Extend persistence contract in `tournamentStorage` to reference JSON-driven seeding config, store round history (manual/simulated flags), locked winners, knockout bracket snapshot, and restore the JSON baseline on partial reset.
- Document schemas and workflows in `data-model.md`, `quickstart.md`, and, if needed, interface definitions under `contracts/`.

### Phase 2 — Feature Implementation
- Implement JSON loading pipeline to enrich team data with region/seed metadata, tier assignments, and baseline rounds; expose `SeedingConfig` for the domain layer.
- Implement domain services and application use cases with accompanying Vitest unit tests (Swiss draw, redraw logic, knockout generation, reset scenarios respecting baseline restoration).
- Extend `useTournament` to expose new actions/selectors (manual match editing, seeding updates, reset options) while preserving serialization and memoized selectors.
- Build/extend presentation components:
  - `RoundEditor` for manual matchup authoring, seed visualization, and winner locking with validation feedback.
  - Enhance `SwissControlBar` to toggle “Simulate” vs “Advance” and present full/partial reset controls.
  - Update Swiss display components to mark manual winners and display draw tier context.
  - Introduce `KnockoutBracket` component to render live draw outcomes (read-only) with clear indication of 3-0 vs 3-2 pairings.
- Ensure UI changes respect existing theme support and responsive layout conventions; add Tailwind utilities where necessary.

### Phase 3 — Validation & Polish
- Execute Vitest suite (new domain/application tests plus updated component tests) and add targeted integration tests for manual workflows (including manual locks + simulations).
- Perform manual QA flows: initial seeded draw, manual round creation, winner locking, partial/full reset, knockout draw generation.
- Verify persistence behavior by reloading the app and confirming manual overrides persist while partial reset restores the JSON baseline.
- Update documentation (`quickstart.md` usage notes) and log any follow-up work prior to running `/speckit.tasks`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)*  |            |                                     |
