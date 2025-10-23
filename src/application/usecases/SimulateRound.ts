import type { TournamentState, StageType, Team, Match } from ../../domain/entities/types';
import { DrawAlgorithm } from ../../domain/entities/types';
import { updateTournamentState, getTeamById, updateTeams, addMatches, addRound } from '../../domain/entities/TournamentState';
import { updateTeamRecord, getActiveTeams, getQualifiedTeams } from '../../domain/entities/Team';
import { resolveMatch, isMatchResolved } from '../../domain/entities/Match';
import { createRound } from '../../domain/entities/Round';
import { startStage, addRoundToStage, completeStage } from '../../domain/entities/Stage';
import { addMatchToHistory } from '../../domain/rules/pairing-constraints';
import { RandomDrawStrategy } from '../../domain/services/RandomDrawStrategy';
import { BiasedDrawStrategy } from '../../domain/services/BiasedDrawStrategy';
import { SwissMatchmaker } from '../../domain/services/SwissMatchmaker';
import { KnockoutSeeder } from '../../domain/services/KnockoutSeeder';
import { IDrawStrategy } from '../../domain/services/interfaces';

/**
 * Simulate round use case
 * Generates pairings and simulates matches for the current round
 */
export class SimulateRound {
  private randomStrategy: RandomDrawStrategy;
  private biasedStrategy: BiasedDrawStrategy;
  private swissMatchmaker: SwissMatchmaker;
  private knockoutSeeder: KnockoutSeeder;

  constructor() {
    this.randomStrategy = new RandomDrawStrategy();
    this.biasedStrategy = new BiasedDrawStrategy();
    this.swissMatchmaker = new SwissMatchmaker();
    this.knockoutSeeder = new KnockoutSeeder();
  }

  /**
   * Simulate the next round of the tournament
   */
  execute(state: TournamentState): TournamentState {
    const { swissStage, knockoutStage } = state;

    // Determine which stage we're in
    if (swissStage.status !== 'COMPLETE') {
      return this.simulateSwissRound(state);
    } else if (knockoutStage.status !== 'COMPLETE') {
      return this.simulateKnockoutRound(state);
    }

    // Tournament is complete
    console.log('Tournament is already complete');
    return state;
  }

  /**
   * Simulate a Swiss stage round
   */
  private simulateSwissRound(state: TournamentState): TournamentState {
    let updatedState = { ...state };

    // Start stage if not started
    if (updatedState.swissStage.status === 'NOT_STARTED') {
      updatedState = updateTournamentState(updatedState, {
        swissStage: startStage(updatedState.swissStage),
      });
    }

    const activeTeams = getActiveTeams(updatedState.teams);

    if (activeTeams.length === 0) {
      // Swiss stage complete
      updatedState = updateTournamentState(updatedState, {
        swissStage: completeStage(updatedState.swissStage),
      });
      return updatedState;
    }

    // Create matches for this round
    const roundNumber = updatedState.swissStage.currentRoundNumber + 1;
    const matches = this.swissMatchmaker.createMatches(
      activeTeams,
      roundNumber,
      updatedState.matchHistory
    );

    if (!matches) {
      throw new Error('Failed to create Swiss pairings');
    }

    // Simulate all matches
    const strategy = this.getDrawStrategy(updatedState.drawAlgorithm);
    const updatedTeams: Team[] = [];
    const resolvedMatches: Match[] = [];
    let matchHistory = [...updatedState.matchHistory];

    matches.forEach(match => {
      const team1 = getTeamById(updatedState, match.team1Id);
      const team2 = getTeamById(updatedState, match.team2Id);

      if (!team1 || !team2) {
        throw new Error('Team not found');
      }

      // Simulate match
      const result = strategy.simulateMatch(match, team1, team2);

      // Resolve match
      const resolvedMatch = resolveMatch(match, result.winnerId);
      resolvedMatches.push(resolvedMatch);

      // Update team records
      const updatedTeam1 = updateTeamRecord(team1, result.winnerId === team1.id);
      const updatedTeam2 = updateTeamRecord(team2, result.winnerId === team2.id);

      updatedTeams.push(updatedTeam1, updatedTeam2);

      // Add to match history
      matchHistory = addMatchToHistory(matchHistory, match.team1Id, match.team2Id);
    });

    // Create round
    const round = createRound(
      roundNumber,
      resolvedMatches.map(m => m.id),
      matches.map(m => m.recordBracket || '')
    );

    // Update state
    updatedState = updateTeams(updatedState, updatedTeams);
    updatedState = addMatches(updatedState, resolvedMatches);
    updatedState = addRound(updatedState, round);
    updatedState = updateTournamentState(updatedState, {
      swissStage: addRoundToStage(updatedState.swissStage, round.id),
      matchHistory,
    });

    // Check if Swiss stage is complete (all teams qualified or eliminated)
    const stillActive = getActiveTeams(updatedState.teams);
    if (stillActive.length === 0) {
      updatedState = updateTournamentState(updatedState, {
        swissStage: completeStage(updatedState.swissStage),
      });
    }

    return updatedState;
  }

  /**
   * Simulate a Knockout stage round
   */
  private simulateKnockoutRound(state: TournamentState): TournamentState {
    let updatedState = { ...state };

    // Start knockout stage if not started
    if (updatedState.knockoutStage.status === 'NOT_STARTED') {
      // Seed knockout bracket with qualified teams
      const qualifiedTeams = getQualifiedTeams(updatedState.teams);

      if (qualifiedTeams.length !== 8) {
        throw new Error(`Expected 8 qualified teams, got ${qualifiedTeams.length}`);
      }

      const quarterfinalsMatches = this.knockoutSeeder.seedBracket(qualifiedTeams);

      updatedState = addMatches(updatedState, quarterfinalsMatches);
      updatedState = updateTournamentState(updatedState, {
        knockoutStage: startStage(updatedState.knockoutStage),
      });

      const round = createRound(1, quarterfinalsMatches.map(m => m.id));
      updatedState = addRound(updatedState, round);
      updatedState = updateTournamentState(updatedState, {
        knockoutStage: addRoundToStage(updatedState.knockoutStage, round.id),
      });
    }

    // Get current round matches
    const currentRoundNumber = updatedState.knockoutStage.currentRoundNumber;
    const currentRoundMatches = updatedState.matches.filter(
      m => m.stage === StageType.KNOCKOUT && m.roundNumber === currentRoundNumber && !isMatchResolved(m)
    );

    if (currentRoundMatches.length === 0) {
      // Current round is complete, move to next round or complete tournament
      const nextRoundNumber = currentRoundNumber + 1;

      if (nextRoundNumber > 3) {
        // Tournament complete (after finals)
        updatedState = updateTournamentState(updatedState, {
          knockoutStage: completeStage(updatedState.knockoutStage),
        });
        return updatedState;
      }

      // Create next round
      const previousRoundMatches = updatedState.matches.filter(
        m => m.stage === StageType.KNOCKOUT && m.roundNumber === currentRoundNumber
      );

      const winners = previousRoundMatches
        .filter(isMatchResolved)
        .map(m => m.winnerId!)
        .filter(Boolean);

      let nextMatches: Match[];
      if (nextRoundNumber === 2) {
        // Semifinals
        nextMatches = this.knockoutSeeder.createSemifinals(winners);
      } else {
        // Finals
        nextMatches = [this.knockoutSeeder.createFinals(winners)];
      }

      updatedState = addMatches(updatedState, nextMatches);
      const round = createRound(nextRoundNumber, nextMatches.map(m => m.id));
      updatedState = addRound(updatedState, round);
      updatedState = updateTournamentState(updatedState, {
        knockoutStage: addRoundToStage(updatedState.knockoutStage, round.id),
      });

      return updatedState;
    }

    // Simulate current round matches
    const strategy = this.getDrawStrategy(updatedState.drawAlgorithm);
    const resolvedMatches: Match[] = [];

    currentRoundMatches.forEach(match => {
      const team1 = getTeamById(updatedState, match.team1Id);
      const team2 = getTeamById(updatedState, match.team2Id);

      if (!team1 || !team2) {
        throw new Error('Team not found');
      }

      const result = strategy.simulateMatch(match, team1, team2);
      const resolvedMatch = resolveMatch(match, result.winnerId);
      resolvedMatches.push(resolvedMatch);
    });

    // Update matches in state
    updatedState = updateTournamentState(updatedState, {
      matches: updatedState.matches.map(m => {
        const resolved = resolvedMatches.find(rm => rm.id === m.id);
        return resolved || m;
      }),
    });

    return updatedState;
  }

  /**
   * Get the appropriate draw strategy
   */
  private getDrawStrategy(algorithm: DrawAlgorithm): IDrawStrategy {
    return algorithm === DrawAlgorithm.RANDOM ? this.randomStrategy : this.biasedStrategy;
  }
}
