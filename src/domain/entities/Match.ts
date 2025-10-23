import type { Match } from './types';
import { StageType, KnockoutRound } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new match
 */
export function createMatch(
  team1Id: string,
  team2Id: string,
  stage: StageType,
  roundNumber: number,
  recordBracket?: string,
  knockoutRound?: KnockoutRound
): Match {
  return {
    id: uuidv4(),
    team1Id,
    team2Id,
    winnerId: null,
    stage,
    roundNumber,
    recordBracket: recordBracket || null,
    knockoutRound: knockoutRound || null,
    locked: false,
  };
}

/**
 * Resolve a match by setting the winner
 */
export function resolveMatch(match: Match, winnerId: string): Match {
  if (winnerId !== match.team1Id && winnerId !== match.team2Id) {
    throw new Error(`Winner ID ${winnerId} must be either team1Id or team2Id`);
  }

  return {
    ...match,
    winnerId,
  };
}

/**
 * Check if a match has been resolved (has a winner)
 */
export function isMatchResolved(match: Match): boolean {
  return match.winnerId !== null;
}

/**
 * Clear match result
 */
export function clearMatchResult(match: Match): Match {
  return {
    ...match,
    winnerId: null,
  };
}

/**
 * Lock a match to prevent re-draw
 */
export function lockMatch(match: Match): Match {
  return {
    ...match,
    locked: true,
  };
}

/**
 * Unlock a match
 */
export function unlockMatch(match: Match): Match {
  return {
    ...match,
    locked: false,
  };
}

/**
 * Get the loser of a match
 */
export function getMatchLoser(match: Match): string | null {
  if (!match.winnerId) {
    return null;
  }
  return match.winnerId === match.team1Id ? match.team2Id : match.team1Id;
}
