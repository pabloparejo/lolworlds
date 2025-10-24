import { Region } from 'domain/entities/types';
import type {
  BaselineRound,
  SeedingConfig,
  SeedingTeam,
  TierName,
} from 'domain/entities/SeedingConfig';
import { createEmptySeedingConfig } from 'domain/entities/SeedingConfig';

type RawTierKey = 'tier1' | 'tier2' | 'tier3';

interface RawTeam {
  id: string;
  name: string;
  region: Region;
  seed: number;
}

interface RawInitialRound {
  roundNumber: number;
  source?: 'baseline-json' | 'manual-import';
  matchups: Array<{ teamA: string; teamB: string }>;
}

interface RawSeedingFile {
  metadata?: Record<string, unknown> & { season?: string; formatVersion?: string };
  teams: RawTeam[];
  tiers: Record<RawTierKey, string[]>;
  initialRounds?: RawInitialRound[];
}

export type SeedingLoaderErrorCode =
  | 'NETWORK_ERROR'
  | 'INVALID_JSON'
  | 'INVALID_SCHEMA'
  | 'VALIDATION_ERROR';

export class SeedingLoaderError extends Error {
  readonly code: SeedingLoaderErrorCode;
  readonly messages: string[];

  constructor(code: SeedingLoaderErrorCode, message: string, messages: string[] = []) {
    super(message);
    this.code = code;
    this.messages = messages.length ? messages : [message];
  }
}

export class SeedingLoader {
  private readonly fetchImpl: typeof fetch;

  constructor(fetchImpl?: typeof fetch) {
    const candidate = fetchImpl ?? (typeof globalThis !== 'undefined' ? globalThis.fetch : undefined);

    if (!candidate) {
      throw new SeedingLoaderError(
        'NETWORK_ERROR',
        'Fetch API is not available in the current environment'
      );
    }

    this.fetchImpl = candidate.bind(globalThis) as typeof fetch;
  }

  async load(path: string = '/teams.json'): Promise<SeedingConfig> {
    const response = await this.safeFetch(path);
    const payload = await this.parseJson(response);
    this.validateSchema(payload);
    const validationErrors = this.validateBusinessRules(payload);

    if (validationErrors.length > 0) {
      throw new SeedingLoaderError(
        'VALIDATION_ERROR',
        'Seeding configuration failed validation',
        validationErrors
      );
    }

    return this.normalize(payload);
  }

  private async safeFetch(path: string): Promise<Response> {
    try {
      const res = await this.fetchImpl(path);
      if (!res.ok) {
        throw new SeedingLoaderError(
          'NETWORK_ERROR',
          `Failed to fetch seeding config (${res.status} ${res.statusText})`
        );
      }
      return res;
    } catch (error) {
      if (error instanceof SeedingLoaderError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new SeedingLoaderError('NETWORK_ERROR', `Seeding config fetch error: ${message}`);
    }
  }

  private async parseJson(response: Response): Promise<RawSeedingFile> {
    try {
      return (await response.json()) as RawSeedingFile;
    } catch {
      throw new SeedingLoaderError('INVALID_JSON', 'Seeding config is not valid JSON');
    }
  }

  private validateSchema(payload: RawSeedingFile): void {
    const messages: string[] = [];

    if (!payload || typeof payload !== 'object') {
      messages.push('Root payload must be an object');
    }

    if (!Array.isArray(payload.teams) || payload.teams.length === 0) {
      messages.push('`teams` array is required and cannot be empty');
    }

    if (!payload.tiers || typeof payload.tiers !== 'object') {
      messages.push('`tiers` object is required');
    } else {
      (['tier1', 'tier2', 'tier3'] as RawTierKey[]).forEach((tierKey) => {
        if (!Array.isArray(payload.tiers[tierKey])) {
          messages.push(`\`tiers.${tierKey}\` must be an array`);
        }
      });
    }

    if (messages.length > 0) {
      throw new SeedingLoaderError('INVALID_SCHEMA', 'Seeding config schema invalid', messages);
    }
  }

  private validateBusinessRules(payload: RawSeedingFile): string[] {
    const errors: string[] = [];

    // Uniqueness
    const teamIds = payload.teams.map((team) => team.id);
    if (new Set(teamIds).size !== teamIds.length) {
      errors.push('Team IDs must be unique');
    }

    payload.teams.forEach((team, index) => {
      if (!team.id || typeof team.id !== 'string') {
        errors.push(`teams[${index}].id is required`);
      }
      if (!team.name || typeof team.name !== 'string') {
        errors.push(`teams[${index}].name is required`);
      }
      if (!Object.values(Region).includes(team.region)) {
        errors.push(`teams[${index}].region "${team.region}" is not a valid Region`);
      }
      if (![1, 2, 3].includes(team.seed)) {
        errors.push(`teams[${index}].seed "${team.seed}" must be 1, 2, or 3`);
      }
    });

    // Tier membership
    const tierMembership = new Map<string, TierName>();
    (['tier1', 'tier2', 'tier3'] as TierName[]).forEach((tierKey) => {
      const members = payload.tiers[tierKey] ?? [];
      members.forEach((teamId) => {
        if (!teamIds.includes(teamId)) {
          errors.push(`Tier ${tierKey} references unknown team "${teamId}"`);
        }
        if (tierMembership.has(teamId)) {
          errors.push(`Team "${teamId}" appears in multiple tiers`);
        } else {
          tierMembership.set(teamId, tierKey);
        }
      });
    });

    const REQUIRED_COUNTS: Record<TierName, number> = {
      tier1: 5,
      tier2: 6,
      tier3: 5,
    };

    (['tier1', 'tier2', 'tier3'] as TierName[]).forEach((tierKey) => {
      const actualCount = (payload.tiers[tierKey] ?? []).length;
      if (actualCount !== REQUIRED_COUNTS[tierKey]) {
        errors.push(`Tier ${tierKey} must contain ${REQUIRED_COUNTS[tierKey]} teams (found ${actualCount})`);
      }
    });

    // Seed alignment
    payload.teams.forEach((team) => {
      const tier = tierMembership.get(team.id);
      if (!tier) {
        errors.push(`Team "${team.id}" is missing tier assignment`);
        return;
      }

      if (tier === 'tier1' && team.seed !== 1) {
        errors.push(`Tier1 team "${team.id}" must have seed=1`);
      }
      if (tier === 'tier2' && team.seed !== 2 && team.seed !== 3) {
        errors.push(`Tier2 team "${team.id}" must have seed=2 or promoted seed=3`);
      }
      if (tier === 'tier3' && team.seed !== 3) {
        errors.push(`Tier3 team "${team.id}" must have seed=3`);
      }
    });

    // Initial rounds validation
    (payload.initialRounds ?? []).forEach((round, roundIndex) => {
      if (typeof round.roundNumber !== 'number') {
        errors.push(`initialRounds[${roundIndex}].roundNumber must be a number`);
      }
      if (!Array.isArray(round.matchups) || round.matchups.length === 0) {
        errors.push(`initialRounds[${roundIndex}] must include at least one matchup`);
      }
      const seenTeams = new Set<string>();
      round.matchups.forEach((matchup, matchupIndex) => {
        if (!matchup.teamA || !teamIds.includes(matchup.teamA)) {
          errors.push(`initialRounds[${roundIndex}].matchups[${matchupIndex}].teamA is invalid`);
        }
        if (!matchup.teamB || !teamIds.includes(matchup.teamB)) {
          errors.push(`initialRounds[${roundIndex}].matchups[${matchupIndex}].teamB is invalid`);
        }
        if (matchup.teamA === matchup.teamB) {
          errors.push(`initialRounds[${roundIndex}].matchups[${matchupIndex}] cannot pair a team with itself`);
        }

        const pairKey = [matchup.teamA, matchup.teamB].sort().join('::');
        if (seenTeams.has(matchup.teamA) || seenTeams.has(matchup.teamB)) {
          errors.push(`initialRounds[${roundIndex}] contains duplicate team assignment`);
        }
        seenTeams.add(matchup.teamA);
        seenTeams.add(matchup.teamB);

        if (this.hasDuplicateBaselineMatch(roundIndex, matchupIndex, payload.initialRounds ?? [])) {
          errors.push(`Matchup ${pairKey} repeats across baseline rounds`);
        }
      });
    });

    return errors;
  }

  private hasDuplicateBaselineMatch(
    roundIndex: number,
    matchupIndex: number,
    rounds: RawInitialRound[]
  ): boolean {
    const current = rounds[roundIndex]?.matchups[matchupIndex];
    if (!current) {
      return false;
    }
    return rounds.some((round, idx) => {
      if (idx >= roundIndex) {
        return false;
      }
      return round.matchups.some((matchup) => {
        const pairA = [current.teamA, current.teamB].sort().join('::');
        const pairB = [matchup.teamA, matchup.teamB].sort().join('::');
        return pairA === pairB;
      });
    });
  }

  private normalize(payload: RawSeedingFile): SeedingConfig {
    const base = createEmptySeedingConfig();
    const formatVersion =
      (payload.metadata?.formatVersion && typeof payload.metadata.formatVersion === 'string'
        ? payload.metadata.formatVersion
        : base.formatVersion);

    const teams: SeedingTeam[] = payload.teams.map((team) => ({
      id: team.id,
      name: team.name,
      region: team.region,
      seed: team.seed,
    }));

    const tiers: Record<TierName, string[]> = {
      tier1: [...new Set(payload.tiers.tier1 ?? [])],
      tier2: [...new Set(payload.tiers.tier2 ?? [])],
      tier3: [...new Set(payload.tiers.tier3 ?? [])],
    };

    const baselineRounds: BaselineRound[] = (payload.initialRounds ?? []).map((round) => ({
      roundNumber: round.roundNumber,
      source: round.source ?? 'baseline-json',
      matchups: round.matchups.map((matchup) => ({
        teamAId: matchup.teamA,
        teamBId: matchup.teamB,
      })),
    }));

    return {
      formatVersion,
      metadata: payload.metadata,
      tiers,
      teams,
      baselineRounds,
    };
  }
}
