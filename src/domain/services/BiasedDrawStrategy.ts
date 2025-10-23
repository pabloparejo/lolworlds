import { IDrawStrategy, SimulationResult } from './interfaces';
import type { Team, Match } from '../entities/types';
import { REGIONAL_STRENGTHS } from '../entities/types';

/**
 * Biased draw strategy - uses regional strength formula
 * P(Team1 wins) = Strength1 / (Strength1 + Strength2)
 */
export class BiasedDrawStrategy implements IDrawStrategy {
  /**
   * Calculate win probability based on regional strength
   */
  calculateWinProbability(team1: Team, team2: Team): number {
    const strength1 = REGIONAL_STRENGTHS[team1.region];
    const strength2 = REGIONAL_STRENGTHS[team2.region];

    return strength1 / (strength1 + strength2);
  }

  /**
   * Simulate a match with biased outcome based on regional strength
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
