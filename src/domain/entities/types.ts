import type { BaselineRound, SeedingConfig, TierName } from './SeedingConfig';
import type { KnockoutBracket } from './KnockoutBracket';
import type { RoundSource } from './RoundDefinition';

/**
 * Core Type Definitions
 * League of Legends Worlds Tournament Simulator
 *
 * This file contains all domain entity types and enumerations.
 * Types are defined according to the data model specification.
 */

// ============================================================================
// Enumerations
// ============================================================================

/**
 * Competitive region for League of Legends teams
 * Strength values used in biased draw algorithm:
 * LCK=100%, LPL=90%, LCP=70%, LEC=60%, LCS=50%
 */
export enum Region {
  LCK = 'LCK', // Korea
  LPL = 'LPL', // China
  LCP = 'LCP', // Pacific
  LEC = 'LEC', // Europe
  LCS = 'LCS', // Americas
}

/**
 * Team status during tournament progression
 */
export enum TeamStatus {
  ACTIVE = 'ACTIVE', // Still competing in Swiss stage
  QUALIFIED = 'QUALIFIED', // Advanced to knockout (3 wins)
  ELIMINATED = 'ELIMINATED', // Eliminated from tournament (3 losses)
}

/**
 * Tournament stage type
 */
export enum StageType {
  SWISS = 'SWISS', // Swiss stage (16 teams)
  KNOCKOUT = 'KNOCKOUT', // Knockout stage (8 teams)
}

/**
 * Stage progression status
 */
export enum StageStatus {
  NOT_STARTED = 'NOT_STARTED', // Stage hasn't begun
  IN_PROGRESS = 'IN_PROGRESS', // Stage currently active
  COMPLETED = 'COMPLETED', // Stage finished
}

/**
 * Draw simulation algorithm
 */
export enum DrawAlgorithm {
  RANDOM = 'RANDOM', // 50% win probability for all teams
  BIASED = 'BIASED', // Regional strength-based probability
}

/**
 * Knockout bracket round
 */
export enum KnockoutRound {
  QUARTERFINALS = 'QUARTERFINALS', // 4 matches (8→4 teams)
  SEMIFINALS = 'SEMIFINALS', // 2 matches (4→2 teams)
  FINALS = 'FINALS', // 1 match (2→1 team)
}

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Represents a competitive team in the tournament
 */
export interface Team {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Team display name (1-50 characters) */
  name: string;

  /** Competitive region */
  region: Region;

  /** Number of wins in Swiss stage (0-3) */
  wins: number;

  /** Number of losses in Swiss stage (0-3) */
  losses: number;

  /** Current tournament status */
  status: TeamStatus;
}

/**
 * Represents a match between two teams
 */
export interface Match {
  /** Unique identifier (UUID v4) */
  id: string;

  /** First team ID (references Team.id) */
  team1Id: string;

  /** Second team ID (references Team.id, must != team1Id) */
  team2Id: string;

  /** Winner team ID (must be team1Id or team2Id if resolved, null if not) */
  winnerId: string | null;

  /** Tournament stage this match belongs to */
  stage: StageType;

  /** Round number within stage (Swiss: 1-5, Knockout: 1-3) */
  roundNumber: number;

  /** Record bracket for Swiss matches (e.g., "1-0") */
  recordBracket: string | null;

  /** Knockout round type (required if stage=KNOCKOUT) */
  knockoutRound: KnockoutRound | null;

  /** Whether match is locked for re-draw protection */
  locked: boolean;
}

/**
 * Groups matches that occur simultaneously in Swiss stage
 */
export interface Round {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Sequential round number (1-5 for Swiss) */
  roundNumber: number;

  /** Match IDs in this round (references Match.id) */
  matchIds: string[];

  /** Record brackets present in this round (e.g., ["1-0", "0-1"]) */
  recordBrackets: string[];
}

/**
 * Represents a tournament phase (Swiss or Knockout)
 */
export interface Stage {
  /** Stage type */
  type: StageType;

  /** Current stage status */
  status: StageStatus;

  /** Round IDs in this stage (references Round.id) */
  roundIds: string[];

  /** Current active round number (null if NOT_STARTED) */
  currentRoundNumber: number | null;
}

/**
 * Record of a past matchup for no-repeat constraint
 */
export interface MatchHistory {
  /** First team ID */
  team1Id: string;

  /** Second team ID */
  team2Id: string;
}

/**
 * Root aggregate containing entire tournament state
 * This is the object persisted to localStorage
 */
export interface TournamentState {
  /** State schema version (semantic versioning) */
  version: string;

  /** Tournament creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last modification timestamp (ISO 8601) */
  updatedAt: string;

  /** All 16 tournament teams */
  teams: Team[];

  /** All matches (Swiss + Knockout) */
  matches: Match[];

  /** All rounds */
  rounds: Round[];

  /** Swiss stage state */
  swissStage: Stage;

  /** Knockout stage state (null until Swiss complete) */
  knockoutStage: Stage | null;

  /** Selected simulation algorithm */
  drawAlgorithm: DrawAlgorithm;

  /** Past matchups for no-repeat rule enforcement */
  matchHistory: MatchHistory[];

  /** Persisted seeding configuration snapshot */
  seedingConfig?: SeedingConfig;

  /** Baseline rounds derived from JSON configuration */
  baselineRounds?: BaselineRound[];

  /** Map of match ID -> locked winner ID */
  lockedMatches?: Record<string, string>;

  /** Metadata per round for provenance/locking tracking */
  roundMetadata?: Record<string, { source: RoundSource; lockedMatchIds?: string[] }>;

  /** Generated knockout bracket (read-only) */
  knockoutBracket?: KnockoutBracket | null;
}

// ============================================================================
// Derived Types & Utilities
// ============================================================================

/**
 * Team with computed record property
 */
export type TeamWithRecord = Team & {
  /** Formatted record string (e.g., "2-1") */
  record: string;
};

/**
 * Match with populated team objects (instead of IDs)
 */
export interface PopulatedMatch extends Omit<Match, 'team1Id' | 'team2Id' | 'winnerId'> {
  /** First team object */
  team1: Team;

  /** Second team object */
  team2: Team;

  /** Winner team object (null if not resolved) */
  winner: Team | null;
}

/**
 * Round with populated matches
 */
export interface PopulatedRound extends Omit<Round, 'matchIds'> {
  /** Match objects in this round */
  matches: PopulatedMatch[];
}

/**
 * Regional strength mapping for biased draw algorithm
 */
export type RegionalStrength = {
  [key in Region]: number;
};

/**
 * Constant regional strength values
 * Used in biased draw probability calculation:
 * P(Team1 wins) = Strength(Team1) / (Strength(Team1) + Strength(Team2))
 */
export const REGIONAL_STRENGTHS: RegionalStrength = {
  [Region.LCK]: 100,
  [Region.LPL]: 90,
  [Region.LCP]: 70,
  [Region.LEC]: 60,
  [Region.LCS]: 50,
};

/**
 * Validation error result
 */
export interface ValidationError {
  field?: string;
  message: string;
}

/**
 * Validation result (either success or error list)
 */
export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ValidationError[] };

/**
 * Team JSON structure loaded from teams.json file
 */
export interface TeamData {
  /** Optional external identifier (UUID or slug) */
  id?: string;

  /** Team display name */
  name: string;

  /** Competitive region */
  region: Region;

  /** Optional regional seed (#1-#3) */
  seed?: number;

  /** Optional tier assignment for Swiss round one */
  tier?: TierName;
}

/**
 * Root structure of teams.json file
 */
export interface TeamsFile {
  /** Array of 16 teams */
  teams: TeamData[];
}

/**
 * Simulation result for a single match
 */
export interface SimulationResult {
  /** Match that was simulated */
  match: Match;

  /** Winning team */
  winner: Team;

  /** Win probability used (0-1) */
  probability: number;
}

/**
 * Result of a full round simulation
 */
export interface RoundSimulationResult {
  /** Round that was simulated */
  round: Round;

  /** Individual match results */
  matchResults: SimulationResult[];

  /** Updated team states after round */
  updatedTeams: Team[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a valid Region
 */
export function isRegion(value: unknown): value is Region {
  return Object.values(Region).includes(value as Region);
}

/**
 * Check if a team has reached qualification (3 wins)
 */
export function isQualified(team: Team): boolean {
  return team.wins === 3 && team.status === TeamStatus.QUALIFIED;
}

/**
 * Check if a team has been eliminated (3 losses)
 */
export function isEliminated(team: Team): boolean {
  return team.losses === 3 && team.status === TeamStatus.ELIMINATED;
}

/**
 * Check if a match is resolved (has a winner)
 */
export function isMatchResolved(match: Match): boolean {
  return match.winnerId !== null;
}

/**
 * Check if Swiss stage is complete (8 qualified, 8 eliminated)
 */
export function isSwissComplete(state: TournamentState): boolean {
  const qualified = state.teams.filter((t) => t.status === TeamStatus.QUALIFIED);
  const eliminated = state.teams.filter((t) => t.status === TeamStatus.ELIMINATED);
  return qualified.length === 8 && eliminated.length === 8;
}

/**
 * Check if knockout stage is complete (1 team remaining)
 */
export function isKnockoutComplete(state: TournamentState): boolean {
  if (!state.knockoutStage || state.knockoutStage.status !== StageStatus.COMPLETED) {
    return false;
  }

  const finalsMatch = state.matches.find(
    (m) => m.stage === StageType.KNOCKOUT && m.knockoutRound === KnockoutRound.FINALS
  );

  return finalsMatch !== undefined && isMatchResolved(finalsMatch);
}

/**
 * Get team's formatted record string (e.g., "2-1")
 */
export function getTeamRecord(team: Team): string {
  return `${team.wins}-${team.losses}`;
}

/**
 * Check if two teams have faced each other in match history
 */
export function haveTeamsMet(
  team1Id: string,
  team2Id: string,
  history: MatchHistory[]
): boolean {
  return history.some(
    (h) =>
      (h.team1Id === team1Id && h.team2Id === team2Id) ||
      (h.team1Id === team2Id && h.team2Id === team1Id)
  );
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Current schema version for tournament state
 * Update when making breaking changes to TournamentState structure
 */
export const TOURNAMENT_STATE_VERSION = '1.1.0';

/**
 * localStorage key for persisting tournament state
 */
export const TOURNAMENT_STORAGE_KEY = 'worlds-tournament-state';

/**
 * Number of teams in Swiss stage
 */
export const SWISS_TEAM_COUNT = 16;

/**
 * Number of teams that qualify from Swiss to Knockout
 */
export const KNOCKOUT_TEAM_COUNT = 8;

/**
 * Number of wins required to qualify from Swiss
 */
export const WINS_TO_QUALIFY = 3;

/**
 * Number of losses that eliminate from Swiss
 */
export const LOSSES_TO_ELIMINATE = 3;

/**
 * Maximum number of rounds in Swiss stage
 */
export const MAX_SWISS_ROUNDS = 5;

/**
 * Number of rounds in Knockout stage (Quarters, Semis, Finals)
 */
export const KNOCKOUT_ROUNDS = 3;
