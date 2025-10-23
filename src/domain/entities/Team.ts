import type { Team } from './types';
import { TeamStatus } from './types';

/**
 * Get a team's current record string (e.g., "2-1")
 */
export function getTeamRecord(team: Team): string {
  return `${team.wins}-${team.losses}`;
}

/**
 * Update a team's record after a match
 */
export function updateTeamRecord(team: Team, won: boolean): Team {
  const updatedTeam: Team = {
    ...team,
    wins: won ? team.wins + 1 : team.wins,
    losses: won ? team.losses : team.losses + 1,
  };

  // Update status based on new record
  if (updatedTeam.wins >= 3) {
    updatedTeam.status = TeamStatus.QUALIFIED;
  } else if (updatedTeam.losses >= 3) {
    updatedTeam.status = TeamStatus.ELIMINATED;
  } else {
    updatedTeam.status = TeamStatus.ACTIVE;
  }

  return updatedTeam;
}

/**
 * Get teams filtered by status
 */
export function getTeamsByStatus(teams: Team[], status: TeamStatus): Team[] {
  return teams.filter(team => team.status === status);
}

/**
 * Get teams with a specific record (wins-losses)
 */
export function getTeamsByRecord(teams: Team[], wins: number, losses: number): Team[] {
  return teams.filter(team => team.wins === wins && team.losses === losses);
}

/**
 * Check if a team can still play (not qualified or eliminated)
 */
export function canTeamPlay(team: Team): boolean {
  return team.status === TeamStatus.ACTIVE;
}

/**
 * Get all active teams (still playing in Swiss stage)
 */
export function getActiveTeams(teams: Team[]): Team[] {
  return getTeamsByStatus(teams, TeamStatus.ACTIVE);
}

/**
 * Get all qualified teams (3 wins)
 */
export function getQualifiedTeams(teams: Team[]): Team[] {
  return getTeamsByStatus(teams, TeamStatus.QUALIFIED);
}

/**
 * Get all eliminated teams (3 losses)
 */
export function getEliminatedTeams(teams: Team[]): Team[] {
  return getTeamsByStatus(teams, TeamStatus.ELIMINATED);
}
