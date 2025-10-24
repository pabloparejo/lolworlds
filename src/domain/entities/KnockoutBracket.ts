import type { KnockoutRound } from 'domain/entities/types';

export interface KnockoutMatchSlot {
  id: string;
  round: KnockoutRound;
  teamAId: string | null;
  teamBId: string | null;
  winnerId: string | null;
}

export interface KnockoutDrawEvent {
  order: number;
  selectedTeamId: string;
  opponentTeamId: string;
}

export interface KnockoutBracket {
  matches: KnockoutMatchSlot[];
  drawHistory: KnockoutDrawEvent[];
  source: 'auto-generated';
}

export function createEmptyKnockoutBracket(): KnockoutBracket {
  return {
    matches: [],
    drawHistory: [],
    source: 'auto-generated',
  };
}
