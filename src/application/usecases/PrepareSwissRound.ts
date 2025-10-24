import type { TournamentState } from 'domain/entities/types';
import { StageStatus, StageType } from 'domain/entities/types';
import {
  addMatches,
  addRound,
  updateTournamentState,
} from 'domain/entities/TournamentState';
import { startStage, addRoundToStage } from 'domain/entities/Stage';
import { getActiveTeams } from 'domain/entities/Team';
import { SwissDrawService } from 'domain/services/swiss/SwissDrawService';

/**
 * Ensure the next Swiss round is prepared with pairings persisted in state.
 * Generates the Swiss draw (respecting seeding tiers and baseline configuration)
 * when no pending round exists.
 */
export class PrepareSwissRound {
  private readonly swissDrawService = new SwissDrawService();

  execute(state: TournamentState): TournamentState {
    if (state.swissStage.status === StageStatus.COMPLETED) {
      return state;
    }

    const seedingConfig = state.seedingConfig;
    if (!seedingConfig) {
      throw new Error('Seeding configuration missing; cannot prepare Swiss round');
    }

    const currentRoundNumber = state.swissStage.currentRoundNumber ?? 0;

    // Determine if a pending round already exists (matches without winners for the latest round)
    if (currentRoundNumber > 0) {
      const pendingMatches = state.matches.filter(
        match =>
          match.stage === StageType.SWISS &&
          match.roundNumber === currentRoundNumber &&
          match.winnerId === null
      );

      if (pendingMatches.length > 0) {
        // Existing round awaiting simulation; nothing to do.
        return state;
      }
    }

    const activeTeams = getActiveTeams(state.teams);
    if (activeTeams.length === 0) {
      return state;
    }

    const nextRoundNumber = currentRoundNumber + 1;

    if (nextRoundNumber > 5) {
      return state;
    }

    const { matches, round } = this.swissDrawService.generateRound({
      roundNumber: nextRoundNumber,
      teams: activeTeams,
      matchHistory: state.matchHistory,
      seedingConfig,
      baselineRounds: state.baselineRounds ?? [],
    });

    // Persist matches (unresolved) and round metadata
    let updatedState = addMatches(state, matches);
    updatedState = addRound(updatedState, round);

    const roundMetadata = {
      ...(updatedState.roundMetadata ?? {}),
      [round.id]: { source: round.source, lockedMatchIds: [] },
    };

    const startedStage =
      updatedState.swissStage.status === StageStatus.NOT_STARTED
        ? startStage(updatedState.swissStage)
        : updatedState.swissStage;

    const swissStageWithRound = addRoundToStage(startedStage, round.id);

    updatedState = updateTournamentState(updatedState, {
      swissStage: swissStageWithRound,
      roundMetadata,
    });

    return updatedState;
  }
}
