# Research: Swiss Stage Horizontal Layout Redesign

**Feature**: 002-swiss-horizontal-layout
**Date**: 2025-10-23
**Phase**: 0 - Outline & Research

## Overview

This document consolidates research findings for implementing a horizontal scrolling layout for the Swiss stage tournament display. All technical unknowns from the Technical Context section have been investigated and resolved.

### Current Swiss UI Snapshot (T000/T001)

- **Existing layout**: Vertical stack of record brackets with borders per match; navigation controls sit inline at top right and scroll with content.
- **Reusable pieces**: `MatchCard.tsx` handles winner highlighting and team badges; `TeamCard.tsx` already honors theme tokens; `SwissStage.tsx` orchestrates Swiss-specific data selection.
- **Gaps identified**: No dedicated sticky bars, record groups share borders with rounds, and match pairs render vertically with records repeated per team.

---

## Research Area 1: Horizontal Scroll Implementation in React

### Decision

Use native CSS `overflow-x: scroll` with `scroll-behavior: smooth` combined with React `useRef` and `scrollIntoView()` API for programmatic scrolling.

### Rationale

- **Native performance**: Browser-optimized scrolling provides 60fps without JavaScript animation loops
- **Accessibility**: Native scrolling supports keyboard navigation (arrow keys, tab), screen readers, and reduced motion preferences automatically
- **Touch gestures**: Mobile browsers handle touch scroll gestures natively without additional libraries
- **Simplicity**: No external scroll library needed (e.g., react-scroll, framer-motion scroll)
- **CSS Scroll Snap**: Can add `scroll-snap-type: x mandatory` for column snapping if desired later

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Framer Motion scroll** | Adds 50KB+ dependency for features we don't need. Native scrolling sufficient. |
| **react-scroll library** | Deprecated, lacks TypeScript support, conflicts with React 19 |
| **Custom JavaScript animation** | Complex to implement, worse performance than native, accessibility gaps |
| **CSS Grid with overflow** | Same outcome as chosen approach, but less semantic than flexbox for timeline |

### Implementation Notes

```typescript
// Custom hook for horizontal scroll management
function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToRound = useCallback((roundIndex: number) => {
    const roundElement = scrollRef.current?.children[roundIndex];
    roundElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  }, []);

  return { scrollRef, scrollToRound };
}
```

**CSS approach**:
```css
.horizontal-timeline {
  display: flex;
  overflow-x: scroll;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity; /* optional: snap to columns */
}
```

---

## Research Area 2: Auto-scroll After Round Simulation

### Decision

Use `useEffect` hook that triggers on `currentRound` state change, with a small delay (300ms) to allow DOM update, then call `scrollIntoView()` on the newest round column.

### Rationale

- **User expectation**: After clicking "Simulate Round", users expect to see the result immediately
- **Delay rationale**: 300ms allows React to render the new round column before scrolling (prevents scroll-to-empty-space)
- **Smooth UX**: Smooth scroll animation (via `scroll-behavior: smooth`) makes the transition clear
- **Cancellable**: User can manually scroll during animation without conflicts

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Immediate scroll (no delay)** | Race condition: scroll fires before DOM renders new column |
| **Scroll to rightmost position** | Less precise than scrolling to specific round element |
| **No auto-scroll** | User explicitly requested this feature; manual scroll is tedious |

### Implementation Notes

```typescript
function useAutoScroll(scrollRef: RefObject<HTMLDivElement>, currentRound: number) {
  const prevRound = useRef(currentRound);

  useEffect(() => {
    if (currentRound > prevRound.current) {
      // New round was simulated
      const delay = setTimeout(() => {
        const lastRound = scrollRef.current?.lastElementChild;
        lastRound?.scrollIntoView({ behavior: 'smooth', inline: 'end' });
      }, 300);

      prevRound.current = currentRound;
      return () => clearTimeout(delay);
    }
  }, [currentRound, scrollRef]);
}
```

---

## Research Area 3: Fixed Navigation Bar (Sticky Header)

### Decision

Use CSS `position: sticky` with `top: 0` and `z-index: 10` for the navigation bar.

### Rationale

- **Native sticky behavior**: No JavaScript required, browser-optimized
- **Scroll independence**: Sticky header stays visible during horizontal scroll (vertical position fixed, horizontal scrolls with content)
- **Accessibility**: Screen readers treat sticky headers correctly
- **Theme support**: Works seamlessly with existing Tailwind theme classes

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **position: fixed** | Covers content, requires padding compensation, breaks horizontal scroll context |
| **JavaScript scroll listener** | Performance overhead, unnecessary complexity, accessibility issues |
| **Portal to document body** | Over-engineering for simple sticky header |

### Implementation Notes

```tsx
<div className="sticky top-0 z-10 bg-[var(--color-background)] border-b border-[var(--color-border)] px-4 py-3">
  <div className="flex items-center justify-between">
    <div className="text-sm">Round {currentRound} / {maxRounds}</div>
    <button onClick={onSimulateRound}>Simulate Next Round</button>
  </div>
</div>
```

**Rationale for z-index: 10**: Ensures header stays above round columns (z-index: 1) but below modals (z-index: 50+).

---

## Research Area 4: Column Width Strategy (Fixed vs Adaptive)

### Decision

Fixed uniform width for all round columns using Tailwind `w-80` (320px) or custom CSS variable.

### Rationale

- **User clarification**: User explicitly chose "Fixed uniform width" (Question 3 in clarification session)
- **Visual consistency**: Uniform columns create predictable timeline rhythm
- **Scrolling predictability**: Users know exactly how far to scroll to reach next round
- **Simplified layout**: No complex width calculations based on match count

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Adaptive width (content-based)** | User explicitly rejected this option |
| **Percentage-based width** | Breaks on narrow viewports, not responsive |
| **Min-width with flex-grow** | Creates uneven columns, rejected by user |

### Implementation Notes

```tsx
// RoundColumn component
<div className="flex-shrink-0 w-80 border-r border-[var(--color-border)] px-4 py-4">
  {/* Round content */}
</div>
```

**Width choice**: 320px (w-80) provides comfortable space for:
- Record group header (e.g., "2-1")
- 2-3 match cards side-by-side (horizontally wrapped)
- Team names up to ~20 characters without truncation
- Touch targets (minimum 44x44px for accessibility)

---

## Research Area 5: Record Group Ordering Logic

### Decision

Sort record groups within each round column by **best-to-worst** (highest win count first, descending).

### Rationale

- **User clarification**: User explicitly chose "Best to worst" ordering (Question 5 in clarification session)
- **Leaderboard convention**: Matches standard leaderboard patterns (top performers at top)
- **Visual hierarchy**: Users scan top-to-bottom, seeing strongest teams first
- **Tournament narrative**: Emphasizes winners and qualified teams

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Worst to best** | User explicitly rejected this option |
| **Alphabetical** | Loses performance context, user rejected |

### Implementation Notes

```typescript
// Record grouping utility
function groupTeamsByRecord(teams: Team[]): Map<string, Team[]> {
  const groups = new Map<string, Team[]>();

  teams.forEach(team => {
    const record = `${team.wins}-${team.losses}`;
    if (!groups.has(record)) {
      groups.set(record, []);
    }
    groups.get(record)!.push(team);
  });

  // Sort by wins descending, then losses ascending
  return new Map([...groups.entries()].sort((a, b) => {
    const [winsA, lossesA] = a[0].split('-').map(Number);
    const [winsB, lossesB] = b[0].split('-').map(Number);
    return winsB - winsA || lossesA - lossesB;
  }));
}
```

---

## Research Area 6: Match Pairing Display vs Individual Teams

### Decision

Display teams as **match pairs** with visual pairing indicators (container grouping + "vs" label).

### Rationale

- **User clarification**: User explicitly chose "Display as match pairs" (Question 1 in clarification session)
- **Tournament semantics**: Swiss format is fundamentally about matches, not individual teams
- **Visual clarity**: Pairing shows which teams competed against each other
- **Existing pattern**: Current implementation uses MatchCard component with "vs" button

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Individual team cards** | User explicitly rejected, loses match context |
| **Conditional (pairs for completed, individuals for upcoming)** | Over-complex, user preferred consistent approach |

### Implementation Notes

Reuse existing `MatchCard` component:

```tsx
// MatchCard.tsx (existing component, no changes needed)
<div className="border rounded p-3 flex flex-col gap-2">
  <TeamCard team={match.team1} isWinner={match.winner === match.team1.id} />
  <button className="text-sm text-gray-500">vs</button>
  <TeamCard team={match.team2} isWinner={match.winner === match.team2.id} />
</div>
```

**Match pair layout within record group**:
```tsx
// RecordGroup component
<div className="flex flex-wrap gap-3">
  {matches.map(match => <MatchCard key={match.id} match={match} />)}
</div>
```

---

## Research Area 7: Winner Highlighting Behavior

### Decision

Highlight only the winning team within completed matches using existing green checkmark indicator. Show no highlights for upcoming (unsimulated) matches.

### Rationale

- **User clarification**: User explicitly specified "only highlight the winning team" (clarification session input)
- **Visual focus**: Reduces visual noise, emphasizes outcomes
- **Anticipation**: Unhighlighted upcoming matches create suspense before simulation
- **Existing pattern**: TeamCard already supports `isWinner` prop with green checkmark

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Highlight both teams** | User explicitly rejected, creates visual clutter |
| **Highlight losing team in red** | User didn't request, overly complex |

### Implementation Notes

```tsx
// TeamCard already handles this with existing prop
<TeamCard
  team={team}
  isWinner={match.winner === team.id && match.status === 'COMPLETED'}
  onClick={onTeamClick}
/>
```

**Highlight rendering** (existing code in TeamCard):
```tsx
{isWinner && <span className="text-green-500">✓</span>}
```

---

## Research Area 8: Qualified/Eliminated Team Display in Results Section

### Decision

Display qualified and eliminated teams as **individual team cards** (no match pairing indicators) in separate "Qualified" and "Eliminated" groups after Round 5 column.

### Rationale

- **User clarification**: User explicitly chose "individual team cards" with "no vs tag" (Question 4 + follow-up)
- **Semantic correctness**: Qualified/eliminated teams are no longer competing, so match context is irrelevant
- **Visual distinction**: Absence of "vs" indicator signals tournament completion for these teams
- **List format**: Aligns with existing sidebar TeamList component pattern

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Show as match pairs** | User explicitly rejected, loses "final status" semantics |
| **Mixed approach (pairs for eliminated, cards for qualified)** | User rejected, creates inconsistency |

### Implementation Notes

```tsx
// ResultsSection component (new)
<div className="flex-shrink-0 w-80 px-4 py-4">
  {qualifiedTeams.length > 0 && (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-green-500 mb-3">
        Qualified (3 Wins)
      </h3>
      <div className="flex flex-wrap gap-2">
        {qualifiedTeams.map(team => (
          <TeamCard key={team.id} team={team} onClick={onTeamClick} />
        ))}
      </div>
    </div>
  )}

  {eliminatedTeams.length > 0 && (
    <div>
      <h3 className="text-lg font-bold text-red-500 mb-3">
        Eliminated (3 Losses)
      </h3>
      <div className="flex flex-wrap gap-2">
        {eliminatedTeams.map(team => (
          <TeamCard key={team.id} team={team} onClick={onTeamClick} />
        ))}
      </div>
    </div>
  )}
</div>
```

---

## Research Area 9: Responsive Design & Mobile Support

### Decision

Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) to adjust column width and match card layout across viewports. Enable touch scroll gestures via native browser support (no library needed).

### Rationale

- **Mobile-first**: Spec requires mobile support explicitly
- **Native touch**: Modern browsers handle touch scroll on `overflow-x: scroll` containers automatically
- **Tailwind patterns**: Existing codebase uses Tailwind responsive utilities
- **Column width adaptation**: Narrow viewports get slightly narrower columns (w-72 on mobile vs w-80 on desktop)

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Hammerjs for touch** | Unnecessary, native touch works perfectly |
| **Separate mobile layout** | Over-engineering, responsive CSS sufficient |
| **Disable horizontal scroll on mobile** | Defeats purpose of feature |

### Implementation Notes

```tsx
// Responsive column width
<div className="flex-shrink-0 w-72 sm:w-80 border-r px-3 sm:px-4">
  {/* Round content */}
</div>

// Match card responsive wrapping
<div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
  {matches.map(match => <MatchCard key={match.id} match={match} />)}
</div>
```

**Touch scroll CSS**:
```css
.horizontal-timeline {
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
  scrollbar-width: thin; /* Firefox: slim scrollbar */
}
```

---

## Research Area 10: Integration with Knockout Stage

### Decision

Render knockout stage as a final "column" in the horizontal timeline after the Results Section, using existing KnockoutStage component with minimal layout adjustments.

### Rationale

- **User requirement**: Spec explicitly requires "knockout stage there" in horizontal scroll (FR-013)
- **Component reuse**: Existing KnockoutStage and Bracket components work as-is
- **Visual continuity**: Knockout appears as natural progression after qualified teams section
- **Minimal changes**: Only layout wrapper adjustment needed (remove vertical spacing, add horizontal spacing)

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Separate view toggle** | User explicitly wants unified timeline |
| **Vertical stacking** | Current behavior, defeats purpose of horizontal layout |
| **Overlay modal** | Breaks horizontal scroll narrative |

### Implementation Notes

```tsx
// SwissStageHorizontal component
<div className="flex overflow-x-scroll">
  {/* Round columns */}
  {rounds.map(round => <RoundColumn key={round} ... />)}

  {/* Results section */}
  {(qualifiedTeams.length > 0 || eliminatedTeams.length > 0) && (
    <ResultsSection qualified={qualifiedTeams} eliminated={eliminatedTeams} />
  )}

  {/* Knockout stage */}
  {swissStage.status === 'COMPLETED' && (
    <div className="flex-shrink-0 px-4 py-4 min-w-[600px]">
      <KnockoutStage state={state} onTeamClick={onTeamClick} />
    </div>
  )}

  {swissStage.status !== 'COMPLETED' && (
    <div className="flex-shrink-0 w-80 px-4 py-4 flex items-center justify-center text-gray-500">
      Knockout Stage (Locked - Complete Swiss First)
    </div>
  )}
</div>
```

---

## Summary of Research Outcomes

| Area | Decision | Rationale |
|------|----------|-----------|
| **Horizontal Scroll** | Native CSS overflow-x + scrollIntoView | Performance, accessibility, simplicity |
| **Auto-scroll** | useEffect on round change + 300ms delay | User expectation, smooth UX |
| **Sticky Header** | CSS position: sticky | Native, performant, accessible |
| **Column Width** | Fixed 320px (w-80) | User choice, visual consistency |
| **Record Ordering** | Best to worst (wins descending) | User choice, leaderboard convention |
| **Match Pairing** | Visual pairs with "vs" indicator | User choice, tournament semantics |
| **Winner Highlighting** | Green checkmark on winner only | User choice, reduces visual noise |
| **Results Display** | Individual cards, no "vs" | User choice, semantic correctness |
| **Responsive Design** | Tailwind breakpoints + native touch | Mobile support, existing patterns |
| **Knockout Integration** | Final column in timeline | User requirement, component reuse |

---

## Technical Decisions

### Component Hierarchy

```
SwissStageHorizontal
├── SwissNavigation (fixed header)
└── ScrollContainer (horizontal scroll wrapper)
    ├── RoundColumn (for each round 1-5)
    │   └── RecordGroup (for each record bracket)
    │       └── MatchCard (for each match)
    │           └── TeamCard (x2 per match)
    ├── ResultsSection (qualified/eliminated teams)
    │   └── TeamCard (individual cards)
    └── KnockoutStage (existing component)
        └── Bracket (existing component)
```

### State Management

- **No new state management needed**: Feature uses existing `TournamentState` from `useTournamentState` hook
- **Local UI state**: Only scroll position (managed by `useHorizontalScroll` hook)
- **No persistence changes**: Tournament state already persisted in LocalStorage

### Performance Considerations

- **Memoization**: Use `useMemo` for record grouping (recalculate only when teams change)
- **Callback stability**: Use `useCallback` for event handlers to prevent child re-renders
- **Component splitting**: Separate RoundColumn into own component for React profiler optimization
- **No virtualization needed**: Maximum 5 rounds * ~5 record groups * ~4 matches = ~100 DOM elements (acceptable)

### Accessibility

- **Keyboard navigation**: Arrow keys work with native scrolling
- **Screen readers**: ARIA labels on navigation ("Navigate to Round 3"), semantic HTML
- **Focus management**: After auto-scroll, focus moves to newly visible round header
- **Reduced motion**: Respect `prefers-reduced-motion` CSS media query for smooth scrolling

```css
@media (prefers-reduced-motion: reduce) {
  .horizontal-timeline {
    scroll-behavior: auto; /* instant scrolling for reduced motion users */
  }
}
```

---

## Research Area 11: Future Simulation Preview Flow (Deferred)

Requirements around two-step draw/simulate flow, hype animation, region-constrained opening draws, and keeping qualified teams embedded in round columns are captured for a future feature branch. Refer to `checklists/followup-domain.md` for the proposed domain changes and UI updates. No code changes were introduced for this research item in the current branch.

---

## Dependencies & Libraries

**No new dependencies required**. Feature uses existing libraries:

- React 19.1+ (already installed)
- Tailwind CSS 4.x (already installed)
- TypeScript 5.9+ (already installed)

**Rationale**: Keeping dependencies minimal reduces bundle size, maintenance burden, and security surface area.

---

## Migration Strategy

### Phase 1: Parallel Implementation

- Create new `SwissStageHorizontal` component alongside existing `SwissStage`
- Add feature flag or route parameter to toggle between layouts
- No changes to domain/application layers (zero risk to business logic)

### Phase 2: User Testing

- Deploy horizontal layout to staging environment
- Gather user feedback on scroll behavior, column width, visual hierarchy
- Iterate on CSS/spacing based on feedback

### Phase 3: Full Rollout

- Make horizontal layout the default
- Deprecate old `SwissStage` vertical layout
- Remove feature flag

### Phase 4: Cleanup

- Remove old components (RecordBracket.tsx if fully replaced)
- Update tests to focus on new components
- Archive old test files

**Timeline**: Phases 1-2 in this feature branch, Phases 3-4 in follow-up cleanup PR.

---

## Open Questions (Post-Research)

None. All technical unknowns resolved through research and user clarifications.

---

## Next Phase

Proceed to **Phase 1: Design & Contracts** to generate:

1. `data-model.md` - Component prop interfaces and state shape
2. `quickstart.md` - Developer guide for implementing components
3. `contracts/` - (N/A for this feature - no API changes)
