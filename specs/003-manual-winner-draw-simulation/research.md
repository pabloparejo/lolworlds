# Research & Clarifications — Manual Match Authoring & Simulation Controls

**Date**: 2025-10-24  
**Spec**: `specs/003-manual-winner-draw-simulation/spec.md`

---

## Resolved Clarifications

1. **Seeding tier management**  
   - Source of truth is a JSON configuration (e.g., `public/teams.json`). No in-app editor is required for v1.  
   - Developers/curators update the JSON asset and redeploy/distribute it so all users share the same configuration.

2. **Play-In automation**  
   - Out of scope for this iteration. Tiers explicitly list teams (or IDs) per tier inside the JSON.  
   - No runtime promotion logic based on Play-In results.

3. **Knockout bracket editing**  
   - v1 exposes a read-only knockout bracket derived from Swiss outcomes. Manual overrides may arrive in future releases but are not part of this implementation.

4. **Reset behaviour**  
   - Full reset returns to the initial state with only qualified teams loaded.  
   - Partial reset restores the baseline rounds provided by the JSON snapshot (no audit/history trail required).

5. **Manual winner locks + simulation**  
   - Locked winners remain fixed. When simulating, only unlocked matches are randomized.

---

## T000 — Tournament State Inventory (`useTournament.ts`)

- `useTournament` relies on application use cases: `LoadTournament`, `SimulateRound`, `ResetTournament`.  
- State persisted through `LocalStorageAdapter`, storing entire `TournamentState` (version string, teams, matches, rounds, stage metadata, match history).  
- Draw algorithm currently toggles between random/biased; manual overrides or tier metadata are not yet represented.  
- No concept of baseline rounds or seeding tiers today. Swiss pairing/simulation logic hidden inside use cases (not yet inspected).  
- Any new actions (create manual round, lock winners, reset types, knockout draw) must be exposed via this hook and persisted in local storage.

---

## T001 — JSON Asset Review (`public/teams.json`)

Current structure (excerpt):

```json
{
  "teams": [
    { "name": "Gen.G", "region": "LCK" },
    { "name": "T1", "region": "LCK" },
    …
  ]
}
```

Gaps to address:

- No seed ranking (`#1`, `#2`, `#3`) or tier metadata.  
- No explicit team identifiers (IDs assigned post-load).  
- No baseline rounds or knockout scaffolding.

Planned JSON additions:

| Field | Purpose |
| --- | --- |
| `seed` (number/string) | Capture regional seed (#1/#2/#3) for display + validation. |
| `tier` (string) | Assign to Tier1/Tier2/Tier3 per spec. |
| `initialRounds` (array, optional) | Predefined rounds/matchups to serve as baseline for partial reset. |
| `metadata.version` | Optional marker to help migrations. |

Alternate option: maintain a separate `config/worlds-2025.json` if we want to avoid overloading `teams.json`. Needs decision in data model.

---

## T002 — Persistence Helpers & Gaps

- `LocalStorageAdapter` is the only identified persistence mechanism; no abstraction for baseline snapshots.  
- `ResetTournament` use case simply reloads from `teams.json` via `LoadTournament`, meaning partial resets will need additional metadata to know the JSON baseline.  
- Match history currently stored in `TournamentState.matchHistory` but not enriched with manual outcome flags.  
- No dedicated storage for manual/locked matches, seeding tiers, or knockout bracket.  
- Baseline plan: extend storage schema to include:
  - `seedingConfig` snapshot (tier assignments, pairing rules).  
  - `baselineRounds` (IDs or descriptors referencing JSON-provided rounds).  
  - `lockedMatches` map keyed by match ID.  
  - `knockoutBracket` (read-only representation).

---

## Next Steps

- Formalize JSON schema + entity relationships in `data-model.md` (Task T010).  
- Draft contracts for loaders and use cases, then proceed with domain service implementations.
