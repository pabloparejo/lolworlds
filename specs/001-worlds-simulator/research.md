# Research: League of Legends Worlds Tournament Simulator

**Phase**: 0 (Outline & Research)
**Date**: 2025-10-22
**Purpose**: Document technology choices, architectural patterns, and implementation strategies

## Technology Stack Decisions

### Core Framework: React 18+ with TypeScript

**Decision**: Use React 18.2+ with TypeScript 5.3+

**Rationale**:
- React 18 provides concurrent features and automatic batching for better performance
- TypeScript enforces type safety required by constitution (React Best Practices)
- Large ecosystem with excellent tooling and community support
- Functional components and hooks align with modern React patterns
- Widely adopted, well-documented, and future-proof

**Alternatives Considered**:
- **Vue 3**: Good option but React has larger ecosystem for drag-and-drop libraries
- **Svelte**: Excellent performance but smaller community, fewer enterprise patterns
- **Vanilla JavaScript**: Rejected - constitution requires type safety and React best practices

### Build Tool: Vite

**Decision**: Use Vite 5+ as build tool and dev server

**Rationale**:
- Lightning-fast HMR (Hot Module Replacement) improves developer experience
- Native ES modules support
- Excellent TypeScript support out of the box
- Optimized production builds with automatic code splitting
- Official React template available (`npm create vite@latest`)
- Smaller bundle sizes than Create React App

**Alternatives Considered**:
- **Create React App**: Deprecated by React team, slower builds, less flexible
- **Next.js**: Overkill for client-only SPA, unnecessary server-side features
- **Webpack**: More complex configuration, slower dev server

### Styling: Tailwind CSS

**Decision**: Use Tailwind CSS 3.4+ for styling

**Rationale**:
- Utility-first approach aligns with component-based architecture
- Built-in dark mode support via `dark:` variant (constitution requirement)
- CSS variables integration for custom theming
- Purging removes unused styles in production (small bundle)
- Excellent IDE support with IntelliSense
- Rapid prototyping without leaving JSX

**Alternatives Considered**:
- **Styled Components**: Runtime CSS-in-JS has performance overhead
- **CSS Modules**: Good isolation but more boilerplate, less flexible theming
- **Plain CSS**: Manual theming complexity, harder to maintain consistency

### State Management: React Context API

**Decision**: Use React Context API for global state

**Rationale**:
- Constitution requires "local state by default, Context for cross-cutting concerns"
- Tournament state is cross-cutting (needed by Swiss, Knockout, and UI components)
- No external dependencies needed (built into React)
- Sufficient for single-page tournament simulator
- Easy to test and reason about

**Alternatives Considered**:
- **Redux**: Over-engineering for this scope, unnecessary boilerplate
- **Zustand**: Lightweight but Context API is sufficient
- **Jotai/Recoil**: Atomic state management overkill for tournament state tree

### Drag and Drop: @dnd-kit

**Decision**: Use @dnd-kit/core for drag-and-drop functionality

**Rationale**:
- Modern React hooks-based API
- Excellent TypeScript support
- Built-in accessibility (keyboard navigation)
- Performant (uses CSS transforms, not repositioning)
- Modular architecture (core + sortable utilities)
- Active maintenance and good documentation

**Alternatives Considered**:
- **react-beautiful-dnd**: No longer actively maintained, no React 18 strict mode support
- **react-dnd**: Older API, more complex setup, heavier bundle
- **Native HTML5 Drag API**: Poor mobile support, complex cross-browser handling

### Testing: Vitest + React Testing Library + Playwright

**Decision**: Use Vitest (unit), React Testing Library (component), Playwright (E2E)

**Rationale**:
- **Vitest**: Vite-native test runner, fast, compatible with Jest API, ESM support
- **React Testing Library**: Tests components as users interact, encourages good practices
- **Playwright**: Cross-browser E2E testing, excellent reliability, built-in test isolation
- Meets constitution's testing requirements (unit, integration, contract tests)

**Alternatives Considered**:
- **Jest**: Slower than Vitest, requires additional config for Vite/ESM
- **Cypress**: Good but Playwright has better TypeScript support and parallelization
- **Testing Library alone**: Insufficient for E2E scenarios

## Architectural Patterns

### Clean Architecture Implementation in React

**Pattern**: Layered directory structure with dependency inversion

**Structure**:
```
src/
├── domain/          # Pure business logic, no framework dependencies
├── application/     # Use cases, orchestrates domain logic
├── infrastructure/  # External adapters (localStorage, file loading)
└── presentation/    # React components, hooks, contexts
```

**Key Principles**:
1. **Domain layer** contains pure TypeScript (no React imports)
   - Entities: `Team`, `Match`, `Round`, `Stage`, `TournamentState`
   - Services: `DrawStrategy`, `SwissMatchmaker`, `KnockoutSeeder`
   - Rules: Pure functions for validation and business logic

2. **Application layer** uses domain layer
   - Use cases: `SimulateRound`, `SelectWinner`, `SwapTeams`, etc.
   - Custom hooks: `useTournament`, `useTeams`, `useMatches`

3. **Infrastructure layer** implements interfaces from domain
   - `LocalStorageAdapter` implements `PersistencePort`
   - `TeamDataLoader` implements `TeamLoaderPort`

4. **Presentation layer** uses application layer
   - Components consume hooks and contexts
   - No direct domain or infrastructure access

**Benefits**:
- Testable: Domain logic isolated from React
- Maintainable: Clear separation of concerns
- Flexible: Easy to swap infrastructure (e.g., IndexedDB instead of localStorage)

### Strategy Pattern for Draw Algorithms

**Pattern**: Strategy pattern with interface + implementations

**Interface**:
```typescript
interface DrawStrategy {
  calculateWinProbability(team1: Team, team2: Team): number;
  simulate

Match(match: Match): Team;
}
```

**Implementations**:
- `RandomDrawStrategy`: Returns 0.5 for all matchups
- `BiasedDrawStrategy`: Uses regional strength formula from spec

**Usage**:
```typescript
const strategy = drawType === 'random'
  ? new RandomDrawStrategy()
  : new BiasedDrawStrategy();

const winner = strategy.simulateMatch(match);
```

**Benefits**:
- Open/Closed Principle: New draw algorithms without modifying existing code
- Testable: Each strategy tested independently
- Swappable: Change algorithm at runtime

### Repository Pattern for Persistence

**Pattern**: Repository pattern with ports and adapters

**Port** (domain interface):
```typescript
interface TournamentRepository {
  save(state: TournamentState): void;
  load(): TournamentState | null;
  clear(): void;
}
```

**Adapter** (infrastructure implementation):
```typescript
class LocalStorageTournamentRepository implements TournamentRepository {
  save(state: TournamentState) {
    localStorage.setItem('tournament', JSON.stringify(state));
  }
  // ...
}
```

**Benefits**:
- Dependency Inversion: Domain doesn't depend on localStorage
- Testable: Mock repository in tests
- Flexible: Easy to switch to IndexedDB, API, or other storage

## Best Practices Research

### React Performance Optimization

**Memoization Strategy**:
1. **React.memo** for:
   - `MatchCard`: Prevents re-render when other matches update
   - `TeamCard`: Prevents re-render during drag operations
   - `RecordBracket`: Prevents re-render when unrelated brackets change

2. **useMemo** for:
   - Team pairing calculation (expensive operation)
   - Knockout bracket seeding (sorting and grouping)
   - Filtered team lists (qualified/eliminated)

3. **useCallback** for:
   - Event handlers passed to memoized children
   - Drag-and-drop callbacks

**Code Splitting**:
```typescript
const SwissStage = lazy(() => import('./components/swiss/SwissStage'));
const KnockoutStage = lazy(() => import('./components/knockout/KnockoutStage'));
```

**Benefits**:
- Smaller initial bundle
- Faster time to interactive
- Better performance for large tournament states

### Theme Implementation Strategy

**Approach**: CSS Variables + Tailwind Dark Mode + Context

**Setup**:
1. Define CSS variables in `index.css`:
```css
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-text-primary: #111827;
  /* ... */
}

[data-theme='dark'] {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  /* ... */
}
```

2. Tailwind configuration:
```javascript
module.exports = {
  darkMode: 'class',  // Use class-based dark mode
  // ...
}
```

3. Theme script in `index.html` (prevents FOUC):
```javascript
<script>
  const theme = localStorage.getItem('theme') || 'auto';
  if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
</script>
```

4. `ThemeContext` manages state and persistence

**Benefits**:
- No FOUC (flash of unstyled content)
- Auto mode respects system preference
- Accessible (high contrast maintained)

### Swiss Stage Pairing Algorithm

**Algorithm**: Buchholz-inspired pairing with no-repeat constraint

**Pseudocode**:
```
function pairTeams(teams: Team[]): Match[] {
  // Group teams by record
  const brackets = groupByRecord(teams);

  for each bracket:
    teamsInBracket = shuffle(teams with same record)
    matches = []

    while teamsInBracket has >= 2 teams:
      team1 = teamsInBracket.pop()
      team2 = findViableOpponent(team1, teamsInBracket, previousMatchups)

      if team2 === null:
        // Backtrack: impossible to pair without repeat
        return retry with different shuffle

      matches.push(Match(team1, team2))
      remove team2 from teamsInBracket

  return matches
}

function findViableOpponent(team, candidates, history):
  for candidate in candidates:
    if not hasPlayedBefore(team, candidate, history):
      return candidate
  return null
```

**Edge Case Handling**:
- If pairing fails after 10 shuffle attempts, return error
- User is prompted to manually adjust via drag-and-drop

**Benefits**:
- Implements official Riot no-repeat rule
- Handles edge cases gracefully
- Deterministic with explicit error states

### Knockout Seeding Algorithm

**Algorithm**: Record-based seeding with tiebreaking

**Rules** (from spec clarifications):
1. 3-0 teams paired against 3-2 teams
2. 3-1 teams paired against each other and remaining 3-2 teams

**Implementation**:
```
function seedKnockoutBracket(qualifiedTeams: Team[]): Match[] {
  const teams_3_0 = filter(qualifiedTeams, record === '3-0')
  const teams_3_1 = filter(qualifiedTeams, record === '3-1')
  const teams_3_2 = filter(qualifiedTeams, record === '3-2')

  // Tiebreak within each group (random for MVP, could use head-to-head later)
  shuffle(teams_3_0)
  shuffle(teams_3_1)
  shuffle(teams_3_2)

  quarterfinals = []

  // Pair 3-0 teams with 3-2 teams
  for i in range(teams_3_0.length):
    quarterfinals.push(Match(teams_3_0[i], teams_3_2[i]))

  // Pair 3-1 teams with each other and remaining 3-2 teams
  remaining_3_2 = teams_3_2.slice(teams_3_0.length)
  all_remaining = [...teams_3_1, ...remaining_3_2]

  for i in range(0, all_remaining.length, 2):
    quarterfinals.push(Match(all_remaining[i], all_remaining[i+1]))

  return quarterfinals
}
```

**Edge Cases**:
- If record distribution is unusual (e.g., all 8 teams are 3-2), fall back to random seeding
- Display warning to user about non-standard seeding

**Benefits**:
- Matches spec clarification exactly
- Handles unusual record distributions
- Transparent to user (shows seeding rationale)

### Accessibility Patterns

**WCAG 2.1 AA Compliance**:

1. **Keyboard Navigation**:
   - All interactive elements accessible via Tab
   - Enter/Space to select winner
   - Arrow keys to navigate bracket
   - Escape to unlock match

2. **Screen Reader Support**:
   - ARIA labels for all interactive elements
   - `aria-live` regions for simulation results
   - `role="button"` for clickable team cards
   - `aria-pressed` for locked matches

3. **Color Contrast**:
   - Minimum 4.5:1 for normal text
   - 3:1 for large text and UI components
   - Test with axe DevTools

4. **Focus Management**:
   - Visible focus indicators (2px outline)
   - Logical tab order
   - Skip links for stage navigation

**Implementation**:
```typescript
<button
  aria-label={`Select ${team.name} as winner`}
  aria-pressed={match.winner?.id === team.id}
  onClick={handleSelectWinner}
>
  {team.name} ({team.record})
</button>
```

**Benefits**:
- Inclusive user experience
- Constitution compliance
- Better UX for all users (keyboard power users benefit too)

## Implementation Recommendations

### Development Workflow

1. **Setup** (Day 1):
   - Initialize Vite + React + TypeScript
   - Configure Tailwind + theme system
   - Setup Vitest + React Testing Library

2. **Domain Layer** (Days 2-3):
   - Define entities (Team, Match, Round, Stage)
   - Implement draw strategies (Random, Biased)
   - Write unit tests for business logic

3. **Application Layer** (Days 4-5):
   - Implement use cases
   - Create custom hooks
   - Write integration tests

4. **Infrastructure Layer** (Day 6):
   - localStorage adapter
   - JSON team loader
   - Integration tests for persistence

5. **Presentation Layer** (Days 7-10):
   - Build component tree (Swiss, Knockout, shared)
   - Implement drag-and-drop
   - Style with Tailwind
   - Component tests

6. **Integration & Polish** (Days 11-12):
   - E2E tests with Playwright
   - Performance optimization
   - Accessibility audit
   - Theme refinement

### Testing Strategy

**Unit Tests** (Domain + Application):
- `BiasedDraw.test.ts`: Verify regional strength formula (LCK vs LCS = 66.7%)
- `SwissMatchmaker.test.ts`: Test no-repeat pairing constraint
- `KnockoutSeeder.test.ts`: Verify 3-0 vs 3-2 seeding rule
- `SimulateRound.test.ts`: Test round simulation logic

**Component Tests** (Presentation):
- `MatchCard.test.tsx`: Click to select winner, click vs to lock
- `TeamCard.test.tsx`: Drag start/end events
- `SwissStage.test.tsx`: Full round simulation flow

**Integration Tests**:
- `tournament-flow.test.ts`: Complete Swiss → Knockout → Champion flow
- `persistence.test.ts`: Save, reload, reset tournament state

**E2E Tests** (Playwright):
- `complete-tournament.spec.ts`: Full tournament with manual selections, drag-drop, locking

**Coverage Goals**:
- Domain layer: 90%+ (critical business logic)
- Application layer: 85%+ (use cases and hooks)
- Presentation layer: 70%+ (UI components)
- Overall: 80%+ (constitution requirement)

### Performance Targets

**Metrics** (from Success Criteria):
- Initial load: < 2 seconds (SC-006)
- Drag feedback: < 200ms (SC-003)
- Swiss simulation: < 2 minutes for full stage (SC-001)
- Match simulation: < 500ms per match

**Optimization Techniques**:
1. Code splitting (lazy load Swiss/Knockout stages)
2. Memoization (React.memo, useMemo for pairing calculations)
3. Virtual scrolling if > 20 matches visible (unlikely for 16-team Swiss)
4. Debounce localStorage saves (batch updates during rapid simulation)
5. Web Workers for expensive calculations (future optimization if needed)

## Risks and Mitigations

### Risk 1: Pairing Algorithm Deadlock

**Risk**: Swiss pairing algorithm cannot find valid pairings without repeats

**Likelihood**: Medium (depends on match history)

**Impact**: High (blocks tournament progression)

**Mitigation**:
- Implement backtracking with shuffle retry (up to 10 attempts)
- Fall back to user manual pairing via drag-and-drop
- Display clear error message with guidance
- Unit tests for known problematic scenarios

### Risk 2: localStorage Quota Exceeded

**Risk**: Tournament state exceeds 5MB localStorage limit

**Likelihood**: Very Low (tournament state ~50KB, well under limit)

**Impact**: Medium (state persistence fails)

**Mitigation**:
- Compress state before saving (JSON.stringify is efficient)
- Monitor storage usage in dev tools
- Display warning if approaching 80% of quota
- Future: Migrate to IndexedDB if needed

### Risk 3: Theme FOUC

**Risk**: Flash of unstyled content during theme switch or initial load

**Likelihood**: Medium (async theme loading)

**Impact**: Low (visual glitch, not functional)

**Mitigation**:
- Inline theme script in `index.html` (executes before React)
- Apply theme class before React hydration
- Use CSS transitions for smooth theme switching
- Test on slow connections

### Risk 4: Drag-and-Drop Mobile Support

**Risk**: @dnd-kit may have limited mobile touch support

**Likelihood**: Low (library has touch support)

**Impact**: Medium (UX degradation on mobile)

**Mitigation**:
- Test on iOS Safari and Android Chrome
- Ensure touch events properly handled
- Provide alternative click-based team swapping
- Follow @dnd-kit mobile best practices

## Conclusion

This research establishes a solid foundation for implementing the Worlds Tournament Simulator:

- **Technology stack** chosen for performance, developer experience, and constitution compliance
- **Architectural patterns** ensure Clean Architecture and SOLID principles
- **Best practices** researched for React performance, theming, accessibility, and algorithms
- **Implementation roadmap** provides clear development path
- **Risks identified** with concrete mitigation strategies

**Next Steps**:
1. Proceed to Phase 1: Design (data model, contracts, quickstart)
2. Setup development environment per quickstart guide
3. Begin implementation following TDD approach per constitution

All technical decisions align with the project constitution and are ready for implementation.
