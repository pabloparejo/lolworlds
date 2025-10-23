import type { TournamentState } from 'domain/entities/types';
import { TOURNAMENT_STATE_VERSION } from 'domain/entities/types';
import type { ITournamentRepository } from 'domain/services/interfaces';

const STORAGE_KEY = 'worlds-simulator-tournament-state';

export class LocalStorageAdapter implements ITournamentRepository {
  /**
   * Save tournament state to localStorage
   * @param state - The tournament state to persist
   */
  save(state: TournamentState): void {
    try {
      const stateWithMetadata: TournamentState = {
        ...state,
        version: TOURNAMENT_STATE_VERSION,
        updatedAt: new Date().toISOString(),
      };

      const serialized = JSON.stringify(stateWithMetadata);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to save tournament state:', error.message);
        throw new Error(`LocalStorageAdapter.save failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load tournament state from localStorage
   * @returns The persisted tournament state or null if not found/invalid
   */
  load(): TournamentState | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);

      if (!serialized) {
        return null;
      }

      const state = JSON.parse(serialized) as TournamentState;

      // Validate version compatibility
      if (state.version !== TOURNAMENT_STATE_VERSION) {
        console.warn(
          `Version mismatch: stored version ${state.version}, expected ${TOURNAMENT_STATE_VERSION}. Clearing stale data.`
        );
        this.clear();
        return null;
      }

      // Basic validation
      if (!state.teams || !state.matches || !state.rounds) {
        console.warn('Invalid tournament state structure. Clearing corrupted data.');
        this.clear();
        return null;
      }

      return state;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to load tournament state:', error.message);
      }
      // Clear corrupted data
      this.clear();
      return null;
    }
  }

  /**
   * Clear persisted tournament state
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to clear tournament state:', error.message);
      }
    }
  }

  /**
   * Check if persisted tournament state exists
   * @returns true if state exists in localStorage
   */
  exists(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the storage key (useful for debugging)
   */
  getStorageKey(): string {
    return STORAGE_KEY;
  }
}
