import type { TournamentState } from 'domain/entities/types';
import { DrawAlgorithm } from 'domain/entities/types';
import { createInitialState } from 'domain/entities/TournamentState';
import { TeamDataLoader } from 'infrastructure/loaders/TeamDataLoader';
import { PrepareSwissRound } from './PrepareSwissRound';

/**
 * Load tournament use case
 * Initializes a new tournament from team data
 */
export class LoadTournament {
  /**
   * Load teams and create initial tournament state
   * @param teamsJsonPath - Path to teams JSON file
   * @param drawAlgorithm - Random or Biased draw algorithm
   * @returns Initial tournament state
   */
  async execute(
    teamsJsonPath: string = '/teams.json',
    drawAlgorithm: DrawAlgorithm = DrawAlgorithm.RANDOM
  ): Promise<TournamentState> {
    // Load and validate teams from JSON
    const teams = await TeamDataLoader.loadTeams(teamsJsonPath);

    // Create initial tournament state
    const initialState = createInitialState(teams, drawAlgorithm);
    const config = TeamDataLoader.getLastLoadedConfig();

    if (config) {
      initialState.seedingConfig = config;
      initialState.baselineRounds = config.baselineRounds;
    }

    const prepareSwissRound = new PrepareSwissRound();
    const preparedState = prepareSwissRound.execute(initialState);

    return preparedState;
  }
}
