import { useState, useEffect, useCallback } from 'react';
import { TournamentState, DrawAlgorithm } from '../../domain/entities/types';
import { LoadTournament } from '../usecases/LoadTournament';
import { SimulateRound } from '../usecases/SimulateRound';
import { ResetTournament } from '../usecases/ResetTournament';
import { LocalStorageAdapter } from '../../infrastructure/persistence/LocalStorageAdapter';

const loadTournamentUseCase = new LoadTournament();
const simulateRoundUseCase = new SimulateRound();
const resetTournamentUseCase = new ResetTournament();
const repository = new LocalStorageAdapter();

export interface UseTournamentReturn {
  state: TournamentState | null;
  isLoading: boolean;
  error: string | null;
  loadTournament: (teamsPath?: string, algorithm?: DrawAlgorithm) => Promise<void>;
  simulateRound: () => void;
  resetTournament: (teamsPath?: string, algorithm?: DrawAlgorithm) => Promise<void>;
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
          setState(savedState);
        } else {
          // Load fresh tournament
          const freshState = await loadTournamentUseCase.execute();
          setState(freshState);
          repository.save(freshState);
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
      setState(newState);
      repository.save(newState);
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
      setState(freshState);
      repository.save(freshState);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset tournament';
      setError(message);
      console.error('Reset tournament error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    resetTournament,
    setDrawAlgorithm,
    saveTournament,
  };
}
