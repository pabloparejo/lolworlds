# Data Model: Swiss Stage Horizontal Layout Redesign

**Feature**: 002-swiss-horizontal-layout
**Date**: 2025-10-23
**Phase**: 1 - Design & Contracts

## Overview

This document defines the TypeScript interfaces, prop types, and component contracts for the horizontal Swiss stage layout. **No new domain entities are introduced** - this feature is purely presentation layer work that restructures how existing tournament data is displayed.

---

## Existing Domain Entities (Reused, No Changes)

These entities already exist in `src/domain/entities/` and are **reused as-is**:

### Team

```typescript
interface Team {
  id: string;
  name: string;
  region: string;
  wins: number;
  losses: number;
  status: TeamStatus;
}

enum TeamStatus {
  ACTIVE = 'ACTIVE',
  QUALIFIED = 'QUALIFIED',
  ELIMINATED = 'ELIMINATED'
}
```

**Source**: `src/domain/entities/Team.ts`

### Match

```typescript
interface TournamentState {
  teams: Team[];
  swissStage: SwissStage;
  knockoutStage: KnockoutStage;
}

interface SwissStage {
  currentRound: number;
  maxRounds: number;
  matches: Match[];
  status: StageStatus;
}

interface KnockoutStage {
  matches: Match[];
  status: StageStatus;
}

enum StageStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
```

**Source**: `src/domain/entities/TournamentState.ts`

---

## Presentation Layer Interfaces (New)

These interfaces define component props and internal state for the horizontal layout components.

### SwissStageHorizontalProps

```typescript
interface SwissStageHorizontalProps {
  state: TournamentState;
  drawAlgorithm: DrawAlgorithm;
  onDrawAlgorithmChange: (algorithm: DrawAlgorithm) => void;
  onTeamClick: (teamId: string) => void;
  onVsClick: (matchId: string) => void;
  onSimulateRound: () => void;
  onResetTournament: () => void;
}
```

**Purpose**: Props for the main horizontal timeline container component.

**Usage**: Passed from `TournamentPage` to `SwissStageHorizontal`.

---

### SwissMatchWithTeams (View Model)

```typescript
type SwissMatchWithTeams = Match & {
  team1: Team;
  team2: Team;
};
```

**Purpose**: Presentation-layer helper that pairs the `Match` domain entity (which only stores team ids) with resolved `Team` objects for rendering.

**Derivation**: `const team1 = teamMap.get(match.team1Id)` etc. Null matches are filtered out before rendering.

---

### RoundColumnProps

```typescript
interface RoundColumnProps {
  roundNumber: number;
  matches: SwissMatchWithTeams[];
  onTeamClick: (teamId: string) => void;
  onVsClick: (matchId: string) => void;
}
```

**Purpose**: Props for a single round column displaying one Swiss round.

**Usage**: `SwissStageHorizontal` maps over rounds and renders `RoundColumn` for each.

**Derivation**: `matches` is filtered from `state.swissStage.matches` where `match.round === roundNumber`.

---

### RecordGroupProps

```typescript
interface RecordGroupProps {
  record: string; // e.g., "2-1"
  matches: SwissMatchWithTeams[];
  onTeamClick: (teamId: string) => void;
  onVsClick: (matchId: string) => void;
}
```

**Purpose**: Props for a record group (e.g., all "2-1" matches) within a round column.

**Usage**: `RoundColumn` groups matches by `recordBracket` and renders `RecordGroup` for each group.

**Ordering**: Record groups are sorted best-to-worst (see research.md Area 5).

---

### ResultsSectionProps

```typescript
interface ResultsSectionProps {
  qualifiedTeams: Team[];
  eliminatedTeams: Team[];
  onTeamClick: (teamId: string) => void;
}
```

**Purpose**: Props for the results section displaying qualified/eliminated teams.

**Usage**: `SwissStageHorizontal` renders this after the last round column.

**Derivation**:
- `qualifiedTeams = state.teams.filter(t => t.status === TeamStatus.QUALIFIED)`
- `eliminatedTeams = state.teams.filter(t => t.status === TeamStatus.ELIMINATED)`

---

### SwissInfoBarProps

```typescript
interface SwissInfoBarProps {
  currentRound: number;
  maxRounds: number;
  stageStatus: StageStatus;
}
```

**Purpose**: Props for the fixed top information bar (round summary only).

**Usage**: Rendered as a sticky header above the timeline; purely informational.

---

### SwissControlBarProps

```typescript
interface SwissControlBarProps {
  stageStatus: StageStatus;
  canSimulateRound: boolean;
  isSimulationPending: boolean;
  onSimulateRound: () => void;
  onReset: () => void;
  drawAlgorithm: DrawAlgorithm;
  onDrawAlgorithmChange: (algorithm: DrawAlgorithm) => void;
}
```

**Purpose**: Props for the fixed bottom control bar that houses the draw algorithm selector and action buttons.

**Usage**: Rendered once per page; handlers come from `useTournamentContext`.

---

### MatchRowProps

```typescript
interface MatchRowProps {
  match: SwissMatchWithTeams;
  onTeamClick?: (teamId: string) => void;
  onVsClick?: (matchId: string) => void;
}
```

**Purpose**: Horizontal rendering of a single match row (`Team A` – `vs` – `Team B`).

**Notes**: `recordBracket` is shown by the parent group header, so not repeated here.

---

### MatchCardProps (Existing, No Changes)

```typescript
interface MatchCardProps {
  match: Match;
  onTeamClick: (teamId: string) => void;
  onVsClick: (matchId: string) => void;
}
```

**Purpose**: Props for displaying a single match pair (two teams with "vs" indicator).

**Usage**: Reused from existing `src/presentation/components/swiss/MatchCard.tsx`.

**No changes required**: Component already supports winner highlighting via `match.winner`.

---

### TeamCardProps (Existing, No Changes)

```typescript
interface TeamCardProps {
  team: Team;
  isWinner?: boolean;
  onClick?: (teamId: string) => void;
}
```

**Purpose**: Props for displaying a single team card.

**Usage**: Reused from existing `src/presentation/components/swiss/TeamCard.tsx`.

**No changes required**: Component already supports winner highlighting and status badges.

---

## Custom Hook Interfaces

### useHorizontalScroll

```typescript
interface UseHorizontalScrollReturn {
  scrollRef: RefObject<HTMLDivElement>;
  scrollToRound: (roundIndex: number) => void;
  scrollToEnd: () => void;
}

function useHorizontalScroll(): UseHorizontalScrollReturn;
```

**Purpose**: Manages horizontal scroll behavior and programmatic scrolling.

**Usage**:
```typescript
const { scrollRef, scrollToRound, scrollToEnd } = useHorizontalScroll();

// Attach ref to scroll container
<div ref={scrollRef} className="overflow-x-scroll">...</div>

// Programmatic scroll
scrollToRound(3); // Scroll to Round 3 column
scrollToEnd(); // Scroll to rightmost position
```

**Implementation**: See research.md Area 1.

---

### useAutoScroll

```typescript
interface UseAutoScrollParams {
  scrollRef: RefObject<HTMLDivElement>;
  currentRound: number;
  enabled: boolean;
}

function useAutoScroll(params: UseAutoScrollParams): void;
```

**Purpose**: Automatically scrolls to the newest round after simulation.

**Usage**:
```typescript
useAutoScroll({
  scrollRef,
  currentRound: state.swissStage.currentRound,
  enabled: state.swissStage.status === StageStatus.IN_PROGRESS
});
```

**Implementation**: See research.md Area 2.

**Behavior**:
- Triggers when `currentRound` increases
- Waits 300ms for DOM update
- Scrolls to last round column with smooth animation

---

## Derived Data Structures

These are computed values derived from `TournamentState`, not persisted entities.

### RoundData

```typescript
interface RoundData {
  roundNumber: number;
  matches: Match[];
  recordGroups: Map<string, Match[]>;
}
```

**Purpose**: Aggregated data for a single round column.

**Derivation**:
```typescript
function getRoundData(state: TournamentState, roundNumber: number): RoundData {
  const matches = state.swissStage.matches.filter(m => m.round === roundNumber);
  const recordGroups = groupMatchesByRecord(matches);

  return { roundNumber, matches, recordGroups };
}
```

---

### RecordGroupData

```typescript
interface RecordGroupData {
  record: string; // e.g., "2-1"
  matches: Match[];
  sortOrder: number; // For sorting best-to-worst
}
```

**Purpose**: Aggregated data for a single record group within a round.

**Derivation**:
```typescript
function groupMatchesByRecord(matches: Match[]): Map<string, Match[]> {
  const groups = new Map<string, Match[]>();

  matches.forEach(match => {
    const record = match.recordBracket;
    if (!groups.has(record)) {
      groups.set(record, []);
    }
    groups.get(record)!.push(match);
  });

  // Sort by wins descending (best to worst)
  return new Map([...groups.entries()].sort((a, b) => {
    const [winsA, lossesA] = a[0].split('-').map(Number);
    const [winsB, lossesB] = b[0].split('-').map(Number);
    return winsB - winsA || lossesA - lossesB;
  }));
}
```

---

## Component State (Local UI State)

These are internal component state (not part of TournamentState).

### ScrollContainerState

```typescript
interface ScrollContainerState {
  scrollPosition: number; // Current scroll offset in pixels
  isScrolling: boolean; // True during smooth scroll animation
  canScrollLeft: boolean; // True if not at leftmost position
  canScrollRight: boolean; // True if not at rightmost position
}
```

**Purpose**: Tracks scroll state for UI indicators (e.g., left/right scroll arrows).

**Management**: Optional - only if we add scroll navigation arrows in future iteration.

**Current implementation**: Not needed for MVP (native scroll sufficient).

---

## Validation Rules

These rules enforce data integrity for the horizontal layout.

### Round Display Rules

```typescript
// Only display rounds that have been started
function shouldDisplayRound(round: number, currentRound: number): boolean {
  return round <= currentRound;
}

// Example: currentRound = 3 → display rounds 1, 2, 3
// Do not display rounds 4, 5 until they are simulated
```

### Results Section Display Rules

```typescript
// Only display results section if at least one team qualified or eliminated
function shouldDisplayResultsSection(teams: Team[]): boolean {
  return teams.some(t =>
    t.status === TeamStatus.QUALIFIED || t.status === TeamStatus.ELIMINATED
  );
}
```

### Knockout Stage Display Rules

```typescript
// Only display knockout stage if Swiss is complete
function shouldDisplayKnockoutStage(swissStage: SwissStage): boolean {
  return swissStage.status === StageStatus.COMPLETED;
}
```

---

## Type Guards

Utility functions for type safety.

```typescript
// Check if team is qualified
function isQualified(team: Team): boolean {
  return team.status === TeamStatus.QUALIFIED || team.wins >= 3;
}

// Check if team is eliminated
function isEliminated(team: Team): boolean {
  return team.status === TeamStatus.ELIMINATED || team.losses >= 3;
}

// Check if match is completed
function isMatchCompleted(match: Match): boolean {
  return match.status === MatchStatus.COMPLETED && match.winner !== null;
}
```

---

## Component Props Summary Table

| Component | Props | Reuse/New | Source |
|-----------|-------|-----------|--------|
| **SwissStageHorizontal** | `state, onTeamClick, onVsClick, onSimulateRound` | New | Created in this feature |
| **RoundColumn** | `roundNumber, matches, onTeamClick, onVsClick` | New | Created in this feature |
| **RecordGroup** | `record, matches, onTeamClick, onVsClick` | New | Created in this feature |
| **ResultsSection** | `qualifiedTeams, eliminatedTeams, onTeamClick` | New | Created in this feature |
| **SwissNavigation** | `currentRound, maxRounds, stageStatus, canStartSwiss, canSimulateRound, onStartSwiss, onSimulateRound` | New | Created in this feature |
| **MatchCard** | `match, onTeamClick, onVsClick` | **Reuse** | Existing component (no changes) |
| **TeamCard** | `team, isWinner, onClick` | **Reuse** | Existing component (no changes) |
| **KnockoutStage** | `state, onTeamClick, ...` | **Reuse** | Existing component (minor layout adjustments) |

---

## State Flow Diagram

```
TournamentPage (owns TournamentState)
     ↓
     ├─→ SwissStageHorizontal
     │        ↓
     │        ├─→ SwissNavigation (sticky header)
     │        │        ↓
     │        │        └─→ [Round controls, status display]
     │        │
     │        └─→ ScrollContainer (horizontal scroll)
     │                 ↓
     │                 ├─→ RoundColumn (for each round)
     │                 │        ↓
     │                 │        └─→ RecordGroup (for each record bracket)
     │                 │                 ↓
     │                 │                 └─→ MatchCard (for each match)
     │                 │                          ↓
     │                 │                          └─→ TeamCard (x2 per match)
     │                 │
     │                 ├─→ ResultsSection (qualified/eliminated teams)
     │                 │        ↓
     │                 │        └─→ TeamCard (individual cards, no pairs)
     │                 │
     │                 └─→ KnockoutStage (after Swiss completes)
     │                          ↓
     │                          └─→ Bracket → BracketMatch → TeamCard
     │
     └─→ TeamList (sidebar - existing, unchanged)
```

---

## Data Transformation Pipeline

```
TournamentState (from useTournamentState hook)
     ↓
SwissStageHorizontal component
     ↓
     ├─→ Filter matches by round → RoundData[]
     │        ↓
     │        └─→ Group matches by recordBracket → Map<string, Match[]>
     │                 ↓
     │                 └─→ Sort record groups best-to-worst → RecordGroupData[]
     │
     ├─→ Filter teams by status → qualifiedTeams, eliminatedTeams
     │
     └─→ Pass to child components → RoundColumn, ResultsSection, KnockoutStage
```

**Key transformation functions**:

```typescript
// In SwissStageHorizontal.tsx
const rounds = useMemo(() => {
  const roundNumbers = Array.from(
    { length: state.swissStage.currentRound },
    (_, i) => i + 1
  );

  return roundNumbers.map(roundNumber => ({
    roundNumber,
    matches: state.swissStage.matches.filter(m => m.round === roundNumber),
    recordGroups: groupMatchesByRecord(
      state.swissStage.matches.filter(m => m.round === roundNumber)
    )
  }));
}, [state.swissStage.matches, state.swissStage.currentRound]);

const qualifiedTeams = useMemo(() =>
  state.teams.filter(t => t.status === TeamStatus.QUALIFIED),
  [state.teams]
);

const eliminatedTeams = useMemo(() =>
  state.teams.filter(t => t.status === TeamStatus.ELIMINATED),
  [state.teams]
);
```

---

## Testing Contracts

These are the testable contracts for each component.

### SwissStageHorizontal

**Given**: TournamentState with 3 completed rounds
**When**: Component renders
**Then**:
- 3 RoundColumn components are rendered
- ScrollContainer has horizontal scrolling enabled
- SwissNavigation shows "Round 3 / 5"
- ResultsSection displays if qualified/eliminated teams exist

### RoundColumn

**Given**: Round 2 data with matches from "1-0" and "0-1" record brackets
**When**: Component renders
**Then**:
- 2 RecordGroup components are rendered ("1-0", "0-1")
- RecordGroups are ordered best-to-worst ("1-0" before "0-1")
- Round number header displays "Round 2"

### RecordGroup

**Given**: "2-1" record with 3 matches
**When**: Component renders
**Then**:
- Record header displays "2-1"
- 3 MatchCard components are rendered
- Match cards are arranged side-by-side (flex-wrap)

### ResultsSection

**Given**: 8 qualified teams, 6 eliminated teams
**When**: Component renders
**Then**:
- "Qualified (3 Wins)" section with 8 TeamCard components
- "Eliminated (3 Losses)" section with 6 TeamCard components
- No "vs" indicators (individual cards, not pairs)

### MatchCard (Existing)

**Given**: Completed match with winner
**When**: Component renders
**Then**:
- Winning team has green checkmark indicator
- Losing team has no indicator
- "vs" button is displayed between teams

### useHorizontalScroll

**Given**: Scroll container ref is attached
**When**: `scrollToRound(2)` is called
**Then**:
- Container scrolls to Round 2 column
- Scroll animation is smooth
- Scroll behavior respects `prefers-reduced-motion`

### useAutoScroll

**Given**: currentRound changes from 2 to 3
**When**: Hook triggers
**Then**:
- After 300ms delay, scrolls to Round 3 column
- Scroll animation is smooth
- Previous scroll position is stored

---

## Accessibility Contracts

These ensure WCAG 2.1 AA compliance.

### Keyboard Navigation

- **Tab order**: Navigation → Round headers → Match cards → Team cards
- **Arrow keys**: Horizontal scroll with left/right arrows
- **Enter/Space**: Activate team click or "vs" click

### Screen Reader Announcements

```typescript
// Round column ARIA label
<div role="region" aria-label={`Round ${roundNumber} of ${maxRounds}`}>

// Record group ARIA label
<div role="group" aria-label={`Teams with ${record} record`}>

// Match card ARIA label
<div role="article" aria-label={`Match between ${team1.name} and ${team2.name}`}>

// Results section ARIA label
<div role="region" aria-label="Tournament results">
  <div aria-label="Qualified teams">...</div>
  <div aria-label="Eliminated teams">...</div>
</div>
```

### Focus Management

After auto-scroll, focus moves to the newly visible round header:

```typescript
useEffect(() => {
  if (scrollPerformed) {
    const lastRoundHeader = document.querySelector(`[data-round="${currentRound}"]`);
    (lastRoundHeader as HTMLElement)?.focus();
  }
}, [scrollPerformed, currentRound]);
```

---

## Performance Contracts

### Memoization Requirements

- **Round data**: Memoize `rounds` array (recalculate only when matches or currentRound changes)
- **Record grouping**: Memoize `groupMatchesByRecord` (recalculate only when matches change)
- **Qualified/eliminated teams**: Memoize filtered team lists (recalculate only when team status changes)

### Re-render Optimization

- **RoundColumn**: Wrapped in `React.memo` (re-render only if `roundNumber` or `matches` change)
- **RecordGroup**: Wrapped in `React.memo` (re-render only if `record` or `matches` change)
- **MatchCard**: Already wrapped in `React.memo` (existing optimization)

### Scroll Performance

- **Native scrolling**: Browser-optimized (60fps on modern browsers)
- **Smooth scroll**: Hardware-accelerated CSS transitions
- **No scroll listeners**: Avoid JavaScript scroll event listeners (performance bottleneck)

---

## Summary

This data model defines:

1. **Reused entities**: Team, Match, TournamentState (no changes to domain layer)
2. **New component props**: 5 new component interfaces
3. **Derived data structures**: RoundData, RecordGroupData (computed from TournamentState)
4. **Custom hooks**: useHorizontalScroll, useAutoScroll (scroll behavior management)
5. **Validation rules**: Round display, results section display, knockout display
6. **Testing contracts**: Expected behavior for each component
7. **Accessibility contracts**: ARIA labels, keyboard navigation, focus management
8. **Performance contracts**: Memoization strategy, re-render optimization

**Key principle**: This is purely presentation layer work. No changes to domain entities, business logic, or persistence layer.
