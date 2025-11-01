# API Contracts

**Feature**: 002-swiss-horizontal-layout

## Overview

This feature does not introduce any new API contracts. It is purely a presentation layer refactor that restructures how existing tournament data is displayed.

## Rationale

- **No backend changes**: All tournament logic remains in the domain layer (SwissMatchmaker, KnockoutSeeder)
- **No new endpoints**: No REST/GraphQL APIs are involved
- **No external services**: No third-party API integrations
- **State management unchanged**: Uses existing `TournamentState` from `useTournamentState` hook
- **Persistence unchanged**: Uses existing LocalStorage adapter

## Component Prop Contracts

While this feature doesn't have HTTP API contracts, it does have **component prop contracts** (TypeScript interfaces). These are documented in:

- **[data-model.md](../data-model.md)**: All component prop interfaces
- **Component files**: TypeScript interfaces are co-located with components

Example component contract:

```typescript
interface SwissStageHorizontalProps {
  state: TournamentState;
  onTeamClick: (teamId: string) => void;
  onVsClick: (matchId: string) => void;
  onSimulateRound: () => void;
}
```

## Future Considerations

If this feature were to introduce API contracts in the future, they would be documented here in OpenAPI/GraphQL schema format.
