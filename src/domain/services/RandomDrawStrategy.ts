import type { Team, Match } from '../entities/types';
import type { IDrawStrategy, SimulationResult } from './interfaces';

/**
 * Random draw strategy - 50/50 chance for each team
 */
export class RandomDrawStrategy implements IDrawStrategy {
  /**
   * Calculate win probability for random draw (always 0.5)
   */
  calculateWinProbability(team1: Team, team2: Team): number {
    return 0.5;
  }

  /**
   * Simulate a match with random outcome
   */
  simulateMatch(match: Match, team1: Team, team2: Team): SimulationResult {
    const probability = this.calculateWinProbability(team1, team2);
    const random = Math.random();

    const winnerId = random < probability ? team1.id : team2.id;
    const loserId = winnerId === team1.id ? team2.id : team1.id;

    return {
      winnerId,
      loserId,
      probability,
    };
  }
}
