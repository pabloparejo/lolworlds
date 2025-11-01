# Contract: Seeding Configuration Loader

**Purpose**: Define the interface and validation rules for converting JSON assets into domain `SeedingConfig` objects.

---

## 1. File Format

- Expected path: `public/teams.json` (configurable override allowed).  
- MIME type: `application/json`.  
- UTF-8 encoded.

```jsonc
{
  "metadata": {
    "season": "Worlds 2025",
    "formatVersion": "1.0.0"
  },
  "teams": [
    {
      "id": "team-gen-g",
      "name": "Gen.G",
      "region": "LCK",
      "seed": 1
    }
  ],
  "tiers": {
    "tier1": ["team-gen-g"],
    "tier2": [],
    "tier3": []
  },
  "initialRounds": []
}
```

### Required Fields

| Field | Type | Constraints |
| --- | --- | --- |
| `teams` | array | Length ≥ 16 (Swiss requires 16 teams). |
| `teams[].id` | string | Unique, kebab-case recommended. |
| `teams[].name` | string | 1–50 chars. |
| `teams[].region` | `"LCK" \| "LPL" \| "LCP" \| "LEC" \| "LCS"` | Must match existing `Region` enum. |
| `teams[].seed` | 1 \| 2 \| 3 | Seed value based on regional placement. |
| `tiers.tier1` | string[] | IDs referencing teams; must contain exactly 5 IDs. |
| `tiers.tier2` | string[] | Exactly 6 IDs. |
| `tiers.tier3` | string[] | Exactly 5 IDs. |

### Optional Fields

| Field | Type | Notes |
| --- | --- | --- |
| `metadata` | object | Additional descriptors; defaults will be inferred if missing. |
| `initialRounds` | array | Baseline curated rounds. Each entry requires `roundNumber`, `source`, and `matchups`. |
| `initialRounds[].source` | `"baseline-json"` \| `"manual-import"` | Defaults to `"baseline-json"` if omitted. |

---

## 2. Loader Interface

```ts
export interface SeedingLoader {
  load(path?: string): Promise<SeedingConfig>;
}
```

Implementation requirements:

1. Fetch JSON from provided path (default `/teams.json`).  
2. Parse and validate schema (see section 3).  
3. Normalize into domain-friendly structure:
   - Ensure team IDs referenced in tiers and rounds exist.
   - Deduplicate tier lists.
   - Convert `initialRounds` into `BaselineRound[]`.

Error handling:

- Throw `SeedingConfigError` with `.code` and `.messages[]` for validation failures.  
- Distinguish between fetch errors (`NETWORK_ERROR`, `NOT_FOUND`) and schema issues (`INVALID_TIER`, `MISSING_TEAM`, etc.).

---

## 3. Validation Rules

1. **Uniqueness**  
   - Team IDs must be unique.  
   - Tiers must not share IDs.

2. **Tier Counts**  
   - Tier1: 5 teams, Tier2: 6 teams, Tier3: 5 teams.

3. **Seed Alignment**  
   - Tier1 teams must have `seed === 1`.  
   - Tier2 teams: `seed === 2` except optionally one `seed === 3` (Play-In promotion captured via JSON).  
   - Tier3 teams: remaining `seed === 3`.

4. **Initial Rounds Integrity**  
   - Each round must provide at least one matchup.  
   - Teams cannot appear twice in the same round.  
  - Matchups cannot repeat across baseline rounds.

5. **Region & Enum Checks**  
   - `region` must map to known `Region` enum.  
   - `source` must be recognized token.

---

## 4. Outputs & Consumers

- `SeedingConfig` persisted on load and reused for:
  - Swiss round generation.  
  - Partial reset baseline reconstruction.  
  - Displaying seed/tier metadata in the UI.
- Downstream services rely on:
  - `config.tiers`: quick lookups by team ID.  
  - `config.teams`: sorted array with names/regions/seed.  
  - `config.baselineRounds`: optional scaffolding for early rounds.

---

## 5. Versioning

- `formatVersion` assists with future migrations.  
- Loader should tolerate missing metadata by defaulting to `1.0.0`.  
- Changes to schema must bump `formatVersion` and add compatibility logic (TBD).
