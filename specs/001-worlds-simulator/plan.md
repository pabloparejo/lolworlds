# Implementation Plan: League of Legends Worlds Tournament Simulator

**Branch**: `001-worlds-simulator` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-worlds-simulator/spec.md`

## Summary

Build a League of Legends Worlds tournament simulator that allows users to simulate Swiss stage and knockout stage matches through automatic simulation or manual selection. The simulator will support drag-and-drop team manipulation, match locking with selective re-drawing, and configurable draw algorithms (random or region-biased). Tournament state persists in browser localStorage, and teams are loaded from a local JSON file. The application will be built as a React single-page application following Clean Architecture principles with full theme support (dark/light/auto).

## Technical Context

**Language/Version**: TypeScript 5.3+ with React 18+
**Primary Dependencies**: React 18+, React Router, Vite (build tool), Tailwind CSS (styling with theme support)
**Storage**: Browser localStorage for tournament state persistence, local JSON file for team data import
**Testing**: Vitest (unit tests), React Testing Library (component tests), Playwright (integration tests)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Single-page web application (SPA)
**Performance Goals**:
  - Initial load < 2 seconds
  - Drag-and-drop feedback < 200ms (per SC-003)
  - Full Swiss stage simulation < 2 minutes (per SC-001)
  - Match simulation response < 500ms
**Constraints**:
  - Client-side only (no backend)
  - Offline-capable after initial load
  - WCAG 2.1 AA accessibility compliance
  - Theme switching with no FOUC
  - 16-team Swiss stage, 8-team knockout bracket
**Scale/Scope**:
  - Single tournament at a time
  - 16 teams maximum in Swiss stage
  - ~50 total matches per complete tournament
  - localStorage limit (~5MB sufficient for tournament state)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Clean Architecture & SOLID Principles ✅

**Compliance Strategy**:
- **Layers**:
  - Presentation: React components (`src/presentation/`)
  - Application: Use cases, tournament simulation logic (`src/application/`)
  - Domain: Entities (Team, Match, Round, Stage), business rules (`src/domain/`)
  - Infrastructure: localStorage adapter, JSON file loader (`src/infrastructure/`)
- **Dependency Rule**: All dependencies point inward (Presentation → Application → Domain, Infrastructure → Domain)
- **SOLID**:
  - Single Responsibility: Each hook handles one concern (useTeams, useTournament, useTheme)
  - Open/Closed: Strategies pattern for draw algorithms (RandomDraw, BiasedDraw)
  - Liskov Substitution: All draw algorithms implement common DrawStrategy interface
  - Interface Segregation: Separate interfaces for persistence, team loading, match simulation
  - Dependency Inversion: Components depend on interfaces, not concrete implementations

**Status**: ✅ PASS - Architecture aligns with constitution requirements

### Theme Support ✅

**Compliance Strategy**:
- Use CSS variables for theme colors defined in root stylesheet
- Theme state managed via Context API (`ThemeContext`)
- Theme preference persisted to localStorage
- Auto mode uses `matchMedia('(prefers-color-scheme: dark)')` listener
- All components use theme-aware Tailwind classes or CSS variables
- Initial theme applied before React hydration (prevents FOUC)

**Status**: ✅ PASS - Full theme support planned

### React Best Practices ✅

**Compliance Strategy**:
- **Functional Components**: All components use function syntax
- **Hooks**:
  - Built-in: useState, useEffect, useContext, useMemo, useCallback
  - Custom: useTournament, useTeams, useMatches, useTheme, useDragDrop, useLocalStorage
- **Performance**:
  - React.memo for Match and Team card components
  - useMemo for expensive calculations (team pairings, bracket seeding)
  - Code splitting for Swiss/Knockout stage views
- **Organization**:
  - Co-located tests: `Component.tsx` + `Component.test.tsx`
  - TypeScript for type safety
  - PascalCase component names
- **State Management**: Context API for tournament state, local state for UI-only concerns

**Status**: ✅ PASS - Follows React best practices

### Testing Requirements ✅

**Compliance Strategy**:
- Unit tests for business logic (pairing algorithm, seeding, probability calculations)
- Component tests for user interactions (click, drag, drop)
- Integration tests for complete user flows (full tournament simulation)
- Target 80%+ coverage on domain and application layers

**Status**: ✅ PASS - Testing strategy defined

## Project Structure

### Documentation (this feature)

```text
specs/001-worlds-simulator/
├── plan.md              # This file
├── research.md          # Phase 0: Technology choices and patterns
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Setup and development guide
├── contracts/           # Phase 1: Type definitions and interfaces
│   ├── types.ts        # Core type definitions
│   └── interfaces.ts   # Service interfaces
└── tasks.md             # Phase 2: Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
worlds/                  # Project root
├── public/
│   └── teams.json      # Team data (16 teams with names and regions)
├── src/
│   ├── domain/         # Domain layer (entities, business rules)
│   │   ├── entities/
│   │   │   ├── Team.ts
│   │   │   ├── Match.ts
│   │   │   ├── Round.ts
│   │   │   ├── Stage.ts
│   │   │   └── TournamentState.ts
│   │   ├── services/
│   │   │   ├── DrawStrategy.ts         # Interface
│   │   │   ├── RandomDraw.ts           # Implementation
│   │   │   ├── BiasedDraw.ts           # Implementation
│   │   │   ├── SwissMatchmaker.ts      # Pairing logic
│   │   │   └── KnockoutSeeder.ts       # Bracket seeding
│   │   └── rules/
│   │       ├── swiss-rules.ts          # 3-0 qualify, 0-3 eliminate
│   │       └── pairing-constraints.ts  # No repeat matchups
│   ├── application/    # Application layer (use cases)
│   │   ├── usecases/
│   │   │   ├── SimulateRound.ts
│   │   │   ├── SelectWinner.ts
│   │   │   ├── SwapTeams.ts
│   │   │   ├── LockMatch.ts
│   │   │   ├── RedrawPhase.ts
│   │   │   ├── LoadTournament.ts
│   │   │   └── ResetTournament.ts
│   │   └── hooks/
│   │       ├── useTournament.ts        # Main tournament state
│   │       ├── useTeams.ts             # Team operations
│   │       ├── useMatches.ts           # Match operations
│   │       └── useLocalStorage.ts      # Persistence
│   ├── infrastructure/ # Infrastructure layer
│   │   ├── persistence/
│   │   │   └── LocalStorageAdapter.ts
│   │   ├── loaders/
│   │   │   └── TeamDataLoader.ts
│   │   └── theme/
│   │       └── ThemeManager.ts
│   ├── presentation/   # Presentation layer (UI components)
│   │   ├── components/
│   │   │   ├── swiss/
│   │   │   │   ├── SwissStage.tsx
│   │   │   │   ├── RecordBracket.tsx
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   └── TeamCard.tsx
│   │   │   ├── knockout/
│   │   │   │   ├── KnockoutStage.tsx
│   │   │   │   ├── Bracket.tsx
│   │   │   │   └── BracketMatch.tsx
│   │   │   ├── shared/
│   │   │   │   ├── TeamList.tsx        # Qualified/Eliminated sections
│   │   │   │   ├── DrawSelector.tsx    # Random/Biased toggle
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── ResetButton.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── TournamentPage.tsx
│   │   │   └── ErrorPage.tsx
│   │   ├── contexts/
│   │   │   ├── TournamentContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   └── hooks/
│   │       ├── useDragDrop.ts
│   │       └── useTheme.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css        # Tailwind + theme CSS variables
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   │   ├── BiasedDraw.test.ts
│   │   │   ├── SwissMatchmaker.test.ts
│   │   │   └── KnockoutSeeder.test.ts
│   │   └── application/
│   │       └── usecases/*.test.ts
│   ├── integration/
│   │   ├── tournament-flow.test.ts
│   │   └── persistence.test.ts
│   └── e2e/
│       └── complete-tournament.spec.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

**Structure Decision**: Single-page web application structure with Clean Architecture layering. The `src/` directory is organized by architectural layer (domain, application, infrastructure, presentation) rather than by feature, enforcing clear dependency rules. React components live in the presentation layer and depend on application-layer hooks, which in turn use domain services. Infrastructure adapters (localStorage, JSON loading) are injected via dependency inversion.

## Complexity Tracking

> No constitution violations - complexity tracking not required.

All architecture decisions align with constitution requirements:
- Clean Architecture with proper layer separation ✅
- SOLID principles enforced through interfaces and dependency injection ✅
- React best practices (functional components, hooks, TypeScript) ✅
- Theme support via Context API and CSS variables ✅
- Testing strategy covers unit, integration, and e2e ✅
