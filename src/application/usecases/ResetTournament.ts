import type { TournamentState } from 'domain/entities/types';
import { DrawAlgorithm } from 'domain/entities/types';
import { LocalStorageAdapter } from 'infrastructure/persistence/LocalStorageAdapter';
import { LoadTournament } from './LoadTournament';
import { PrepareSwissRound } from './PrepareSwissRound';

/**
 * Reset tournament use case
 * Clears all state and reloads teams for a fresh tournament
 */
export class ResetTournament {
  private repository: LocalStorageAdapter;
  private loadTournament: LoadTournament;
  private prepareSwissRound: PrepareSwissRound;

  constructor() {
    this.repository = new LocalStorageAdapter();
    this.loadTournament = new LoadTournament();
    this.prepareSwissRound = new PrepareSwissRound();
  }

  /**
   * Reset the tournament to initial state
   * @param teamsJsonPath - Path to teams JSON file
   * @param drawAlgorithm - Draw algorithm to use
   * @returns Fresh tournament state
   */
  async execute(
    teamsJsonPath: string = '/teams.json',
    drawAlgorithm: DrawAlgorithm = DrawAlgorithm.RANDOM
  ): Promise<TournamentState> {
    // Clear persisted state
    this.repository.clear();

    // Load fresh tournament
    const freshState = await this.loadTournament.execute(teamsJsonPath, drawAlgorithm);

    return this.prepareSwissRound.execute(freshState);
  }
}
