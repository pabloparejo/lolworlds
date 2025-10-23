---

description: "Task list for League of Legends Worlds Tournament Simulator"
---

# Tasks: League of Legends Worlds Tournament Simulator

**Input**: Design documents from `/specs/001-worlds-simulator/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this project. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Project uses Clean Architecture: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Vite React TypeScript project using `npm create vite@latest . -- --template react-ts`
- [X] T002 [P] Install core dependencies: `npm install @dnd-kit/core @dnd-kit/utilities`
- [X] T003 [P] Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- [X] T004 [P] Install testing dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test`
- [X] T005 Configure Tailwind in tailwind.config.js with dark mode class strategy and custom theme colors
- [X] T006 Configure Vitest in vite.config.ts with jsdom environment and coverage settings
- [X] T007 Create Clean Architecture directory structure: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/`
- [X] T008 Create subdirectories per plan.md structure (entities, services, rules, usecases, hooks, persistence, loaders, components, pages, contexts)
- [X] T009 Create public/teams.json with 16 League of Legends teams (4 LCK, 4 LPL, 2 LCP, 3 LEC, 3 LCS)
- [X] T010 [P] Copy type definitions from specs/001-worlds-simulator/contracts/types.ts to src/domain/entities/types.ts
- [X] T011 [P] Copy service interfaces from specs/001-worlds-simulator/contracts/interfaces.ts to src/domain/services/interfaces.ts
- [X] T012 Create src/index.css with Tailwind directives and CSS custom properties for light/dark themes
- [X] T013 Update index.html with inline theme script to prevent FOUC (flash of unstyled content)
- [X] T014 Create src/test/setup.ts with Testing Library configuration and global test setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T015 Implement TeamDataLoader in src/infrastructure/loaders/TeamDataLoader.ts to load and validate teams.json
- [X] T016 Implement LocalStorageAdapter in src/infrastructure/persistence/LocalStorageAdapter.ts with save/load/clear/exists methods
- [X] T017 Implement ThemeManager in src/infrastructure/theme/ThemeManager.ts with getTheme/setTheme/getEffectiveTheme/onSystemThemeChange
- [X] T018 Create ThemeContext in src/presentation/contexts/ThemeContext.tsx with theme state and persistence
- [X] T019 Create ThemeProvider component that wraps app and provides theme context
- [X] T020 Create useTheme custom hook in src/presentation/hooks/useTheme.ts
- [X] T021 Create useLocalStorage custom hook in src/application/hooks/useLocalStorage.ts for generic localStorage persistence
- [X] T022 Implement swiss-rules.ts in src/domain/rules/ with functions for checking qualification (3-0) and elimination (0-3)
- [X] T023 Implement pairing-constraints.ts in src/domain/rules/ with function to check if two teams have met before
- [X] T024 Create Layout component in src/presentation/components/layout/Layout.tsx with app shell structure
- [X] T025 Create Header component in src/presentation/components/layout/Header.tsx with title and theme toggle
- [X] T026 Create ThemeToggle component in src/presentation/components/shared/ThemeToggle.tsx
- [X] T027 Wire up App.tsx with ThemeProvider, Layout, and basic routing structure
- [X] T028 Update main.tsx to render App with providers

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic Match Simulation (Priority: P1) 🎯 MVP

**Goal**: Users can automatically simulate tournament matches round by round using random or biased draw algorithms

**Independent Test**: Load 16 teams, select draw type (random/biased), click "simulate round", verify matches generated with winners and team records updated (0-0 → 1-0/0-1)

### Domain Layer for User Story 1

- [X] T029 [P] [US1] Create Team entity helper functions in src/domain/entities/Team.ts (getTeamRecord, updateTeamRecord, getTeamsByStatus)
- [X] T030 [P] [US1] Create Match entity helper functions in src/domain/entities/Match.ts (createMatch, resolveMatch, isMatchResolved)
- [X] T031 [P] [US1] Create Round entity helper functions in src/domain/entities/Round.ts (createRound, isRoundComplete)
- [X] T032 [P] [US1] Create Stage entity helper functions in src/domain/entities/Stage.ts (createSwissStage, createKnockoutStage, isStageComplete)
- [X] T033 [P] [US1] Create TournamentState entity helpers in src/domain/entities/TournamentState.ts (createInitialState, updateTournamentState)
- [X] T034 [US1] Implement RandomDrawStrategy in src/domain/services/RandomDrawStrategy.ts with calculateWinProbability (always 0.5) and simulateMatch
- [X] T035 [US1] Implement BiasedDrawStrategy in src/domain/services/BiasedDrawStrategy.ts using regional strength formula from types.ts
- [X] T036 [US1] Implement SwissMatchmaker in src/domain/services/SwissMatchmaker.ts with createMatches and canPairTeams methods
- [X] T037 [US1] Implement KnockoutSeeder in src/domain/services/KnockoutSeeder.ts with seedBracket method (3-0 vs 3-2, 3-1 vs 3-1/3-2 logic)

### Application Layer for User Story 1

- [X] T038 [US1] Implement LoadTournament use case in src/application/usecases/LoadTournament.ts to initialize tournament from TeamData array
- [X] T039 [US1] Implement SimulateRound use case in src/application/usecases/SimulateRound.ts to simulate all matches in a round
- [X] T040 [US1] Implement ResetTournament use case in src/application/usecases/ResetTournament.ts to clear state and reload teams
- [X] T041 [US1] Create useTournament custom hook in src/application/hooks/useTournament.ts integrating all tournament operations
- [X] T042 [US1] Create TournamentContext in src/presentation/contexts/TournamentContext.tsx wrapping useTournament

### Presentation Layer for User Story 1

- [X] T043 [P] [US1] Create TeamCard component in src/presentation/components/swiss/TeamCard.tsx displaying team name, region, and record
- [X] T044 [P] [US1] Create MatchCard component in src/presentation/components/swiss/MatchCard.tsx displaying two teams and vs indicator
- [X] T045 [US1] Create RecordBracket component in src/presentation/components/swiss/RecordBracket.tsx grouping matches by record (0-0, 1-0, etc.)
- [X] T046 [US1] Create SwissStage component in src/presentation/components/swiss/SwissStage.tsx orchestrating all record brackets
- [X] T047 [P] [US1] Create TeamList component in src/presentation/components/shared/TeamList.tsx for Qualified/Eliminated sections
- [X] T048 [P] [US1] Create DrawSelector component in src/presentation/components/shared/DrawSelector.tsx for Random/Biased toggle
- [X] T049 [US1] Create Bracket component in src/presentation/components/knockout/Bracket.tsx displaying knockout bracket tree
- [X] T050 [US1] Create BracketMatch component in src/presentation/components/knockout/BracketMatch.tsx for single knockout match
- [X] T051 [US1] Create KnockoutStage component in src/presentation/components/knockout/KnockoutStage.tsx orchestrating quarterfinals/semis/finals
- [X] T052 [US1] Create TournamentPage in src/presentation/pages/TournamentPage.tsx integrating SwissStage, KnockoutStage, TeamList, and DrawSelector
- [X] T053 [US1] Wire TournamentPage into App.tsx routing

**Checkpoint**: At this point, User Story 1 should be fully functional - users can load teams, simulate Swiss rounds automatically, view qualified/eliminated teams, and simulate knockout bracket to determine champion

---

## Phase 4: User Story 2 - Manual Winner Selection (Priority: P2)

**Goal**: Users can manually select the winner of any match by clicking on a team

**Independent Test**: Present a match between two teams, click on one team, verify it's marked as winner and team records update correctly

### Domain/Application Layer for User Story 2

- [ ] T054 [US2] Implement SelectWinner use case in src/application/usecases/SelectWinner.ts to manually set match winner and update team records
- [ ] T055 [US2] Update SimulateRound use case to skip already-resolved matches (allows mixing manual + automatic)
- [ ] T056 [US2] Add selectWinner method to useTournament hook in src/application/hooks/useTournament.ts

### Presentation Layer for User Story 2

- [ ] T057 [US2] Update MatchCard component in src/presentation/components/swiss/MatchCard.tsx to handle team click events
- [ ] T058 [US2] Add visual indication of match winner in MatchCard (highlight winner, show checkmark, dim loser)
- [ ] T059 [US2] Update BracketMatch component in src/presentation/components/knockout/BracketMatch.tsx with click-to-select functionality
- [ ] T060 [US2] Add "Simulate Remaining Matches" button to SwissStage component for mixed manual/auto simulation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can either auto-simulate OR manually select winners OR mix both approaches

---

## Phase 5: User Story 3 - Team Swap via Drag & Drop (Priority: P3)

**Goal**: Users can drag a team from one match and drop onto another team to swap their positions

**Independent Test**: Display two matches (A vs B, C vs D), drag A onto C, verify matches become (C vs B, A vs D)

### Application Layer for User Story 3

- [ ] T061 [US3] Implement SwapTeams use case in src/application/usecases/SwapTeams.ts with validation for same record level and match result clearing
- [ ] T062 [US3] Add swapTeams method to useTournament hook in src/application/hooks/useTournament.ts
- [ ] T063 [US3] Create useDragDrop custom hook in src/presentation/hooks/useDragDrop.ts using @dnd-kit with drag state and validation

### Presentation Layer for User Story 3

- [ ] T064 [US3] Update TeamCard component in src/presentation/components/swiss/TeamCard.tsx to be draggable using @dnd-kit/core
- [ ] T065 [US3] Add drop zone to TeamCard to accept dragged teams
- [ ] T066 [US3] Implement drag validation in TeamCard to reject invalid swaps (different record levels)
- [ ] T067 [US3] Add visual feedback during drag (ghost image, drop zone highlighting, invalid drop indication)
- [ ] T068 [US3] Update SwissStage component to provide DndContext from @dnd-kit
- [ ] T069 [US3] Add error message display for invalid swap attempts

**Checkpoint**: All user stories 1-3 should now be independently functional - users can simulate, manually select, AND drag-drop teams

---

## Phase 6: User Story 4 - Match Locking and Phase Re-draw (Priority: P4)

**Goal**: Users can lock matches to preserve them, then re-draw unlocked matches in a round

**Independent Test**: Display multiple matches, click "vs" to lock one, trigger re-draw, verify locked match unchanged while others regenerate

### Application Layer for User Story 4

- [ ] T070 [US4] Implement LockMatch use case in src/application/usecases/LockMatch.ts to toggle match.locked status
- [ ] T071 [US4] Implement RedrawPhase use case in src/application/usecases/RedrawPhase.ts to regenerate unlocked matches using SwissMatchmaker
- [ ] T072 [US4] Add toggleLock and redrawPhase methods to useTournament hook in src/application/hooks/useTournament.ts

### Presentation Layer for User Story 4

- [ ] T073 [US4] Update MatchCard component in src/presentation/components/swiss/MatchCard.tsx to show "vs" as clickable button
- [ ] T074 [US4] Add visual indication of locked status in MatchCard (lock icon, highlighted border, different background color)
- [ ] T075 [US4] Add "Re-draw Phase" button to RecordBracket component
- [ ] T076 [US4] Implement re-draw logic that preserves locked matches and regenerates unlocked ones
- [ ] T077 [US4] Add message when all matches locked ("Cannot re-draw: all matches are locked")

**Checkpoint**: User Stories 1-4 should all work independently - simulate, select, drag-drop, AND lock/re-draw

---

## Phase 7: User Story 5 - Draw Algorithm Selection (Priority: P5)

**Goal**: Users can switch between Random and Biased draw algorithms

**Independent Test**: Run simulations with random draw (50% probabilities), switch to biased draw, verify stronger regions win more often

### Application Layer for User Story 5

- [ ] T078 [US5] Add setDrawAlgorithm method to useTournament hook to change algorithm mid-tournament
- [ ] T079 [US5] Update SimulateRound use case to use selected algorithm from TournamentState

### Presentation Layer for User Story 5

- [ ] T080 [US5] Update DrawSelector component in src/presentation/components/shared/DrawSelector.tsx with algorithm switch (radio buttons or toggle)
- [ ] T081 [US5] Add explanation tooltip to DrawSelector describing Random vs Biased (regional strengths)
- [ ] T082 [US5] Persist draw algorithm selection to localStorage along with tournament state

**Checkpoint**: All 5 user stories should now be independently functional and can be used in any combination

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T083 [P] Create ResetButton component in src/presentation/components/shared/ResetButton.tsx with confirmation dialog
- [ ] T084 [P] Add reset functionality to TournamentPage to clear localStorage and reload teams
- [ ] T085 [P] Create ErrorPage in src/presentation/pages/ErrorPage.tsx for handling missing teams.json or validation errors
- [ ] T086 [P] Add error boundary to App.tsx to catch React errors and show ErrorPage
- [ ] T087 Add loading state to TournamentPage while teams.json is loading
- [ ] T088 Add transition animations for theme switching using CSS transitions
- [ ] T089 Implement keyboard navigation for match selection (Tab, Enter, Space)
- [ ] T090 Add ARIA labels and roles for accessibility (screen reader support)
- [ ] T091 Test WCAG 2.1 AA compliance with axe DevTools and fix issues
- [ ] T092 Add visual polish: shadows, rounded corners, hover states, smooth transitions
- [ ] T093 Optimize React.memo usage on TeamCard and MatchCard to prevent unnecessary re-renders
- [ ] T094 Implement code splitting for SwissStage and KnockoutStage using React.lazy
- [ ] T095 Create README.md with project overview, setup instructions, and architecture documentation
- [ ] T096 [P] Run Lighthouse audit and optimize performance (target: 90+ score)
- [ ] T097 [P] Test on mobile browsers (Safari iOS, Chrome Android) and fix responsive issues
- [ ] T098 Add tournament completion celebration (confetti, champion announcement)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1 domain entities but UI is independent
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Works with US1 pairings but independent feature
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Parameter for US1 but can be added independently

### Within Each User Story

- Domain layer entities can be built in parallel (marked with [P])
- Services depend on entities being complete
- Use cases depend on domain services
- Hooks wrap use cases
- Components can be built in parallel once hooks are ready
- Integration happens in parent components (SwissStage, KnockoutStage, TournamentPage)

### Parallel Opportunities

- Phase 1: T002, T003, T004, T010, T011 can all run in parallel
- Phase 2: T015, T016, T017 can run in parallel; T026 parallel with others
- US1 Domain: T029, T030, T031, T032, T033 all in parallel; T034, T035 in parallel
- US1 Presentation: T043, T044 in parallel; T047, T048 in parallel
- US2: No strict dependencies, can build concurrently with other stories
- US3: Hook work can happen in parallel with US1/US2
- US4: Can develop in parallel with US2/US3
- US5: Minimal changes, can add anytime after US1
- Polish: Most tasks marked [P] can run concurrently

---

## Parallel Example: User Story 1

```bash
# Launch domain entities together:
Task: "Create Team entity helper functions in src/domain/entities/Team.ts"
Task: "Create Match entity helper functions in src/domain/entities/Match.ts"
Task: "Create Round entity helper functions in src/domain/entities/Round.ts"
Task: "Create Stage entity helper functions in src/domain/entities/Stage.ts"
Task: "Create TournamentState entity helpers in src/domain/entities/TournamentState.ts"

# Then launch draw strategies in parallel:
Task: "Implement RandomDrawStrategy in src/domain/services/RandomDraw.ts"
Task: "Implement BiasedDrawStrategy in src/domain/services/BiasedDraw.ts"

# Then launch presentation components in parallel:
Task: "Create TeamCard component in src/presentation/components/swiss/TeamCard.tsx"
Task: "Create MatchCard component in src/presentation/components/swiss/MatchCard.tsx"
# (after MatchCard complete, RecordBracket can start)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T014)
2. Complete Phase 2: Foundational (T015-T028)
3. Complete Phase 3: User Story 1 (T029-T053)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Load 16 teams from teams.json
   - Simulate Swiss rounds (5 rounds until 8 qualified, 8 eliminated)
   - View qualified teams seeded into knockout bracket
   - Simulate knockout (quarters → semis → finals)
   - Verify champion determined
5. Deploy/demo if ready - THIS IS A COMPLETE MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 2 → Test independently → Deploy/Demo (now with manual selection)
4. Add User Story 3 → Test independently → Deploy/Demo (now with drag-drop)
5. Add User Story 4 → Test independently → Deploy/Demo (now with lock/re-draw)
6. Add User Story 5 → Test independently → Deploy/Demo (now with algorithm selection)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Simulation)
   - Developer B: User Story 2 (Manual Selection) - can start immediately, minimal overlap with US1
   - Developer C: User Story 3 (Drag & Drop) - needs US1 entities but can start UI work
3. Stories complete and integrate independently
4. User Stories 4 and 5 are quick additions after 1-3 are done

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are OPTIONAL - focus on functional implementation per spec
- Clean Architecture enforced: Domain → Application → Infrastructure/Presentation
- All file paths are exact and match plan.md structure
- Theme support (dark/light/auto) is foundational, not a separate story
- Data persistence (localStorage) is foundational, not a separate story

---

## Task Count Summary

- **Phase 1 (Setup)**: 14 tasks
- **Phase 2 (Foundational)**: 14 tasks (BLOCKS all stories)
- **Phase 3 (US1 - Simulation)**: 25 tasks (MVP)
- **Phase 4 (US2 - Manual Selection)**: 7 tasks
- **Phase 5 (US3 - Drag & Drop)**: 9 tasks
- **Phase 6 (US4 - Lock & Re-draw)**: 8 tasks
- **Phase 7 (US5 - Algorithm Selection)**: 5 tasks
- **Phase 8 (Polish)**: 16 tasks

**Total**: 98 tasks

**MVP Scope** (Phases 1-3): 53 tasks
**Full Feature** (Phases 1-7): 82 tasks
**Production Ready** (All phases): 98 tasks

---

## Suggested First Sprint (MVP)

Focus on delivering User Story 1 completely:

1. **Week 1**: Setup + Foundational (Tasks T001-T028)
2. **Week 2**: Domain + Application layers for US1 (Tasks T029-T042)
3. **Week 3**: Presentation layer for US1 (Tasks T043-T053)
4. **Week 4**: Testing, bug fixes, polish, demo

**Result**: Fully functional tournament simulator with automatic simulation capability - a complete, deployable MVP.
