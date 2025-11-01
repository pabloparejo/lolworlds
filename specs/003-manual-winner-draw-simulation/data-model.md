# Data Model — Manual Match Authoring & Simulation Controls

**Spec**: `specs/003-manual-winner-draw-simulation/spec.md`  
**Last Updated**: 2025-10-24

---

## 1. JSON Configuration Schema (`public/teams.json`)

```jsonc
{
  "metadata": {
    "season": "Worlds 2025",
    "formatVersion": "1.0.0"
  },
  "tiers": {
    "tier1": ["team-gen-g", "team-jdg", "team-g2", "team-cloud9", "team-fnatic"],
    "tier2": ["team-t1", "team-top-esports", "team-kt", "team-origen", "team-nrg", "team-lng"],
    "tier3": ["team-psg", "team-gaming", "team-gam", "team-flyquest", "team-talon"]
  },
  "teams": [
    {
      "id": "team-gen-g",
      "name": "Gen.G",
      "region": "LCK",
      "seed": 1
    }
    // ...
  ],
  "initialRounds": [
    {
      "roundNumber": 1,
      "source": "baseline-json",
      "matchups": [
        { "teamA": "team-gen-g", "teamB": "team-gaming" },
        { "teamA": "team-t1", "teamB": "team-origen" }
      ]
    }
  ]
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `metadata` | object | Optional descriptor for future migrations. |
| `teams[].id` | string | Required stable identifier. |
| `teams[].seed` | number | Regional seed (1-3). |
| `tiers` | object | Tier names map to arrays of team IDs. Must include tier1/2/3 for Swiss round one rules. |
| `initialRounds[]` | array | Optional array of curated rounds to seed baseline state (used for partial reset). |
| `initialRounds[].source` | `"baseline-json"` \| `"manual"` | Describes provenance (baseline vs later manual import). |
| `initialRounds[].matchups[]` | array | Each entry contains `teamA`/`teamB` IDs. No winners at baseline. |

Validation rules:

1. Every team ID referenced in `tiers` or `initialRounds` must exist in `teams`.  
2. Tier lists must be disjoint and cover all teams used in round one.  
3. Initial baseline rounds cannot create duplicate pairings within the same round.  
4. Seeds must align with tier membership (Tier1 only seed=1, Tier2 seed=2 except promoted team, etc.) — this validation lives in domain services.

---

## 2. Domain Entities & Aggregates

### 2.1 `SeedingConfig`

| Field | Type | Description |
| --- | --- | --- |
| `tiers` | `{ tier1: string[], tier2: string[], tier3: string[] }` | team IDs partitioned by tier. |
| `teams` | `Array<{ id: string; name: string; region: Region; seed: number }>` | Normalized team metadata. |
| `baselineRounds` | `BaselineRound[]` | Derived from JSON `initialRounds`. |
| `formatVersion` | string | Copied from JSON metadata (default `1.0.0`). |

`BaselineRound`:

| Field | Type | Description |
| --- | --- | --- |
| `roundNumber` | number | Starting from 1. |
| `matchups` | `Array<{ teamAId: string; teamBId: string }>` | Pairings without winners. |
| `source` | `'baseline-json'` \| `'manual-import'` | For reset logic. |

### 2.2 `RoundDefinition`

Extends existing `Round` concept with metadata for manual vs simulated origin.

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | UUID. |
| `roundNumber` | number | Sequential. |
| `matchIds` | string[] | Matches belonging to this round. |
| `recordBrackets` | string[] | e.g., `["1-0", "0-1"]`. |
| `source` | `'simulated' \| 'manual' \| 'baseline-json'` | Tracking provenance. |
| `lockedMatchIds` | string[] | Subset of matches with manually locked winners. |

### 2.3 `MatchSlot`

Represents a pairing before results are finalized.

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | UUID. |
| `teamAId` | string | Team participant A. |
| `teamBId` | string | Team participant B. |
| `winnerId` | string \| null | Locked winner if curator overrides. |
| `recordBracket` | string | Record pairing (e.g., `"1-1"`). |
| `isLocked` | boolean | True if `winnerId` set manually. |
| `wasManuallySet` | boolean | Distinguishes manually curated match from simulated draw. |

### 2.4 `KnockoutBracket`

| Field | Type | Description |
| --- | --- | --- |
| `matches` | `Array<{ id: string; round: KnockoutRound; teamAId: string; teamBId: string; winnerId: string \| null }>` | Quarterfinal → Finals structure. |
| `drawHistory` | `Array<{ order: number; selectedTeamId: string; opponentTeamId: string }>` | Captures live draw sequence for replay. |
| `source` | `'auto-generated'` | V1 only. |

---

## 3. Application Layer Contracts

| Use Case | Inputs | Outputs | Notes |
| --- | --- | --- | --- |
| `generateSwissRound` | `{ state, recordBracket }` | `{ updatedState, newRound }` | Uses `SwissDrawService`, respects locks + tiers. |
| `createManualRound` | `{ state, matchups }` | `{ updatedState, newRound }` | Validates duplicates, updates provenance = `manual`. |
| `advanceSwissRound` | `{ state }` | `{ updatedState }` | Progresses to next round, referencing manual rounds when present. |
| `lockMatchResult` | `{ state, matchId, winnerId }` | `{ updatedState }` | Sets `isLocked` + persists manual winner. |
| `resetTournament` | `{ state, mode }` | `{ updatedState }` | `mode` ∈ `full | partial`; partial reloads `baselineRounds` from `SeedingConfig`. |
| `generateKnockoutBracket` | `{ state }` | `{ updatedState, bracket }` | Applies 3-0 vs 3-2 rule, stores draw history (read-only). |

---

## 4. Persistence View (`TournamentState` additions)

Augment existing schema with new fields:

| Field | Type | Description |
| --- | --- | --- |
| `seedingConfig` | `SeedingConfig` | Cached copy from JSON (for offline persistence). |
| `baselineRounds` | `BaselineRound[]` | Same as `seedingConfig.baselineRounds` (optional duplication for quick access). |
| `lockedMatches` | `Record<string, string>` | Map of match ID → winner team ID. |
| `roundMetadata` | `Record<string, { source: 'simulated' | 'manual' | 'baseline-json' }>` | Lightweight index to help UI. |
| `knockoutBracket` | `KnockoutBracket \| null` | Populated once Swiss completes. |

Migration strategy:

1. When loading existing state without these fields, generate defaults from JSON loader.  
2. Version bump (e.g., from `1.0.0` → `1.1.0`) stored in `TournamentState.version`.  
3. `ResetTournament` ensures `seedingConfig` and `baselineRounds` always reflect latest JSON.

---

## 5. Sequence Overview

1. **Startup**: load JSON via `seedingLoader` → produce `SeedingConfig`.  
2. **Initial Draw**: `generateSwissRound` uses tiers to create round 1; lock metadata defaults to unlocked.  
3. **Manual Round**: `createManualRound` saves `RoundDefinition` with `source='manual'`; duplicates prevented using `matchHistory`.  
4. **Simulation**: `lockMatchResult` updates `lockedMatches`; `SimulateRoundWithLocks` only randomizes unlocked matches.  
5. **Reset**: `resetTournament('partial')` rewinds to `baselineRounds` and clears manual additions; full reset clears everything except team list.  
6. **Knockout**: after Swiss completion, `generateKnockoutBracket` constructs read-only bracket abiding by draw rules.

---

## Open Data Questions

- Should baseline rounds store results (for historic snapshots) or only pairings? (Current plan: pairings only).  
- Do we need to store draw RNG seeds for replayability? Not required yet, but keep in mind for future determinism requirements.  
- Consider splitting JSON config into two files (`teams.json`, `baseline-rounds.json`) if maintenance becomes cumbersome.
