/**
 * Service Interfaces
 * League of Legends Worlds Tournament Simulator
 *
 * This file contains interfaces (ports) for dependency inversion.
 * Domain and application layers depend on these interfaces,
 * infrastructure layer provides concrete implementations (adapters).
 */

import type {
  Team,
  Match,
  Round,
  TournamentState,
  DrawAlgorithm,
  TeamData,
  SimulationResult,
  ValidationResult,
  RoundSimulationResult,
} from './types';

// ============================================================================
// Domain Service Interfaces
// ============================================================================

/**
 * Strategy interface for draw algorithms
 * Implements Strategy pattern for match simulation
 */
export interface IDrawStrategy {
  /**
   * Calculate win probability for team1 against team2
   * @param team1 - First team
   * @param team2 - Second team
   * @returns Probability that team1 wins (0-1)
   */
  calculateWinProbability(team1: Team, team2: Team): number;

  /**
   * Simulate a match and determine winner
   * @param match - Match to simulate
   * @param team1 - First team object
   * @param team2 - Second team object
   * @returns Simulation result with winner and probability
   */
  simulateMatch(match: Match, team1: Team, team2: Team): SimulationResult;
}

/**
 * Swiss stage matchmaking service
 * Handles team pairing with no-repeat constraint
 */
export interface ISwissMatchmaker {
  /**
   * Create matches for a Swiss round
   * @param teams - Teams to pair (must have same record)
   * @param roundNumber - Current round number
   * @param matchHistory - Past matchups to avoid repeats
   * @returns Array of matches, or null if pairing impossible
   */
  createMatches(
    teams: Team[],
    roundNumber: number,
    matchHistory: ReadonlyArray<{ team1Id: string; team2Id: string }>
  ): Match[] | null;

  /**
   * Validate if two teams can be paired
   * @param team1 - First team
   * @param team2 - Second team
   * @param matchHistory - Past matchups
   * @returns true if teams haven't faced each other
   */
  canPairTeams(
    team1: Team,
    team2: Team,
    matchHistory: ReadonlyArray<{ team1Id: string; team2Id: string }>
  ): boolean;
}

/**
 * Knockout stage seeding service
 * Handles bracket creation and seeding by record
 */
export interface IKnockoutSeeder {
  /**
   * Seed qualified teams into knockout bracket
   * Seeding rule: 3-0 vs 3-2, 3-1 vs 3-1 and remaining 3-2
   * @param qualifiedTeams - 8 teams that qualified from Swiss (must be exactly 8)
   * @returns Array of quarterfinal matches
   */
  seedBracket(qualifiedTeams: Team[]): Match[];

  /**
   * Determine seeding order within same record group
   * @param teams - Teams with same record
   * @returns Sorted teams (tiebreaker applied)
   */
  applyTiebreaker(teams: Team[]): Team[];
}

/**
 * Validator service for domain entities
 */
export interface IValidator {
  /**
   * Validate a team entity
   */
  validateTeam(team: Team): ValidationResult;

  /**
   * Validate a match entity
   */
  validateMatch(match: Match, teams: Team[]): ValidationResult;

  /**
   * Validate a round entity
   */
  validateRound(round: Round, matches: Match[]): ValidationResult;

  /**
   * Validate complete tournament state
   */
  validateTournamentState(state: TournamentState): ValidationResult;
}

// ============================================================================
// Application Service Interfaces (Use Cases)
// ============================================================================

/**
 * Tournament simulation use case
 */
export interface ISimulateRound {
  /**
   * Simulate all unresolved matches in a round
   * @param roundId - Round to simulate
   * @param state - Current tournament state
   * @param drawAlgorithm - Simulation algorithm to use
   * @returns Updated tournament state with match results
   */
  execute(
    roundId: string,
    state: TournamentState,
    drawAlgorithm: DrawAlgorithm
  ): TournamentState;
}

/**
 * Manual winner selection use case
 */
export interface ISelectWinner {
  /**
   * Manually set winner for a match
   * @param matchId - Match to resolve
   * @param winnerId - Team ID of winner (must be team1Id or team2Id)
   * @param state - Current tournament state
   * @returns Updated tournament state
   */
  execute(matchId: string, winnerId: string, state: TournamentState): TournamentState;
}

/**
 * Team swap use case (drag & drop)
 */
export interface ISwapTeams {
  /**
   * Swap two teams between matches
   * @param match1Id - First match
   * @param team1IdToSwap - Team ID from first match
   * @param match2Id - Second match
   * @param team2IdToSwap - Team ID from second match
   * @param state - Current tournament state
   * @returns Updated tournament state, or error if swap invalid
   */
  execute(
    match1Id: string,
    team1IdToSwap: string,
    match2Id: string,
    team2IdToSwap: string,
    state: TournamentState
  ): TournamentState | { error: string };
}

/**
 * Match lock/unlock use case
 */
export interface ILockMatch {
  /**
   * Toggle match locked status
   * @param matchId - Match to lock/unlock
   * @param state - Current tournament state
   * @returns Updated tournament state
   */
  execute(matchId: string, state: TournamentState): TournamentState;
}

/**
 * Phase re-draw use case
 */
export interface IRedrawPhase {
  /**
   * Re-generate unlocked matches in current round
   * @param roundId - Round to re-draw
   * @param state - Current tournament state
   * @returns Updated tournament state with new pairings
   */
  execute(roundId: string, state: TournamentState): TournamentState;
}

/**
 * Tournament initialization use case
 */
export interface ILoadTournament {
  /**
   * Load tournament from teams data
   * @param teams - Team data from JSON file
   * @param drawAlgorithm - Initial draw algorithm selection
   * @returns Initial tournament state
   */
  execute(teams: TeamData[], drawAlgorithm: DrawAlgorithm): TournamentState;
}

/**
 * Tournament reset use case
 */
export interface IResetTournament {
  /**
   * Reset tournament to initial state
   * @param teams - Team data to reload
   * @param drawAlgorithm - Draw algorithm selection
   * @returns Fresh tournament state
   */
  execute(teams: TeamData[], drawAlgorithm: DrawAlgorithm): TournamentState;
}

// ============================================================================
// Infrastructure Service Interfaces (Ports)
// ============================================================================

/**
 * Persistence port for tournament state
 * Implemented by LocalStorageAdapter in infrastructure layer
 */
export interface ITournamentRepository {
  /**
   * Save tournament state
   * @param state - Tournament state to persist
   */
  save(state: TournamentState): void;

  /**
   * Load tournament state
   * @returns Persisted state, or null if not found
   */
  load(): TournamentState | null;

  /**
   * Clear persisted state
   */
  clear(): void;

  /**
   * Check if persisted state exists
   */
  exists(): boolean;
}

/**
 * Team data loader port
 * Implemented by TeamDataLoader in infrastructure layer
 */
export interface ITeamDataLoader {
  /**
   * Load team data from JSON file
   * @param filePath - Path to teams.json file
   * @returns Array of team data, or error
   */
  loadTeams(filePath: string): Promise<TeamData[] | { error: string }>;

  /**
   * Validate loaded team data
   * @param teams - Team data to validate
   * @returns Validation result
   */
  validateTeamData(teams: TeamData[]): ValidationResult;
}

/**
 * Theme management port
 * Implemented by ThemeManager in infrastructure layer
 */
export interface IThemeManager {
  /**
   * Get current theme
   * @returns 'light', 'dark', or 'auto'
   */
  getTheme(): 'light' | 'dark' | 'auto';

  /**
   * Set theme
   * @param theme - Theme to apply
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void;

  /**
   * Get effective theme (resolves 'auto' to 'light' or 'dark')
   */
  getEffectiveTheme(): 'light' | 'dark';

  /**
   * Listen for system theme changes
   * @param callback - Called when system theme changes
   * @returns Cleanup function to remove listener
   */
  onSystemThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
}

/**
 * Random number generator port (for testing)
 * Allows injecting deterministic RNG in tests
 */
export interface IRNG {
  /**
   * Generate random number in range [0, 1)
   */
  random(): number;

  /**
   * Shuffle array in place
   * @param array - Array to shuffle
   * @returns Shuffled array (same reference)
   */
  shuffle<T>(array: T[]): T[];
}

// ============================================================================
// React Hook Interfaces
// ============================================================================

/**
 * Tournament state hook interface
 */
export interface IUseTournament {
  /** Current tournament state */
  state: TournamentState | null;

  /** Whether state is loading */
  loading: boolean;

  /** Error if state failed to load */
  error: string | null;

  /** Simulate a round */
  simulateRound: (roundId: string) => void;

  /** Select match winner manually */
  selectWinner: (matchId: string, winnerId: string) => void;

  /** Swap teams between matches */
  swapTeams: (
    match1Id: string,
    team1Id: string,
    match2Id: string,
    team2Id: string
  ) => void;

  /** Lock/unlock a match */
  toggleLock: (matchId: string) => void;

  /** Re-draw unlocked matches in round */
  redrawPhase: (roundId: string) => void;

  /** Reset tournament to initial state */
  reset: () => void;

  /** Change draw algorithm */
  setDrawAlgorithm: (algorithm: DrawAlgorithm) => void;
}

/**
 * Drag and drop hook interface
 */
export interface IUseDragDrop {
  /** Team currently being dragged */
  draggedTeam: { teamId: string; matchId: string } | null;

  /** Handle drag start */
  onDragStart: (teamId: string, matchId: string) => void;

  /** Handle drag end */
  onDragEnd: () => void;

  /** Handle drop on target team */
  onDrop: (targetTeamId: string, targetMatchId: string) => void;

  /** Check if drop is valid */
  canDrop: (targetMatchId: string) => boolean;
}

/**
 * Theme hook interface
 */
export interface IUseTheme {
  /** Current theme setting */
  theme: 'light' | 'dark' | 'auto';

  /** Effective theme (resolves 'auto') */
  effectiveTheme: 'light' | 'dark';

  /** Set theme */
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  /** Toggle between light and dark */
  toggleTheme: () => void;
}

/**
 * localStorage persistence hook interface
 */
export interface IUseLocalStorage<T> {
  /** Stored value */
  value: T | null;

  /** Set value (persists to localStorage) */
  setValue: (value: T) => void;

  /** Remove value from localStorage */
  removeValue: () => void;

  /** Whether value exists in storage */
  exists: boolean;
}

// ============================================================================
// Factory Interfaces
// ============================================================================

/**
 * Factory for creating draw strategies
 */
export interface IDrawStrategyFactory {
  /**
   * Create draw strategy for algorithm type
   * @param algorithm - Algorithm type
   * @returns Draw strategy instance
   */
  create(algorithm: DrawAlgorithm): IDrawStrategy;
}

/**
 * Factory for creating use case instances
 */
export interface IUseCaseFactory {
  /** Create simulate round use case */
  createSimulateRound(): ISimulateRound;

  /** Create select winner use case */
  createSelectWinner(): ISelectWinner;

  /** Create swap teams use case */
  createSwapTeams(): ISwapTeams;

  /** Create lock match use case */
  createLockMatch(): ILockMatch;

  /** Create redraw phase use case */
  createRedrawPhase(): IRedrawPhase;

  /** Create load tournament use case */
  createLoadTournament(): ILoadTournament;

  /** Create reset tournament use case */
  createResetTournament(): IResetTournament;
}

// ============================================================================
// Event Interfaces (for potential future use)
// ============================================================================

/**
 * Domain event base interface
 */
export interface IDomainEvent {
  /** Event timestamp */
  timestamp: Date;

  /** Event type */
  type: string;
}

/**
 * Match completed event
 */
export interface IMatchCompletedEvent extends IDomainEvent {
  type: 'MATCH_COMPLETED';
  matchId: string;
  winnerId: string;
  loserId: string;
}

/**
 * Team qualified event
 */
export interface ITeamQualifiedEvent extends IDomainEvent {
  type: 'TEAM_QUALIFIED';
  teamId: string;
  finalRecord: string;
}

/**
 * Team eliminated event
 */
export interface ITeamEliminatedEvent extends IDomainEvent {
  type: 'TEAM_ELIMINATED';
  teamId: string;
  finalRecord: string;
}

/**
 * Stage completed event
 */
export interface IStageCompletedEvent extends IDomainEvent {
  type: 'STAGE_COMPLETED';
  stage: 'SWISS' | 'KNOCKOUT';
}

/**
 * Event dispatcher interface (for future event-driven architecture)
 */
export interface IEventDispatcher {
  /**
   * Dispatch domain event
   */
  dispatch(event: IDomainEvent): void;

  /**
   * Subscribe to event type
   */
  subscribe(eventType: string, handler: (event: IDomainEvent) => void): () => void;
}
