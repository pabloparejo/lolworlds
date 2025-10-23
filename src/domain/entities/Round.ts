import type { Round, Match } from './types';
import { v4 as uuidv4 } from 'uuid';
import { isMatchResolved } from './Match';

/**
 * Create a new round
 */
export function createRound(
  roundNumber: number,
  matchIds: string[],
  recordBrackets?: string[]
): Round {
  return {
    id: uuidv4(),
    roundNumber,
    matchIds,
    recordBrackets: recordBrackets || [],
  };
}

/**
 * Check if a round is complete (all matches resolved)
 */
export function isRoundComplete(round: Round, matches: Match[]): boolean {
  const roundMatches = matches.filter(match => round.matchIds.includes(match.id));

  if (roundMatches.length === 0) {
    return false;
  }

  return roundMatches.every(match => isMatchResolved(match));
}

/**
 * Get matches for a round
 */
export function getRoundMatches(round: Round, allMatches: Match[]): Match[] {
  return allMatches.filter(match => round.matchIds.includes(match.id));
}

/**
 * Add a match to a round
 */
export function addMatchToRound(round: Round, matchId: string): Round {
  return {
    ...round,
    matchIds: [...round.matchIds, matchId],
  };
}

/**
 * Get record brackets for a round
 */
export function getRecordBrackets(round: Round): string[] {
  return round.recordBrackets;
}
