import { useState, useEffect, useCallback } from 'react';
import type { TournamentState } from 'domain/entities/types';
import { DrawAlgorithm } from 'domain/entities/types';
import { LoadTournament } from 'application/usecases/LoadTournament';
import { SimulateRound } from 'application/usecases/SimulateRound';
import { ResetTournament } from 'application/usecases/ResetTournament';
import { LocalStorageAdapter } from 'infrastructure/persistence/LocalStorageAdapter';
import { PrepareSwissRound } from 'application/usecases/PrepareSwissRound';
import { CreateManualRound } from 'application/usecases/CreateManualRound';
import { PartialResetTournament } from 'application/usecases/PartialResetTournament';
import { LockMatchResult } from 'application/usecases/LockMatchResult';

const loadTournamentUseCase = new LoadTournament();
const simulateRoundUseCase = new SimulateRound();
const resetTournamentUseCase = new ResetTournament();
const repository = new LocalStorageAdapter();
const prepareSwissRoundUseCase = new PrepareSwissRound();
const lockMatchResultUseCase = new LockMatchResult();
const createManualRoundUseCase = new CreateManualRound();
const partialResetTournamentUseCase = new PartialResetTournament();

export interface UseTournamentReturn {
  state: TournamentState | null;
  isLoading: boolean;
  error: string | null;
  loadTournament: (teamsPath?: string, algorithm?: DrawAlgorithm) => Promise<void>;
  simulateRound: () => void;
  lockMatchResult: (matchId: string, winnerId: string | null) => void;
  createManualRound: (matchups: Array<{ teamAId: string; teamBId: string }>) => void;
  resetTournament: (teamsPath?: string, algorithm?: DrawAlgorithm) => Promise<void>;
  partialResetTournament: () => void;
  setDrawAlgorithm: (algorithm: DrawAlgorithm) => void;
  saveTournament: () => void;
}

/**
 * Custom hook for tournament management
 * Provides access to all tournament operations
 */
export function useTournament(): UseTournamentReturn {
  const [state, setState] = useState<TournamentState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load tournament from storage or create new one
  useEffect(() => {
    const initializeTournament = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load from storage
        const savedState = repository.load();

        if (savedState) {
          const preparedState = prepareSwissRoundUseCase.execute(savedState);
          setState(preparedState);
          repository.save(preparedState);
        } else {
          // Load fresh tournament
          const freshState = await loadTournamentUseCase.execute();
          const preparedState = prepareSwissRoundUseCase.execute(freshState);
          setState(preparedState);
          repository.save(preparedState);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize tournament';
        setError(message);
        console.error('Tournament initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTournament();
  }, []);

  /**
   * Load a new tournament
   */
  const loadTournament = useCallback(async (
    teamsPath: string = '/teams.json',
    algorithm: DrawAlgorithm = DrawAlgorithm.RANDOM
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const newState = await loadTournamentUseCase.execute(teamsPath, algorithm);
      const preparedState = prepareSwissRoundUseCase.execute(newState);
      setState(preparedState);
      repository.save(preparedState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tournament';
      setError(message);
      console.error('Load tournament error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Simulate the next round
   */
  const simulateRound = useCallback(() => {
    if (!state) {
      setError('No tournament loaded');
      return;
    }

    try {
      setError(null);
      const newState = simulateRoundUseCase.execute(state);
      setState(newState);
      repository.save(newState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to simulate round';
      setError(message);
      console.error('Simulate round error:', err);
    }
  }, [state]);

  const lockMatchResult = useCallback((matchId: string, winnerId: string | null) => {
    if (!state) {
      setError('No tournament loaded');
      return;
    }

    try {
      setError(null);
      const updatedState = lockMatchResultUseCase.execute({ matchId, winnerId, state });
      setState(updatedState);
      repository.save(updatedState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update match lock';
      setError(message);
      console.error('Lock match result error:', err);
    }
  }, [state]);

  const createManualRound = useCallback((matchups: Array<{ teamAId: string; teamBId: string }>) => {
    if (!state) {
      setError('No tournament loaded');
      return;
    }

    try {
      setError(null);
      const updatedState = createManualRoundUseCase.execute({ state, matchups });
      setState(updatedState);
      repository.save(updatedState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create manual round';
      setError(message);
      console.error('Create manual round error:', err);
      throw err;
    }
  }, [state]);

  /**
   * Reset the tournament
   */
  const resetTournament = useCallback(async (
    teamsPath: string = '/teams.json',
    algorithm: DrawAlgorithm = DrawAlgorithm.RANDOM
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const freshState = await resetTournamentUseCase.execute(teamsPath, algorithm);
      const preparedState = prepareSwissRoundUseCase.execute(freshState);
      setState(preparedState);
      repository.save(preparedState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset tournament';
      setError(message);
      console.error('Reset tournament error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const partialResetTournament = useCallback(() => {
    if (!state) {
      setError('No tournament loaded');
      return;
    }

    try {
      setError(null);
      const updatedState = partialResetTournamentUseCase.execute(state);
      setState(updatedState);
      repository.save(updatedState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to perform partial reset';
      setError(message);
      console.error('Partial reset error:', err);
    }
  }, [state]);

  /**
   * Update the draw algorithm
   */
  const setDrawAlgorithm = useCallback((algorithm: DrawAlgorithm) => {
    if (!state) {
      setError('No tournament loaded');
      return;
    }

    try {
      setError(null);
      const newState = {
        ...state,
        drawAlgorithm: algorithm,
        updatedAt: new Date().toISOString(),
      };
      setState(newState);
      repository.save(newState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update draw algorithm';
      setError(message);
      console.error('Set draw algorithm error:', err);
    }
  }, [state]);

  /**
   * Manually save tournament state
   */
  const saveTournament = useCallback(() => {
    if (!state) {
      setError('No tournament to save');
      return;
    }

    try {
      repository.save(state);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save tournament';
      setError(message);
      console.error('Save tournament error:', err);
    }
  }, [state]);

  return {
    state,
    isLoading,
    error,
    loadTournament,
    simulateRound,
    lockMatchResult,
    createManualRound,
    resetTournament,
    partialResetTournament,
    setDrawAlgorithm,
    saveTournament,
  };
}
