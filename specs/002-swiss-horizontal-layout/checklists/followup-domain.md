# Follow-up: Swiss Stage Domain & Major UI Changes

Created: 2025-10-23  
Feature: 002-swiss-horizontal-layout

The latest UI iteration keeps the small refinements (winner highlight, compact spacing, full-width control bar, sidebar removal). The remaining requests require deeper changes to the simulation workflow and data model. This note captures the scope for a future branch.

---

## Desired End State

1. **Two-step round progression**
   - `Draw` produces next-round matchups **without** resolving winners.
   - `Simulate` (or manual winner selection) resolves the drawn matches and unlocks the next draw.
   - Preview animation (or manual confirmation) occurs between these steps.

2. **Region constraint for opening draw**
   - First-round draw must prevent teams from the same region facing each other.

3. **Qualified/Eliminated slotting within columns**
   - From round 4 onward, the round column should display:
     ```
     Qualified:
     [Team card]
     [Team card]
     2-1:
     [T3 vs T4]
     ...
     Eliminated:
     [Team card]
     ```
   - Qualified teams must remain visible in subsequent columns instead of appearing in a separate results panel.

4. **Future manual match resolution**
   - UI should support “pick the winner” per match in addition to auto-simulate.

---

## Domain / Application Changes Needed

1. **Round lifecycle state**
   - Extend Swiss stage model to distinguish `drawn`, `in_progress`, and `completed` rounds.
   - Store drawn matches separately from resolved match history so UI can show upcoming pairings without winners.

2. **Match struct updates**
   - Add flags for `isDrawn` vs `isResolved`, or track resolution timestamp.
   - Allow a match to carry provisional metadata (e.g., draw animation state, manual winner override).

3. **Simulation use case split**
   - Introduce `drawNextRound()` that only pairs teams and persists matches with `winnerId = null`.
   - Update `simulateRound()` to act only on drawn (unresolved) matches.
   - Ensure repeat invocations guard against double simulation.

4. **Region constraint logic**
   - Enhance SwissMatchmaker: when `currentRound === 1`, enforce no intra-region pairing (backtracking search or deterministic seeding).
   - Surface violation as domain error that UI can handle.

5. **Qualified/Eliminated grouping**
   - Provide helpers that compute per-round groupings with “Qualified” and “Eliminated” buckets alongside active record brackets.
   - Consider returning an ordered structure such as:
     ```ts
     type RoundDisplayGroup =
       | { type: 'qualified'; teams: Team[] }
       | { type: 'record'; record: string; matches: MatchWithTeams[] }
       | { type: 'eliminated'; teams: Team[] };
     ```

6. **Manual winner override (future)**
   - Expose application service that accepts a match id and winner id, replays downstream qualification logic, and re-seeds upcoming rounds accordingly.

---

## UI Changes To Implement After Domain Work

1. **Control bar flow**
   - Replace single “Simulate” button with `Draw` → `Simulate` steps, disabling/enabling buttons based on round lifecycle.
   - Show status messaging for drawn-but-unresolved rounds.

2. **Round column composition**
   - Render qualified and eliminated cards at the top/bottom of columns using the ordered groups from the domain helper.
   - Keep consistent card styling with the existing `MatchRow`/`TeamCard`.

3. **Regional draw feedback**
   - If the draw fails due to region conflicts, surface a warning banner with suggested remediation (e.g., reshuffle).

4. **Manual winner selection prep**
   - Design match rows to accept a “select winner” affordance (radio buttons or button group) while preserving current layout.

5. **Animation/transition hooks**
   - Reintroduce preview animation only after domain exposes distinct draw/sim states. Respect reduced motion and avoid hiding resolved data.

---

## Suggested Implementation Order (Future Branch)

1. Domain: introduce round lifecycle state + draw-only function.
2. Update SwissMatchmaker for region constraint and return richer pairing metadata.
3. Adapt application hook to expose new handlers (`drawRound`, `simulateDrawnRound`, `setManualWinner` placeholder).
4. Update UI components (control bar, round column rendering) to consume the new structures.
5. Reinstate animation and manual selection UI once the underlying state transitions exist.
6. Extend automated tests to cover draw-only rounds, region constraint, and manual overrides.

---

## Notes

- Current branch keeps the legacy single-step `simulateRound()` flow to avoid partial domain changes.
- Qualified/Eliminated teams still appear in the separate results column until the new grouping logic is available.
- Use this document as the basis for a follow-up feature specification or ADR before altering the domain layer.
