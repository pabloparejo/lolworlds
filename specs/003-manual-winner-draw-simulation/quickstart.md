# Quickstart — Manual Match Authoring & Simulation Controls

**Audience**: Curators/developers verifying the manual round tooling  
**Prerequisites**: Node 20+, npm install (project root)

---

## 1. Prepare JSON Configuration

1. Edit `public/teams.json` (or create `public/config/worlds-2025.json`) to include:
   - Stable team IDs, region, seed, tier assignment.
   - Optional `initialRounds` baseline for partial reset.
2. Run `npm run lint -- --max-warnings=0` to ensure JSON passes linting (if scripted) or validate via `seedingLoader` tests (see section 4).

---

## 2. Boot the Simulator

1. Start dev server: `npm run dev`.  
2. Ensure `useTournament` loads the updated configuration (check network tab for `teams.json`).  
3. Confirm the Swiss stage displays tier labels for round one.

---

## 3. Manual Round Workflow

1. Generate initial round via Swiss Control Bar (`Simulate Round` or equivalent).  
2. Open the manual round editor (new “Create Manual Round” CTA).  
3. Select teams and lock matchups, verifying duplicate detection.  
4. Save manual round; UI should mark the round as `Manual`.

---

## 4. Manual Winner Locks & Simulation

1. In the current round, click team badges to lock winners (visual indicator toggles).  
2. Attempt to simulate the round:
   - Locked matches stay fixed.
   - Unlocked matches simulate using the configured algorithm.
3. When all matches locked, the CTA changes to “Advance Round”; use it to progress without randomization.

---

## 5. Reset Scenarios

1. **Partial Reset**:  
   - Trigger from control bar.  
   - Expect tournament to revert to JSON baseline rounds (manual additions removed, locks cleared).
2. **Full Reset**:  
   - Reloads entire tournament from scratch, leaving only initial team list.

Validate by refreshing the page and confirming state persistence matches expectations.

---

## 6. Knockout Draw (Read-Only)

1. Progress Swiss until 8 teams qualify (simulate or lock as needed).  
2. Generate knockout bracket; verify:
   - 3-0 teams draw 3-2 opponents on opposite bracket sides.  
   - Draw order recorded/displayed (if implemented).  
   - No manual edits available in UI (read-only).

---

## 7. Testing Checklist

- `npm exec vitest -- --run` (unit + component tests, including new seeding/lock suites).  
- Manual QA flows above.  
- Optionally export/import local storage snapshot to verify persistence across sessions.

---

## 8. Follow-Ups & Future Enhancements

- Manual knockout editing.  
- Play-In automation and tier promotion.  
- JSON import/export tooling via UI.  
- Deterministic RNG seed replay support.
