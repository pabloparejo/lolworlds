# Feature Specification: Swiss Stage Horizontal Layout Redesign

**Feature Branch**: `002-swiss-horizontal-layout`
**Created**: 2025-10-23
**Status**: Draft
**Input**: User description: "I want to improve the design of the app so we have: 1. Each round of the swiss stage should be a column 2. Each round will show the teams grouped by their record (ie: first round: 0-0, second: 1-0, 0-1, third: 2-0, 1-1, 0-2) 3. We could show the qualified/eliminated teams in the 'next' round in a new group with the correspondent label (and styles) 4. Teams can be shown side by side inside each group 5. We should have horizontal scroll to advance in the rounds and see also the knockout stage there 6. The round number, buttons etc, could be in the top, in a fixed menu"

## Clarifications

### Session 2025-10-23

- Q: How should match results be displayed when a round is simulated? → A: When a round is simulated, only highlight the winning team. The next round should display without any highlighting so users can see upcoming matchups before knowing results. This applies to all rounds including the initial 0-0 stage.
- Q: How should teams be displayed within each record group - as match pairs or as individual team cards? → A: Display as match pairs (two teams together with visual pairing like "vs" or container grouping)
- Q: When a new round is simulated and created, should the view automatically scroll to show the newly created round? → A: Auto-scroll to show the newly simulated round with smooth scroll animation
- Q: Should all round columns have the same fixed width, or should they adapt based on content? → A: Fixed uniform width for all columns
- Q: In the Results Section, should qualified/eliminated teams be displayed as match pairs or as a simple list of individual teams? → A: Display as individual team cards grouped by status (Qualified/Eliminated) with no "vs" pairing indicator
- Q: Within each round column, how should record groups be ordered vertically? → A: Best to worst (highest wins first: "2-0" → "1-1" → "0-2")
- Q: For the match UI, should each match render the two teams in a single horizontal row with the record shown only once per record group header? → A: Yes, the layout should show the record header (e.g., "1-0") followed by horizontal matchup rows like "TES vs T1", "GENG vs MKOI"
- Q: Should the hype animation for results start automatically after the preview, or wait for a user action? → A: Trigger the animation only after the user clicks to simulate the round
- Q: Where should the draw algorithm selector and round control buttons be placed? → A: In a single fixed bar at the bottom of the screen, with the algorithm selector on the left and the "Next Round"/"Reset" buttons on the right
- Q: What border treatment should round columns and record groups use? → A: Remove the round column border and give each record group its own card-style border for clarity

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Swiss Rounds as Columns (Priority: P1)

Users need to see the progression of teams through all Swiss rounds simultaneously in a horizontal timeline view, where each round is a separate column, allowing them to track how teams advance or fall through the tournament.

**Why this priority**: This is the foundational layout change that enables all other features. Without the column-based structure, none of the other improvements can be implemented. It's the MVP that delivers immediate value by showing tournament progression at a glance.

**Independent Test**: Can be fully tested by simulating a Swiss stage and visually confirming that rounds appear as separate vertical columns in a horizontal scrollable container, delivers value by showing tournament progression timeline.

**Acceptance Scenarios**:

1. **Given** the Swiss stage is active, **When** the user views the tournament page, **Then** they see each completed round displayed as a vertical column with round number header
2. **Given** multiple rounds have been completed, **When** the user views the layout, **Then** columns are arranged left-to-right in chronological order (Round 1, Round 2, etc.)
3. **Given** the Swiss stage has not started, **When** the user views the page, **Then** they see an empty horizontal layout with indication that no rounds have begun
4. **Given** more rounds exist than fit on screen, **When** the user scrolls horizontally, **Then** they can smoothly navigate between all completed rounds

---

### User Story 2 - Teams Grouped by Record Within Rounds (Priority: P1)

Within each round column, users need to see teams grouped by their current win-loss record (e.g., 2-0, 1-1, 0-2), making it easy to identify which teams are performing well or poorly at any point in the tournament.

**Why this priority**: This is core to understanding tournament dynamics. Without record grouping, the column layout loses its analytical value. This is independently valuable because it helps users understand tournament standings even if later features aren't implemented.

**Independent Test**: Can be tested by completing 2-3 rounds and verifying that teams within each column are visually grouped by identical records with clear group labels (e.g., "2-1", "1-2"), delivers value by showing performance tiers at each stage.

**Acceptance Scenarios**:

1. **Given** Round 1 is complete, **When** the user views Round 1 column, **Then** all teams are grouped under "0-0" since no matches have been played
2. **Given** Round 2 is complete, **When** the user views Round 2 column, **Then** teams are grouped into "1-0" and "0-1" sections ordered top-to-bottom with clear visual separation
3. **Given** Round 3 is complete, **When** the user views Round 3 column, **Then** teams are grouped into "2-0", "1-1", and "0-2" sections ordered top-to-bottom (best to worst)
4. **Given** teams are displayed in a record group, **When** viewing the group, **Then** each record group has a clear header showing the win-loss record
5. **Given** a record group contains multiple matches, **When** viewing the teams, **Then** match pairs are displayed side-by-side (horizontally) with visual pairing indicators (e.g., "vs" or container grouping)
6. **Given** a round has just been simulated, **When** viewing that round's column, **Then** only the winning team in each match is highlighted (e.g., with green indicator or checkmark)
7. **Given** a new round is created but not yet simulated, **When** viewing that round's column, **Then** teams are displayed without winner highlighting to show upcoming matchups

---

### User Story 3 - Qualified/Eliminated Teams Display (Priority: P2)

Users need to see which teams have qualified (3 wins) or been eliminated (3 losses) by viewing them in a special "Results" section that appears after the final round column, clearly labeled and styled differently from active teams.

**Why this priority**: This provides tournament outcome visibility without requiring the right sidebar. It's independently valuable but depends on the column structure (P1). Can be deployed after P1 is complete.

**Independent Test**: Can be tested by simulating until teams qualify/eliminate, then verifying a distinct "Qualified" and "Eliminated" section appears after Round 5 column with appropriate styling, delivers value by showing final tournament outcomes in the main flow.

**Acceptance Scenarios**:

1. **Given** at least one team has reached 3 wins, **When** viewing the horizontal layout, **Then** a "Qualified Teams (3 Wins)" group appears in a special results section after the last round showing individual team cards without match pairing indicators
2. **Given** at least one team has reached 3 losses, **When** viewing the horizontal layout, **Then** an "Eliminated Teams (3 Losses)" group appears in a special results section after the last round showing individual team cards without match pairing indicators
3. **Given** qualified/eliminated teams are displayed, **When** viewing the groups, **Then** qualified teams have distinctive positive styling (e.g., green indicators) and eliminated teams have distinctive negative styling (e.g., red indicators)
4. **Given** all 8 qualified teams have been determined, **When** the Swiss stage completes, **Then** the qualified teams section shows all 8 teams ready for knockout stage
5. **Given** the knockout stage is visible, **When** viewing the horizontal scroll, **Then** the knockout bracket appears as a continuation after the qualified/eliminated results section

---

### User Story 4 - Fixed Navigation Controls (Priority: P2)

Users need persistent access to stage information and controls: a fixed top bar summarizing round progress and a fixed bottom control bar housing the draw algorithm selector plus round action buttons, so navigation and progression remain available while scrolling horizontally.

**Why this priority**: Quality-of-life improvement that enhances usability. Independently valuable for navigation but not critical for core functionality. Can be added after layout is established.

**Independent Test**: Can be tested by scrolling horizontally through rounds and verifying that the top information bar and bottom control bar both remain visible, with the bottom bar anchoring the draw selector on the left and action buttons on the right.

**Acceptance Scenarios**:

1. **Given** the Swiss stage is active, **When** the user scrolls horizontally through rounds, **Then** the top information bar remains fixed at the top of the viewport
2. **Given** the top information bar is visible, **When** viewing it, **Then** it displays current round number, total rounds, and stage status
3. **Given** the user scrolls horizontally, **When** viewing the bottom control bar, **Then** it remains fixed to the bottom edge with the draw algorithm selector aligned to the left
4. **Given** the bottom control bar is visible, **When** the user clicks "Simulate Next Round" or "Reset Tournament", **Then** the action executes without disrupting the scroll position
5. **Given** the user clicks "Simulate Next Round", **When** the simulation begins, **Then** the UI shows the matchup preview and plays the hype animation before final results appear
6. **Given** the user simulates a new round, **When** the round is created, **Then** the view automatically scrolls smoothly to show the newly created round

---

### User Story 5 - Integrated Knockout Stage View (Priority: P3)

Users need to see the knockout stage bracket as a seamless continuation in the horizontal scroll after the Swiss results section, providing a complete tournament visualization in a single unified timeline.

**Why this priority**: Nice-to-have integration feature that completes the unified timeline vision. Independently testable but lowest priority since knockout stage already has a functional separate view. Can be added last.

**Independent Test**: Can be tested by completing Swiss stage and verifying that knockout bracket appears as the rightmost section in the horizontal scroll after qualified teams, delivers value by providing unified tournament timeline.

**Acceptance Scenarios**:

1. **Given** the Swiss stage is complete, **When** scrolling to the right end of the horizontal layout, **Then** the knockout stage bracket appears as a continuation
2. **Given** the knockout bracket is visible, **When** viewing it, **Then** it displays quarterfinals, semifinals, and finals in a traditional bracket format
3. **Given** the user is viewing knockout stage in horizontal layout, **When** they interact with matches, **Then** match simulation and team clicks work identically to the current knockout view
4. **Given** the knockout stage is not yet unlocked, **When** viewing the horizontal scroll, **Then** a placeholder section indicates "Knockout Stage (Locked - Complete Swiss First)"

---

### Edge Cases

- What happens when only Round 1 is complete? The layout should show a single column with the "0-0" record group, providing a clear starting point without empty columns.
- What happens when the user's viewport is very narrow (mobile)? The horizontal scroll should still function smoothly, with columns stacking appropriately and touch gestures enabled for scrolling.
- What happens when no teams have qualified/eliminated yet? The results section should not appear until at least one team reaches 3 wins or 3 losses.
- What happens when the user rapidly simulates multiple rounds? The layout should update smoothly, potentially with transitions between column additions, without breaking the horizontal scroll position.
- What happens if the user navigates away and returns mid-Swiss? The horizontal scroll should restore to a sensible position (e.g., showing the most recent round) rather than resetting to the start.
- What happens when qualified teams appear in mid-round? Teams with 3 wins/losses should still appear in their current round's record group until the round completes, then move to the results section in the next view.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display each Swiss round as a separate vertical column with fixed uniform width in a horizontal scrollable layout
- **FR-002**: System MUST arrange round columns in chronological order from left to right (Round 1 → Round 5)
- **FR-003**: Within each round column, system MUST group teams by their current win-loss record (e.g., "2-1", "0-2") ordered from best to worst (highest wins first)
- **FR-004**: System MUST display record group headers clearly showing the wins-losses combination
- **FR-005**: System MUST render each match as a single horizontal row (team1 – "vs" – team2) within the record group, relying on the group header for the shared record label
- **FR-006**: System MUST provide horizontal scrolling capability when round columns exceed viewport width
- **FR-007**: System MUST display a "Qualified Teams (3 Wins)" section after the final round column when at least one team has qualified, showing teams as individual cards without match pairing indicators
- **FR-008**: System MUST display an "Eliminated Teams (3 Losses)" section after the final round column when at least one team has been eliminated, showing teams as individual cards without match pairing indicators
- **FR-009**: System MUST apply distinctive visual styling to qualified teams (positive indicators) and eliminated teams (negative indicators)
- **FR-010**: System MUST display a fixed navigation bar at the top of the viewport that remains visible during horizontal scrolling
- **FR-011**: Fixed navigation bar MUST show current round number, total rounds, and stage status (information only)
- **FR-012**: System MUST provide a fixed bottom control bar with the draw algorithm selector anchored on the left and the "Simulate Next Round"/"Reset Tournament" buttons anchored on the right
- **FR-013**: System MUST display the knockout stage bracket as a continuation in the horizontal scroll after the Swiss results section
- **FR-014**: System MUST only display the knockout section when the Swiss stage is complete
- **FR-015**: System MUST support touch gestures for horizontal scrolling on mobile and tablet devices
- **FR-016**: System MUST maintain proper team status badges (QUALIFIED/ELIMINATED/ACTIVE) within the horizontal layout
- **FR-017**: System MUST preserve existing team click and match simulation functionality in the new layout
- **FR-018**: When a round is simulated, system MUST highlight only the winning team in completed matches
- **FR-019**: When displaying a newly created round (before simulation), system MUST show teams without any winner highlighting to indicate upcoming matchups
- **FR-020**: When a new round is simulated, system MUST automatically scroll the horizontal view to show the newly created round using smooth scroll animation
- **FR-021**: When the user initiates round simulation, the UI MUST first present the upcoming matchup preview and then play the hype animation before revealing match results

### Key Entities

- **Round Column**: Represents a single Swiss round as a vertical column, containing one or more record groups, with a round number header (1-5)
- **Record Group**: A card-style container grouping matches for a shared record (e.g., "2-1"), with a single header label and horizontally arranged matchup rows inside
- **Results Section**: A special column appearing after Round 5 that displays qualified and eliminated teams in separate groups with distinctive styling
- **Fixed Navigation Bar**: A persistent top menu containing round information, stage status, and action buttons that remains visible during horizontal scrolling
- **Horizontal Timeline**: The complete scrollable container encompassing all round columns, results section, and knockout bracket

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all 5 Swiss rounds simultaneously by scrolling horizontally across columns without page refresh
- **SC-002**: Users can identify a team's performance trajectory by visually scanning their position across round columns in under 10 seconds
- **SC-003**: Users can distinguish between qualified, eliminated, and active teams at a glance through visual styling differences
- **SC-004**: Users can simulate rounds and update tournament state while maintaining access to navigation controls without scrolling back to top
- **SC-005**: The horizontal scroll experience operates smoothly on desktop, tablet, and mobile viewports with appropriate touch gesture support
- **SC-006**: Users can navigate from Swiss round 1 through to the knockout finals in a single unified horizontal timeline without switching views
- **SC-007**: Record groups within each round are visually distinct and clearly labeled, reducing confusion about team standings by enabling instant visual parsing of tournament state
