import type { Region } from 'domain/entities/types';

export type TierName = 'tier1' | 'tier2' | 'tier3';

export interface SeedingTeam {
  id: string;
  name: string;
  region: Region;
  seed: number;
}

export interface BaselineMatchup {
  teamAId: string;
  teamBId: string;
}

export interface BaselineRound {
  roundNumber: number;
  source: 'baseline-json' | 'manual-import';
  matchups: BaselineMatchup[];
}

export interface SeedingConfig {
  formatVersion: string;
  metadata?: Record<string, unknown>;
  tiers: Record<TierName, string[]>;
  teams: SeedingTeam[];
  baselineRounds: BaselineRound[];
}

export function createEmptySeedingConfig(): SeedingConfig {
  return {
    formatVersion: '1.0.0',
    tiers: {
      tier1: [],
      tier2: [],
      tier3: [],
    },
    teams: [],
    baselineRounds: [],
  };
}
