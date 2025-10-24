/**
 * Groups matches by their record bracket (e.g., "2-1", "0-2")
 * and sorts them from best to worst (highest wins first, then lowest losses)
 */
export function groupMatchesByRecord<T extends { recordBracket: string | null }>(matches: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  matches.forEach(match => {
    const record = match.recordBracket ?? '0-0';
    if (!groups.has(record)) {
      groups.set(record, []);
    }
    groups.get(record)!.push(match);
  });

  return new Map(
    [...groups.entries()].sort((a, b) => {
      const [winsA, lossesA] = a[0].split('-').map(Number);
      const [winsB, lossesB] = b[0].split('-').map(Number);

      const winsDiff = (Number.isNaN(winsB) ? 0 : winsB) - (Number.isNaN(winsA) ? 0 : winsA);
      if (winsDiff !== 0) {
        return winsDiff;
      }

      return (Number.isNaN(lossesA) ? 0 : lossesA) - (Number.isNaN(lossesB) ? 0 : lossesB);
    })
  );
}

/**
 * Determines if a round should be displayed based on current round progress
 */
export function shouldDisplayRound(round: number, currentRound: number): boolean {
  return round <= currentRound;
}
