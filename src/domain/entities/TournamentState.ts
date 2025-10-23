import type { TournamentState, Team } from './types';
import { DrawAlgorithm, TOURNAMENT_STATE_VERSION } from './types';
import { createSwissStage, createKnockoutStage } from './Stage';

/**
 * Create initial tournament state from teams
 */
export function createInitialState(teams: Team[], drawAlgorithm: DrawAlgorithm = DrawAlgorithm.RANDOM): TournamentState {
  const now = new Date().toISOString();

  return {
    version: TOURNAMENT_STATE_VERSION,
    createdAt: now,
    updatedAt: now,
    teams,
    matches: [],
    rounds: [],
    swissStage: createSwissStage(),
    knockoutStage: createKnockoutStage(),
    drawAlgorithm,
    matchHistory: [],
  };
}

/**
 * Update tournament state with new values
 */
export function updateTournamentState(
  state: TournamentState,
  updates: Partial<Omit<TournamentState, 'version' | 'createdAt'>>
): TournamentState {
  return {
    ...state,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get team by ID
 */
export function getTeamById(state: TournamentState, teamId: string): Team | undefined {
  return state.teams.find(team => team.id === teamId);
}

/**
 * Update a team in the tournament state
 */
export function updateTeam(state: TournamentState, teamId: string, updates: Partial<Team>): TournamentState {
  return updateTournamentState(state, {
    teams: state.teams.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    ),
  });
}

/**
 * Update multiple teams in the tournament state
 */
export function updateTeams(state: TournamentState, teams: Team[]): TournamentState {
  const teamMap = new Map(teams.map(team => [team.id, team]));

  return updateTournamentState(state, {
    teams: state.teams.map(team => teamMap.get(team.id) || team),
  });
}

/**
 * Add matches to tournament state
 */
export function addMatches(state: TournamentState, newMatches: import('./types').Match[]): TournamentState {
  return updateTournamentState(state, {
    matches: [...state.matches, ...newMatches],
  });
}

/**
 * Add a round to tournament state
 */
export function addRound(state: TournamentState, round: import('./types').Round): TournamentState {
  return updateTournamentState(state, {
    rounds: [...state.rounds, round],
  });
}

/**
 * Update the draw algorithm
 */
export function updateDrawAlgorithm(state: TournamentState, algorithm: DrawAlgorithm): TournamentState {
  return updateTournamentState(state, {
    drawAlgorithm: algorithm,
  });
}
