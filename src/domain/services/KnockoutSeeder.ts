import { IKnockoutSeeder } from './interfaces';
import { Team, Match, KnockoutRound, StageType } from '../entities/types';
import { createMatch } from '../entities/Match';

/**
 * Knockout Seeder - seeds qualified teams into knockout bracket
 * Seeding rules:
 * - 3-0 teams face 3-2 teams
 * - 3-1 teams play between each other plus remaining 3-2 team
 */
export class KnockoutSeeder implements IKnockoutSeeder {
  /**
   * Seed 8 qualified teams into knockout bracket (quarterfinals)
   */
  seedBracket(qualifiedTeams: Team[]): Match[] {
    if (qualifiedTeams.length !== 8) {
      throw new Error(`Expected 8 qualified teams, got ${qualifiedTeams.length}`);
    }

    // Group teams by final record
    const threeZero = qualifiedTeams.filter(t => t.wins === 3 && t.losses === 0);
    const threeOne = qualifiedTeams.filter(t => t.wins === 3 && t.losses === 1);
    const threeTwo = qualifiedTeams.filter(t => t.wins === 3 && t.losses === 2);

    console.log(`Knockout seeding: 3-0: ${threeZero.length}, 3-1: ${threeOne.length}, 3-2: ${threeTwo.length}`);

    // Validate counts
    if (threeZero.length + threeOne.length + threeTwo.length !== 8) {
      throw new Error('Invalid qualification records');
    }

    const matches: Match[] = [];

    // Seed according to rules:
    // 3-0 teams face 3-2 teams
    // 3-1 teams play between each other + remaining 3-2

    let matchNumber = 1;

    // Pair 3-0 with 3-2 teams first
    const threeTwoCopy = [...threeTwo];

    for (const team30 of threeZero) {
      if (threeTwoCopy.length > 0) {
        const team32 = threeTwoCopy.pop()!;
        matches.push(
          createMatch(
            team30.id,
            team32.id,
            StageType.KNOCKOUT,
            1, // Round 1 = Quarterfinals
            undefined,
            KnockoutRound.QUARTERFINALS
          )
        );
        matchNumber++;
      }
    }

    // Pair 3-1 teams with each other and remaining 3-2
    const threeOneCopy = [...threeOne];

    while (threeOneCopy.length >= 2) {
      const team1 = threeOneCopy.pop()!;
      const team2 = threeOneCopy.pop()!;

      matches.push(
        createMatch(
          team1.id,
          team2.id,
          StageType.KNOCKOUT,
          1,
          undefined,
          KnockoutRound.QUARTERFINALS
        )
      );
      matchNumber++;
    }

    // If odd number of 3-1 teams, pair with remaining 3-2
    if (threeOneCopy.length === 1 && threeTwoCopy.length > 0) {
      const team31 = threeOneCopy.pop()!;
      const team32 = threeTwoCopy.pop()!;

      matches.push(
        createMatch(
          team31.id,
          team32.id,
          StageType.KNOCKOUT,
          1,
          undefined,
          KnockoutRound.QUARTERFINALS
        )
      );
      matchNumber++;
    }

    if (matches.length !== 4) {
      console.warn(`Expected 4 quarterfinal matches, created ${matches.length}`);
    }

    return matches;
  }

  /**
   * Create semifinal matches from quarterfinal winners
   */
  createSemifinals(quarterfinalistWinners: string[]): Match[] {
    if (quarterfinalistWinners.length !== 4) {
      throw new Error(`Expected 4 quarterfinalist winners, got ${quarterfinalistWinners.length}`);
    }

    return [
      createMatch(
        quarterfinalistWinners[0],
        quarterfinalistWinners[1],
        StageType.KNOCKOUT,
        2,
        undefined,
        KnockoutRound.SEMIFINALS
      ),
      createMatch(
        quarterfinalistWinners[2],
        quarterfinalistWinners[3],
        StageType.KNOCKOUT,
        2,
        undefined,
        KnockoutRound.SEMIFINALS
      ),
    ];
  }

  /**
   * Create final match from semifinal winners
   */
  createFinals(semifinalistWinners: string[]): Match {
    if (semifinalistWinners.length !== 2) {
      throw new Error(`Expected 2 semifinalist winners, got ${semifinalistWinners.length}`);
    }

    return createMatch(
      semifinalistWinners[0],
      semifinalistWinners[1],
      StageType.KNOCKOUT,
      3,
      undefined,
      KnockoutRound.FINALS
    );
  }
}
