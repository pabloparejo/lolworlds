# Feature Specification: League of Legends Worlds Tournament Simulator

**Feature Branch**: `001-worlds-simulator`
**Created**: 2025-10-22
**Status**: Draft
**Input**: User description: "I want to build a League of Legends worlds simulator so the users can simulate the swiss and knockout stages of the championship. The users should: 1. Be able to automatically simulate the results by round (0-0, 1-0, 0-1...) 2. Be able to select the team who will win each round 3. Be able to drag & drop a team in their stage so they swap their match with the other team (where they drop the team, swaps) 4. If they click in the 'vs', they'll lock that match and they'll be able to re-draw that phase 5. Select if they want to do a random draw or biased (based on latest results → LCK > LPL > LCP > LEC > LCS (LTA). There should be an eliminated and qualified section"

## Clarifications

### Session 2025-10-22

- Q: Where do the initial 16 tournament teams come from? → A: Loaded from local file (JSON import)
- Q: How should the 8 qualified teams be seeded into the knockout bracket? → A: 3-0 teams face 3-2 teams; 3-1 teams play between each other plus the remaining 3-2 team
- Q: Where should tournament state be persisted? → A: Browser localStorage (client-side storage, persists across sessions)
- Q: What are the pairing constraints when matching teams with the same record in Swiss stage? → A: Avoid repeat matchups only (teams can't face each other twice in tournament) - official Riot algorithm
- Q: What are the specific win probabilities for biased draw based on region matchups? → A: Use strength-based formula: LCK=100%, LPL=90%, LCP=70%, LEC=60%, LCS=50%; probability = Team1_Strength / (Team1_Strength + Team2_Strength)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Match Simulation (Priority: P1)

Users can automatically simulate tournament matches round by round, allowing the system to determine winners based on selected draw algorithms (random or region-biased).

**Why this priority**: This is the core value proposition of the simulator - allowing users to quickly see potential tournament outcomes without manual intervention. It's the foundation that all other features build upon.

**Independent Test**: Can be fully tested by loading initial tournament teams, selecting a draw type (random/biased), clicking "simulate round", and verifying that matches are generated with appropriate winners and team records are updated (e.g., teams move from 0-0 to 1-0 or 0-1 brackets).

**Acceptance Scenarios**:

1. **Given** a user views the Swiss stage with 16 teams at 0-0, **When** they click "Simulate Round 1", **Then** the system generates 8 matches, determines winners based on the selected algorithm, and updates team records to 1-0 (winners) and 0-1 (losers)
2. **Given** teams are at various records (1-0, 0-1, 2-0, 1-1, 0-2), **When** the user clicks "Simulate Next Round", **Then** teams with matching records are paired, matches are simulated, and records update accordingly (e.g., 1-0 teams move to 2-0 or 1-1)
3. **Given** a team reaches 3-0 in Swiss stage, **When** simulation completes, **Then** the team moves to the "Qualified" section
4. **Given** a team reaches 0-3 in Swiss stage, **When** simulation completes, **Then** the team moves to the "Eliminated" section
5. **Given** Swiss stage is complete (8 qualified, 8 eliminated), **When** user proceeds to Knockout stage, **Then** the 8 qualified teams are seeded into a bracket and ready for knockout simulation

---

### User Story 2 - Manual Winner Selection (Priority: P2)

Users can manually select the winner of any match instead of relying on automatic simulation, giving them control over specific outcomes they want to explore.

**Why this priority**: This adds crucial user agency and "what-if" scenario exploration. Many users will want to predict specific upsets or outcomes, making this the second most important feature after basic simulation.

**Independent Test**: Can be tested independently by presenting a match between two teams, allowing the user to click on either team to designate them as the winner, and verifying the match result and team records update correctly.

**Acceptance Scenarios**:

1. **Given** a match between Team A and Team B is displayed, **When** the user clicks on Team A, **Then** Team A is marked as the winner, their record improves (e.g., 1-0 to 2-0), and Team B's record worsens (e.g., 1-0 to 1-1)
2. **Given** a user has manually selected winners for some matches, **When** they click "Simulate Remaining Matches", **Then** only unresolved matches are simulated automatically
3. **Given** a manually selected winner would cause a team to qualify or be eliminated, **When** the result is applied, **Then** the team moves to the appropriate section (Qualified/Eliminated)

---

### User Story 3 - Team Swap via Drag & Drop (Priority: P3)

Users can drag a team from one match and drop it onto another team in a different match, causing the two teams to swap positions and opponents.

**Why this priority**: This provides advanced match manipulation for users who want to explore specific matchup scenarios. It's less critical than simulation and winner selection but adds significant value for power users.

**Independent Test**: Can be tested by displaying two matches (Match 1: Team A vs Team B, Match 2: Team C vs Team D), dragging Team A onto Team C's position, and verifying that matches become (Match 1: Team C vs Team B, Match 2: Team A vs Team D).

**Acceptance Scenarios**:

1. **Given** two matches exist with teams at the same record level, **When** a user drags Team A from Match 1 and drops it on Team C in Match 2, **Then** Team A and Team C swap positions, creating new matchups while maintaining record groupings
2. **Given** a user attempts to drag a team to a match with different record requirements, **When** they drop the team, **Then** the system prevents the swap and displays a message explaining teams must have matching records
3. **Given** a team swap occurs, **When** matches have already been resolved, **Then** the results are cleared and matches return to unresolved state

---

### User Story 4 - Match Locking and Phase Re-draw (Priority: P4)

Users can lock specific matches they want to preserve by clicking on the "vs" indicator, then trigger a re-draw of the phase that will regenerate all unlocked matches while keeping locked ones intact.

**Why this priority**: This allows users to preserve interesting matchups while randomizing others. It's a refinement feature that enhances the simulation experience but isn't essential for basic functionality.

**Independent Test**: Can be tested by displaying multiple matches, clicking the "vs" on one match to lock it, triggering a phase re-draw, and verifying that the locked match remains unchanged while other matches are regenerated with new pairings.

**Acceptance Scenarios**:

1. **Given** multiple matches in a round, **When** a user clicks the "vs" indicator on a match, **Then** the match is visually marked as locked (e.g., highlighted border or lock icon)
2. **Given** one or more matches are locked, **When** the user clicks "Re-draw Phase", **Then** unlocked matches are regenerated with new team pairings following match-making rules, while locked matches remain unchanged
3. **Given** all matches in a round are locked, **When** the user clicks "Re-draw Phase", **Then** the system displays a message that no matches can be re-drawn
4. **Given** a match is locked, **When** the user clicks the "vs" indicator again, **Then** the match is unlocked and becomes eligible for re-drawing

---

### User Story 5 - Draw Algorithm Selection (Priority: P5)

Users can select between a random draw (all teams have equal chance) or a biased draw (teams from stronger regions have higher win probability) based on regional hierarchy: LCK > LPL > LCP > LEC > LCS (LTA).

**Why this priority**: This adds realism and variety to simulations. While interesting, it's a parameter that affects the other features rather than being a standalone capability, making it lower priority for initial implementation.

**Independent Test**: Can be tested by running multiple simulations with random draw and recording win distributions, then running simulations with biased draw and verifying that teams from stronger regions (LCK, LPL) win more frequently than those from weaker regions (LCS).

**Acceptance Scenarios**:

1. **Given** the user is on the simulator page, **When** they view the draw settings, **Then** they see options for "Random Draw" and "Biased Draw (Regional Strength)"
2. **Given** the user selects "Random Draw", **When** matches are simulated, **Then** each team in a match has an equal probability of winning
3. **Given** the user selects "Biased Draw", **When** matches are simulated, **Then** teams from stronger regions have higher win probability (e.g., LCK team has 70% chance vs LCS team, 55% chance vs LPL team)
4. **Given** the user changes draw algorithm mid-tournament, **When** they simulate the next round, **Then** the new algorithm is applied to all subsequent simulations

---

### Edge Cases

- What happens when JSON file is missing or malformed on application start?
- What happens when JSON file contains fewer or more than 16 teams?
- What happens when a team in JSON file has an invalid or missing region?
- What happens when the 8 qualified teams don't have the expected record distribution for seeding (e.g., all 8 teams are 3-2)?
- What happens when multiple teams within the same record bracket need tiebreaking for seeding order?
- What happens when a user attempts to drag a qualified or eliminated team back into active matches?
- How does the system handle a re-draw request when matches have mixed locked/unlocked states with complex pairing constraints?
- What happens if a user manually creates an impossible tournament state (e.g., more than 8 teams at 3-0)?
- How does the system handle knockout stage simulations where single elimination rules differ from Swiss stage?
- What happens when a user tries to swap teams between Swiss and Knockout stages?
- How does the system recover if a user locks all possible matchups, making a valid re-draw impossible?

## Requirements *(mandatory)*

### Functional Requirements

**Data Loading Requirements**:

- **FR-001**: System MUST load tournament teams from a local JSON file containing team names and regions
- **FR-002**: System MUST validate JSON file contains exactly 16 teams with required fields (name, region)
- **FR-003**: System MUST display an error message if JSON file is missing, malformed, or contains invalid team count

**Swiss Stage Requirements**:

- **FR-004**: System MUST display 16 teams in Swiss stage with initial record of 0-0
- **FR-005**: System MUST organize teams into matches based on their current record (0-0 teams face each other, 1-0 teams face each other, etc.)
- **FR-006**: System MUST prevent teams from facing each other more than once during Swiss stage (no repeat matchups)
- **FR-007**: System MUST update team records after each round based on match outcomes (winner's record improves, loser's record worsens)
- **FR-008**: System MUST move teams with 3-0 record to "Qualified" section
- **FR-009**: System MUST move teams with 0-3 record to "Eliminated" section
- **FR-010**: System MUST continue Swiss stage until 8 teams are qualified and 8 teams are eliminated
- **FR-011**: System MUST display round labels (Round 1, Round 2, etc.) with record brackets (0-0, 1-0, 0-1, 2-0, 1-1, 0-2, etc.)

**Knockout Stage Requirements**:

- **FR-012**: System MUST display the 8 qualified teams from Swiss stage in a single-elimination bracket
- **FR-013**: System MUST seed teams into knockout bracket based on final Swiss record: 3-0 teams paired against 3-2 teams, 3-1 teams paired against each other and remaining 3-2 teams
- **FR-014**: System MUST arrange knockout bracket with quarterfinals (4 matches), semifinals (2 matches), and finals (1 match)
- **FR-015**: System MUST eliminate losing teams from knockout matches (they do not continue)
- **FR-016**: System MUST advance winning teams to the next round of the bracket

**Simulation Requirements**:

- **FR-017**: Users MUST be able to trigger automatic simulation for an entire round
- **FR-018**: Users MUST be able to select a draw algorithm: Random or Biased
- **FR-019**: System MUST apply selected draw algorithm when simulating match outcomes
- **FR-020**: For random draws, system MUST give each team in a match equal 50% win probability
- **FR-021**: For biased draws, system MUST assign regional strength values: LCK=100%, LPL=90%, LCP=70%, LEC=60%, LCS=50%
- **FR-022**: For biased draws, system MUST calculate win probability using formula: P(Team1 wins) = Team1_Strength / (Team1_Strength + Team2_Strength)
- **FR-023**: Users MUST be able to manually select the winner of any individual match
- **FR-024**: System MUST allow users to simulate remaining matches after some manual selections

**Match Manipulation Requirements**:

- **FR-025**: Users MUST be able to drag a team from one match and drop it onto another team to swap their positions
- **FR-026**: System MUST only allow team swaps between matches with teams at the same record level
- **FR-027**: Users MUST be able to click on the "vs" indicator to lock/unlock a match
- **FR-028**: System MUST visually distinguish locked matches from unlocked matches
- **FR-029**: Users MUST be able to trigger a phase re-draw that regenerates unlocked matches while preserving locked ones
- **FR-030**: System MUST clear match results when a swap occurs or a re-draw is triggered

**Display Requirements**:

- **FR-031**: System MUST display an "Eliminated" section showing all eliminated teams
- **FR-032**: System MUST display a "Qualified" section showing all qualified teams
- **FR-033**: System MUST display team names and current records (e.g., "Team A (2-1)")
- **FR-034**: System MUST display match pairings clearly showing both teams and "vs" indicator

**State Persistence Requirements**:

- **FR-035**: System MUST save tournament state to browser localStorage after each user action (match result, team swap, lock/unlock, draw algorithm change)
- **FR-036**: System MUST restore tournament state from localStorage on application load if saved state exists
- **FR-037**: Users MUST be able to reset/clear saved tournament state to start a new simulation

### Key Entities

- **Team**: Represents a competitive team with properties including team name, region (LCK/LPL/LCP/LEC/LCS), current record (wins-losses), and status (active/qualified/eliminated)

- **Match**: Represents a single game between two teams with properties including team 1, team 2, winner (if resolved), stage (Swiss/Knockout), round number, record bracket (e.g., "1-0"), and locked status (for re-draw protection)

- **Round**: Represents a set of simultaneous matches in the Swiss stage, grouped by record brackets (e.g., Round 2 includes 1-0 matches and 0-1 matches)

- **Stage**: Represents a tournament phase, either Swiss (16 teams, 3-0 qualifies, 0-3 eliminates) or Knockout (8 teams, single elimination bracket)

- **Tournament State**: Represents the overall simulation state including all teams, current stage, completed rounds, qualified teams, eliminated teams, active matches, and selected draw algorithm

- **Draw Algorithm**: Represents the simulation method, either Random (equal probabilities) or Biased (regional strength-based probabilities with hierarchy LCK > LPL > LCP > LEC > LCS)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full Swiss stage simulation (from 16 teams at 0-0 to 8 qualified and 8 eliminated) in under 2 minutes using automatic simulation
- **SC-002**: Users can successfully perform manual winner selection for at least 5 consecutive matches without errors
- **SC-003**: Users can drag and drop teams to swap matchups with visual feedback appearing within 200 milliseconds
- **SC-004**: Users can lock specific matches and re-draw a phase, with the locked matches remaining unchanged in 100% of cases
- **SC-005**: When using biased draw, teams from LCK region win approximately 66.7% of matches against teams from LCS region over 100 simulated matches (based on 100/(100+50) formula)
- **SC-006**: Users can complete an entire tournament (Swiss + Knockout stages) and identify a champion within 5 minutes
- **SC-007**: Tournament state is preserved such that users can close and reopen the simulator without losing progress
- **SC-008**: 90% of users successfully complete their first full tournament simulation without needing help documentation
- **SC-009**: The system correctly moves teams to Qualified/Eliminated sections with 100% accuracy based on their records
- **SC-010**: Team swaps are prevented between incompatible record brackets in 100% of invalid attempts, with clear user feedback

## Assumptions

- The simulator uses the 16-team Swiss stage format common in League of Legends Worlds (teams play until 3-0 or 0-3)
- Regional abbreviations represent: LCK (Korea), LPL (China), LCP (assumed to be another major region), LEC (Europe), LCS/LTA (North/Latin America)
- Team data is loaded from a local JSON file with structure: array of objects containing team name and region
- The knockout stage follows standard single-elimination bracket format with 8 teams (quarterfinals → semifinals → finals)
- Knockout seeding follows the rule: 3-0 teams paired with 3-2 teams, 3-1 teams paired with each other and remaining 3-2 teams
- Swiss stage pairing uses official Riot algorithm: teams with matching records are paired, avoiding repeat matchups
- Draw algorithm selection affects automatic simulation only; manual winner selection always allows any outcome
- Team swaps are only valid within the same stage (Swiss or Knockout) and same record bracket
- The "vs" indicator is clickable UI element between team names in each match
- Simulation results are probabilistic for biased draws and deterministic for random draws (based on random seed)
- Tournament state persists in browser localStorage, not synchronized across devices or browsers
- Users interact with a single tournament at a time (no multi-tournament management in initial scope)
- Theme support (dark/light/auto) applies to the simulator interface per project constitution
