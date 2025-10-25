import { describe, it, expect } from 'vitest';
import { PartialResetTournament } from './PartialResetTournament';
import {
  DrawAlgorithm,
  Region,
  StageStatus,
  StageType,
  TeamStatus,
} from 'domain/entities/types';
import type { TournamentState, Round } from 'domain/entities/types';
import { createMatch } from 'domain/entities/Match';
import { createRound } from 'domain/entities/Round';
import { createSwissStage, createKnockoutStage } from 'domain/entities/Stage';

const createTeam = (id: string): TournamentState['teams'][number] => ({
  id,
  name: `Team ${id}`,
  region: Region.LCK,
  wins: 0,
  losses: 0,
  status: TeamStatus.ACTIVE,
});

const buildState = (overrides: Partial<TournamentState>): TournamentState => ({
  version: 'test',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  teams: [],
  matches: [],
  rounds: [],
  swissStage: createSwissStage(),
  knockoutStage: createKnockoutStage(),
  drawAlgorithm: DrawAlgorithm.RANDOM,
  matchHistory: [],
  seedingConfig: undefined,
  baselineRounds: [],
  lockedMatches: {},
  roundMetadata: {},
  knockoutBracket: null,
  ...overrides,
});

describe('PartialResetTournament', () => {
  const useCase = new PartialResetTournament();

  it('keeps manual rounds, clears later rounds, and rewinds records', () => {
    const teams = ['A', 'B', 'C', 'D'].map(createTeam);

    const matchR1 = { ...createMatch('A', 'B', StageType.SWISS, 1, '0-0'), winnerId: 'A' };
    const matchR2 = { ...createMatch('C', 'D', StageType.SWISS, 2, '1-0'), winnerId: 'C' };
    const matchR3 = { ...createMatch('A', 'C', StageType.SWISS, 3, '2-0'), winnerId: 'C' };

    const round1 = createRound(1, [matchR1.id], ['0-0']);
    const round2 = createRound(2, [matchR2.id], ['1-0']);
    const round3 = createRound(3, [matchR3.id], ['2-0']);

    const state = buildState({
      teams,
      matches: [matchR1, matchR2, matchR3],
      rounds: [round1, round2, round3],
      swissStage: {
        type: StageType.SWISS,
        status: StageStatus.IN_PROGRESS,
        roundIds: [round1.id, round2.id, round3.id],
        currentRoundNumber: 3,
      },
      roundMetadata: {
        [round1.id]: { source: 'simulated', lockedMatchIds: [] },
        [round2.id]: { source: 'manual', lockedMatchIds: [] },
        [round3.id]: { source: 'simulated', lockedMatchIds: [] },
      },
      matchHistory: [
        { team1Id: 'A', team2Id: 'B' },
        { team1Id: 'C', team2Id: 'D' },
        { team1Id: 'A', team2Id: 'C' },
      ],
    });

    const result = useCase.execute(state);

    expect(result.matches).toHaveLength(2);
    expect(result.matches.find(match => match.roundNumber === 2)?.winnerId).toBeNull();
    expect(result.rounds).toHaveLength(2);
    expect(result.swissStage.roundIds).toHaveLength(2);
    expect(result.swissStage.currentRoundNumber).toBe(2);
    expect(result.swissStage.status).toBe(StageStatus.IN_PROGRESS);
    expect(result.matchHistory).toHaveLength(1);
    const teamA = result.teams.find(team => team.id === 'A');
    const teamB = result.teams.find(team => team.id === 'B');
    expect(teamA?.wins).toBe(1);
    expect(teamB?.losses).toBe(1);
  });

  it('throws when no manual or baseline rounds exist', () => {
    const round = createRound(1, [], ['0-0']);
    const state = buildState({
      teams: ['A', 'B'].map(createTeam),
      rounds: [round],
      swissStage: {
        type: StageType.SWISS,
        status: StageStatus.IN_PROGRESS,
        roundIds: [round.id],
        currentRoundNumber: 1,
      },
      roundMetadata: {
        [round.id]: { source: 'simulated', lockedMatchIds: [] },
      },
    });

    expect(() => useCase.execute(state)).toThrow('Partial reset is unavailable without any manual or baseline rounds');
  });

  it('honors baseline-json rounds as anchor', () => {
    const teams = ['A', 'B'].map(createTeam);
    const match = { ...createMatch('A', 'B', StageType.SWISS, 1, '0-0'), winnerId: 'A' };
    const round = createRound(1, [match.id], ['0-0']);

    const state = buildState({
      teams,
      matches: [match],
      rounds: [round],
      swissStage: {
        type: StageType.SWISS,
        status: StageStatus.IN_PROGRESS,
        roundIds: [round.id],
        currentRoundNumber: 1,
      },
      roundMetadata: {
        [round.id]: { source: 'baseline-json', lockedMatchIds: [] },
      },
      matchHistory: [{ team1Id: 'A', team2Id: 'B' }],
    });

    const result = useCase.execute(state);

    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].winnerId).toBeNull();
    expect(result.swissStage.currentRoundNumber).toBe(1);
    expect(result.matchHistory).toHaveLength(0);
  });
});
