import type { ISwissMatchmaker } from './interfaces';
import type { Team, Match, MatchHistory } from 'domain/entities/types';
import { StageType } from 'domain/entities/types';
import { createMatch } from 'domain/entities/Match';
import { getTeamsByRecord } from 'domain/entities/Team';
import { canPairTeams, haveTeamsMet } from 'domain/rules/pairing-constraints';

/**
 * Swiss Matchmaker - creates pairings for Swiss stage rounds
 * Uses official Riot algorithm: teams with same record, avoid repeat matchups
 */
export class SwissMatchmaker implements ISwissMatchmaker {
  /**
   * Create matches for a Swiss round
   * @returns Array of matches, or null if pairing is impossible
   */
  createMatches(
    teams: Team[],
    roundNumber: number,
    matchHistory: ReadonlyArray<MatchHistory>
  ): Match[] | null {
    // Group teams by record
    const recordGroups = this.groupTeamsByRecord(teams);

    const matches: Match[] = [];
    const paired = new Set<string>();

    // Try to pair teams within each record bracket
    for (const [record, groupTeams] of recordGroups) {
      const unpaired = groupTeams.filter(team => !paired.has(team.id));

      if (unpaired.length % 2 !== 0) {
        // Odd number of teams in bracket - cannot pair perfectly
        console.warn(`Odd number of teams in bracket ${record}, pairing may fail`);
        return null;
      }

      const bracketMatches = this.pairTeamsInBracket(
        unpaired,
        roundNumber,
        record,
        matchHistory
      );

      if (!bracketMatches) {
        return null; // Pairing failed
      }

      // Mark teams as paired
      bracketMatches.forEach(match => {
        paired.add(match.team1Id);
        paired.add(match.team2Id);
      });

      matches.push(...bracketMatches);
    }

    return matches;
  }

  /**
   * Check if two teams can be paired
   */
  canPairTeams(
    team1: Team,
    team2: Team,
    matchHistory: ReadonlyArray<MatchHistory>
  ): boolean {
    return canPairTeams(team1, team2, matchHistory);
  }

  /**
   * Group teams by their record (wins-losses)
   */
  private groupTeamsByRecord(teams: Team[]): Map<string, Team[]> {
    const groups = new Map<string, Team[]>();

    teams.forEach(team => {
      const record = `${team.wins}-${team.losses}`;
      if (!groups.has(record)) {
        groups.set(record, []);
      }
      groups.get(record)!.push(team);
    });

    return groups;
  }

  /**
   * Pair teams within a single record bracket
   * Uses greedy algorithm with shuffling and retries
   */
  private pairTeamsInBracket(
    teams: Team[],
    roundNumber: number,
    recordBracket: string,
    matchHistory: ReadonlyArray<MatchHistory>
  ): Match[] | null {
    if (teams.length === 0) {
      return [];
    }

    if (teams.length % 2 !== 0) {
      return null;
    }

    // Try up to 10 different shuffles to find valid pairing
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const shuffledTeams = this.shuffleArray([...teams]);
      const matches = this.greedyPairing(
        shuffledTeams,
        roundNumber,
        recordBracket,
        matchHistory
      );

      if (matches) {
        return matches;
      }
    }

    // All attempts failed
    return null;
  }

  /**
   * Greedy pairing algorithm - pair first available team with first valid opponent
   */
  private greedyPairing(
    teams: Team[],
    roundNumber: number,
    recordBracket: string,
    matchHistory: ReadonlyArray<MatchHistory>
  ): Match[] | null {
    const matches: Match[] = [];
    const unpaired = [...teams];

    while (unpaired.length > 0) {
      const team1 = unpaired[0];
      let foundPair = false;

      for (let i = 1; i < unpaired.length; i++) {
        const team2 = unpaired[i];

        if (this.canPairTeams(team1, team2, matchHistory)) {
          matches.push(
            createMatch(team1.id, team2.id, StageType.SWISS, roundNumber, recordBracket)
          );

          unpaired.splice(i, 1); // Remove team2
          unpaired.splice(0, 1); // Remove team1
          foundPair = true;
          break;
        }
      }

      if (!foundPair) {
        return null; // Cannot pair remaining teams
      }
    }

    return matches;
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
