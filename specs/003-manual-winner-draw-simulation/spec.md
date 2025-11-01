# Feature Specification: Manual Match Authoring & Simulation Controls

**Feature Branch**: `003-manual-winner-draw-simulation`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "Manual control over round definitions, reset modes, and match outcomes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Curate Initial Swiss Round (Priority: P1)

As a tournament curator, I want to generate and save the opening Swiss round with tier-based regional seeding so that I can present a plausible schedule before official brackets arrive.

**Why this priority**: Establishes the baseline round structure needed for both simulation and later manual adjustments while honoring official seeding policy.

**Independent Test**: Trigger the initial draw with a seeded Worlds roster, verify persisted round data respects tier pairing rules (Tier 1 vs Tier 3, Tier 2 vs Tier 2) and region restrictions, and confirm the tier configuration loads from the JSON snapshot for future seasons.

**Acceptance Scenarios**:

1. **Given** a set of qualified teams with region and seed metadata (e.g., LCK #1, LPL #3), **When** I create the first round via automated draw, **Then** Tier 1 teams are matched against Tier 3 teams, Tier 2 teams face Tier 2 opponents, and no matches pair teams from the same region.
2. **Given** the 2025 tier structure is defined in the JSON configuration (Tier 1: five regional #1 seeds, Tier 2: six regional #2 seeds plus the #3 seed from the Play-In champion’s region, Tier 3: remaining #3 seeds plus the Play-In champion), **When** I review the stored configuration, **Then** I can adjust the JSON file to adapt it for future Worlds formats.
3. **Given** a Swiss round beyond the opener, **When** I trigger pairings, **Then** teams face opponents with the same record (1-0 vs 1-0, 0-1 vs 0-1, etc.) and any pending repeat matchup forces a redraw into the next open slot.
4. **Given** the initial draw is generated, **When** I confirm the round, **Then** the round is stored with matchups, marked as simulation-derived, and references the seeding configuration used.

**2025 Swiss Seeding Reference**

- Tier 1 (5 teams): regional #1 seeds.
- Tier 2 (6 teams): regional #2 seeds plus the #3 seed from the Play-In champion’s region.
- Tier 3 (5 teams): remaining #3 seeds plus the Play-In champion.
- Round 1 pairings: Tier 1 vs Tier 3, Tier 2 vs Tier 2, no same-region matchups.
- From Round 2 onward: teams pair by shared record; if a pairing repeats a prior matchup, redraw into the next open slot.
- Configuration source: JSON asset (`teams.json` or similar) containing regions, seed ranks, and tier membership.

**Knockout Draw Rules**

- Eight teams progress (2 at 3-0, 3 at 3-1, 3 at 3-2).
- Each 3-0 team draws a 3-2 opponent and occupies opposite sides of the bracket.
- Remaining teams are drawn live in sequence with no additional protections.
- Version 1 treats the generated bracket as read-only; future releases may enable manual overrides.

---

### User Story 2 - Author Real-World Rounds (Priority: P1)

As a curator, I want to define matchups manually for any subsequent round so that the simulator mirrors the real tournament timeline.

**Why this priority**: Enables aligning the simulator with real events, the core value of the feature.

**Independent Test**: Create a new round, supply manual matchups, persist, and ensure future simulations respect previously played matches.

**Acceptance Scenarios**:

1. **Given** an existing tournament state, **When** I add a new round manually selecting matchups, **Then** the system validates no duplicate pairings from prior rounds.
2. **Given** a manually curated round is active, **When** I progress the tournament, **Then** the newly defined round is marked as the authoritative source for ensuing simulations.

---

### User Story 3 - Lock Manual Outcomes & Reset Control (Priority: P2)

As a curator, I want to override match winners before simulating and choose between full or partial resets so that I can replay branches without losing verified data.

**Why this priority**: Protects curated results while still allowing controlled experimentation and corrections.

**Independent Test**: Select winners for every match in the active round and progress without random simulation; trigger both reset modes and confirm expected data retention.

**Acceptance Scenarios**:

1. **Given** an active round awaiting simulation, **When** I manually mark a team as the winner and advance the round, **Then** the chosen team is recorded as the victor regardless of simulation logic.
2. **Given** multiple rounds exist with at least one manual round, **When** I perform a partial reset, **Then** all rounds after the latest manual round are removed while the manual round remains intact; when I perform a full reset, **Then** all rounds are cleared and only the qualified team list persists.

---

### Edge Cases

- What happens when a manual round definition violates remaining team eligibility (e.g., team assigned twice in same round)?
- How does system handle attempts to rematch teams that already faced each other earlier in Swiss play?
- What should occur if a round has partially manual winners and the user initiates random simulation?
- How is state managed if a reset is triggered while a round edit is in progress?
- How do we reconcile manual overrides with persisted auto-simulated outcomes when re-opening the app?
- How do we surface redraw outcomes when record-based pairings repeatedly collide with historical matchups?
- How do we guarantee partial reset restoration to the JSON-defined baseline even after multiple manual rounds?
- What artifacts must persist from the live knockout draw so that future manual bracket edits stay in sync with the 3-0 vs 3-2 pairing mandate?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support creation of an initial Swiss round that enforces Riot regional separation for round one pairings.
- **FR-002**: System MUST persist every generated or manual round with metadata indicating its origin (simulated vs manual).
- **FR-003**: Users MUST be able to define future rounds manually, with validation preventing duplicate team assignments within the same round.
- **FR-004**: System MUST reject manual matchups that repeat a pairing seen in prior rounds unless explicitly allowed by tournament phase rules.
- **FR-005**: Users MUST be able to mark individual match winners prior to simulation; locked winners override random outcomes.
- **FR-006**: When all matches in a round have locked winners, the primary action MUST change from “Simulate Round” to “Advance Round”.
- **FR-007**: System MUST provide a full reset that clears all rounds and restores only the qualified team list.
- **FR-008**: System MUST provide a partial reset that restores the tournament to the baseline rounds supplied by the JSON configuration.
- **FR-009**: System MUST persist locked winners so that subsequent app sessions honor manual outcomes.
- **FR-010**: System MUST emit clear user feedback on validation failures (duplicate pairing, conflicting winners, etc.).
- **FR-011**: System MUST load a configurable seeding tier structure (tier names, regional seed assignments, and draw rules) from JSON without requiring in-app editing.
- **FR-012**: Swiss pairing logic MUST group teams by identical records after round one, prevent repeat opponents, and redraw teams into the next available slot when conflicts occur.
- **FR-013**: System MUST capture the live knockout draw by pairing each 3-0 Swiss team with a 3-2 opponent on opposite sides of the bracket, then drawing remaining teams sequentially without protections; the resulting bracket is read-only in v1.
- **FR-014**: Round simulations MUST respect manual winner locks by simulating only unlocked matches and preserving locked outcomes.

### Key Entities *(include if feature involves data)*

- **RoundDefinition**: Captures round number, source (`manual` | `simulated`), match list, and status (pending, completed).
- **MatchSlot**: Contains team A/B identifiers, manually assigned winner (optional), and flags for validation (region conflict, repeat matchup).
- **ResetRequest**: Represents reset intent (`full` | `partial`) and computes affected rounds based on latest manual round.
- **SeedingConfig**: Stores tier metadata, team assignments, and pairing constraints hydrated from JSON so the draw engine can enforce up-to-date seeding rules.
- **KnockoutBracket**: Persists quarterfinal placement order, Swiss record provenance (3-0, 3-1, 3-2), and live draw outcomes for bracket visualization (read-only in v1).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of initial round draws generated through the UI obey the no-same-region rule for round one.
- **SC-002**: Manual round creation rejects invalid configurations with error feedback within 300 ms in 95% of cases.
- **SC-003**: Advancing a round with manually locked winners produces zero random outcome overrides across 100 test simulations.
- **SC-004**: Partial reset restores the JSON-defined baseline rounds (and no additional rounds) in 100% of QA scenarios with multi-round histories.
- **SC-005**: Swiss pairings after round one produce zero repeat matchups across 1,000 simulated tournaments.
- **SC-006**: Knockout bracket generation always pairs 3-0 teams with 3-2 opponents on opposite sides in acceptance tests covering all Swiss advancement permutations.
