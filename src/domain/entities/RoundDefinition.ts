import type { Round } from 'domain/entities/types';

export type RoundSource = 'simulated' | 'manual' | 'baseline-json';

export interface RoundDefinition extends Round {
  /**
   * Origin of this round.
   */
  source: RoundSource;
  /**
   * Match IDs where winners have been manually locked.
   */
  lockedMatchIds: string[];
}

export function createRoundDefinition(round: Round, source: RoundSource): RoundDefinition {
  return {
    ...round,
    source,
    lockedMatchIds: [],
  };
}
