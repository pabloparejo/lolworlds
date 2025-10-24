import { StageType } from 'domain/entities/types';
import type { Match, MatchHistory, Team } from 'domain/entities/types';
import type { BaselineRound, SeedingConfig } from 'domain/entities/SeedingConfig';
import type { RoundDefinition } from 'domain/entities/RoundDefinition';
import { createMatch } from 'domain/entities/Match';
import { createRound } from 'domain/entities/Round';
import { createRoundDefinition } from 'domain/entities/RoundDefinition';
import { SwissMatchmaker } from 'domain/services/SwissMatchmaker';

export interface GenerateRoundParams {
  roundNumber: number;
  teams: Team[];
  matchHistory: MatchHistory[];
  seedingConfig: SeedingConfig;
  baselineRounds?: BaselineRound[];
}

export interface GenerateRoundResult {
  matches: Match[];
  round: RoundDefinition;
}

const FIRST_ROUND_RECORD = '0-0';

/**
 * SwissDrawService orchestrates tier-aware pairing, record grouping, and redraw logic.
 */
export class SwissDrawService {
  private readonly matchmaker: SwissMatchmaker;

  constructor(matchmaker: SwissMatchmaker = new SwissMatchmaker()) {
    this.matchmaker = matchmaker;
  }

  generateRound(params: GenerateRoundParams): GenerateRoundResult {
    const { roundNumber, teams, matchHistory, seedingConfig, baselineRounds } = params;

    const baseline = baselineRounds?.find(round => round.roundNumber === roundNumber);
    if (baseline) {
      return this.applyBaselineRound(baseline, teams, roundNumber);
    }

    if (roundNumber === 1) {
      return this.generateFirstRound(teams, seedingConfig);
    }

    return this.generateStandardRound(roundNumber, teams, matchHistory);
  }

  private applyBaselineRound(
    baseline: BaselineRound,
    teams: Team[],
    roundNumber: number
  ): GenerateRoundResult {
    const teamMap = new Map(teams.map(team => [team.id, team]));
    const used = new Set<string>();

    const matches = baseline.matchups.map(matchup => {
      const teamA = teamMap.get(matchup.teamAId);
      const teamB = teamMap.get(matchup.teamBId);

      if (!teamA || !teamB) {
        throw new Error(`Baseline round references unknown team (${matchup.teamAId} vs ${matchup.teamBId})`);
      }

      if (used.has(teamA.id) || used.has(teamB.id)) {
        throw new Error('Baseline round contains duplicate team assignment');
      }

      used.add(teamA.id);
      used.add(teamB.id);

      return createMatch(teamA.id, teamB.id, StageType.SWISS, roundNumber, FIRST_ROUND_RECORD);
    });

    const round = createRound(roundNumber, matches.map(match => match.id), [FIRST_ROUND_RECORD]);

    return {
      matches,
      round: createRoundDefinition(round, 'baseline-json'),
    };
  }

  private generateFirstRound(teams: Team[], seedingConfig: SeedingConfig): GenerateRoundResult {
    const teamMap = new Map(teams.map(team => [team.id, team]));

    const tier1 = this.shuffle(seedingConfig.tiers.tier1 ?? []).map(id => this.requireTeam(id, teamMap));
    const tier2 = this.shuffle(seedingConfig.tiers.tier2 ?? []).map(id => this.requireTeam(id, teamMap));
    const tier3 = this.shuffle(seedingConfig.tiers.tier3 ?? []).map(id => this.requireTeam(id, teamMap));

    if (tier1.length !== 5 || tier2.length !== 6 || tier3.length !== 5) {
      throw new Error('Tier configuration invalid: expected 5/6/5 teams for tier1/2/3');
    }

    const matches: Match[] = [];
    const usedTier3 = new Set<string>();

    tier1.forEach(team1 => {
      const opponent = tier3.find(candidate => !usedTier3.has(candidate.id) && candidate.region !== team1.region);

      if (!opponent) {
        throw new Error(`Unable to find Tier3 opponent for ${team1.name} without violating region rules`);
      }

      usedTier3.add(opponent.id);
      matches.push(this.createSwissMatch(team1.id, opponent.id, 1, FIRST_ROUND_RECORD));
    });

    const tier3Remaining = tier3.filter(team => !usedTier3.has(team.id));
    if (tier3Remaining.length !== 0) {
      throw new Error('Tier3 pairing mismatch, leftover teams remain');
    }

    // Pair tier2 teams together respecting region differences and avoiding duplicates
    const tier2Matches = this.pairWithinGroup(tier2, 1, FIRST_ROUND_RECORD);
    matches.push(...tier2Matches);

    const round = createRound(1, matches.map(match => match.id), [FIRST_ROUND_RECORD]);

    return {
      matches,
      round: createRoundDefinition(round, 'simulated'),
    };
  }

  private generateStandardRound(
    roundNumber: number,
    teams: Team[],
    matchHistory: MatchHistory[]
  ): GenerateRoundResult {
    const matches = this.matchmaker.createMatches(teams, roundNumber, matchHistory);

    if (!matches) {
      throw new Error('Failed to generate Swiss pairings');
    }

    const recordBrackets = Array.from(
      new Set(matches.map(match => match.recordBracket ?? ''))
    ).filter(Boolean);

    const round = createRound(roundNumber, matches.map(match => match.id), recordBrackets);

    return {
      matches,
      round: createRoundDefinition(round, 'simulated'),
    };
  }

  private pairWithinGroup(teams: Team[], roundNumber: number, recordBracket: string): Match[] {
    const remaining = [...teams];
    const matches: Match[] = [];

    if (remaining.length % 2 !== 0) {
      throw new Error('Expected even number of teams for pairing');
    }

    const attempts = 10;
    for (let attempt = 0; attempt < attempts; attempt++) {
      this.shuffleInPlace(remaining);
      matches.length = 0;
      const used = new Set<string>();
      let failed = false;

      for (let i = 0; i < remaining.length; i++) {
        const team = remaining[i];
        if (used.has(team.id)) {
          continue;
        }

        const opponent = remaining.slice(i + 1).find(candidate => {
          return !used.has(candidate.id) && candidate.region !== team.region;
        });

        if (!opponent) {
          failed = true;
          break;
        }

        used.add(team.id);
        used.add(opponent.id);
        matches.push(this.createSwissMatch(team.id, opponent.id, roundNumber, recordBracket));
      }

      if (!failed && matches.length === remaining.length / 2) {
        return [...matches];
      }
    }

    throw new Error('Unable to pair tier group without regional conflicts');
  }

  private createSwissMatch(teamAId: string, teamBId: string, roundNumber: number, recordBracket: string): Match {
    return createMatch(teamAId, teamBId, StageType.SWISS, roundNumber, recordBracket);
  }

  private requireTeam(id: string, map: Map<string, Team>): Team {
    const team = map.get(id);
    if (!team) {
      throw new Error(`Seeding configuration references unknown team ${id}`);
    }
    return team;
  }

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    this.shuffleInPlace(arr);
    return arr;
  }

  private shuffleInPlace<T>(items: T[]): void {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }
}
