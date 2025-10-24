import type { Team } from 'domain/entities/types';
import { KnockoutRound } from 'domain/entities/types';
import type { KnockoutBracket } from 'domain/entities/KnockoutBracket';

export interface KnockoutDrawResult {
  bracket: KnockoutBracket;
}

/**
 * KnockoutDrawService enforces Worlds bracket rules: 3-0 vs 3-2 on opposite sides,
 * remaining teams drawn sequentially. Implementation pending.
 */
export class KnockoutDrawService {
  generateBracket(_teams: Team[]): KnockoutDrawResult {
    throw new Error('KnockoutDrawService.generateBracket not implemented yet');
  }

  /** Utility placeholder to determine bracket side for 3-0 teams. */
  protected assignTopSeeds(_teams: Team[]): Array<{ round: KnockoutRound; teamIds: string[] }> {
    throw new Error('KnockoutDrawService.assignTopSeeds not implemented yet');
  }
}
