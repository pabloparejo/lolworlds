import { Team, TeamStatus } from '../entities/types';

/**
 * Check if a team has qualified (reached 3 wins)
 * @param team - The team to check
 * @returns true if team has 3 wins
 */
export function isQualified(team: Team): boolean {
  return team.wins >= 3;
}

/**
 * Check if a team is eliminated (reached 3 losses)
 * @param team - The team to check
 * @returns true if team has 3 losses
 */
export function isEliminated(team: Team): boolean {
  return team.losses >= 3;
}

/**
 * Get a team's current record string (e.g., "2-1")
 * @param team - The team
 * @returns Record string in format "wins-losses"
 */
export function getTeamRecord(team: Team): string {
  return `${team.wins}-${team.losses}`;
}

/**
 * Update team status based on wins/losses
 * @param team - The team to update
 * @returns Updated team with correct status
 */
export function updateTeamStatus(team: Team): Team {
  if (isQualified(team)) {
    return { ...team, status: TeamStatus.QUALIFIED };
  }

  if (isEliminated(team)) {
    return { ...team, status: TeamStatus.ELIMINATED };
  }

  return { ...team, status: TeamStatus.ACTIVE };
}

/**
 * Check if a team can still play (not qualified or eliminated)
 * @param team - The team to check
 * @returns true if team is still active in Swiss stage
 */
export function canPlayMatch(team: Team): boolean {
  return !isQualified(team) && !isEliminated(team);
}

/**
 * Get the Swiss round number based on a team's total games played
 * @param team - The team
 * @returns Round number (1-5)
 */
export function getTeamRoundNumber(team: Team): number {
  return team.wins + team.losses + 1;
}

/**
 * Check if two teams are in the same record bracket (same wins and losses)
 * @param team1 - First team
 * @param team2 - Second team
 * @returns true if teams have same record
 */
export function hasSameRecord(team1: Team, team2: Team): boolean {
  return team1.wins === team2.wins && team1.losses === team2.losses;
}

/**
 * Get all teams with a specific record
 * @param teams - Array of teams
 * @param wins - Number of wins
 * @param losses - Number of losses
 * @returns Teams with the specified record
 */
export function getTeamsByRecord(teams: Team[], wins: number, losses: number): Team[] {
  return teams.filter(team => team.wins === wins && team.losses === losses);
}

/**
 * Get all active teams (not qualified or eliminated)
 * @param teams - Array of teams
 * @returns Teams still active in Swiss stage
 */
export function getActiveTeams(teams: Team[]): Team[] {
  return teams.filter(canPlayMatch);
}

/**
 * Get all qualified teams (3 wins)
 * @param teams - Array of teams
 * @returns Teams that have qualified
 */
export function getQualifiedTeams(teams: Team[]): Team[] {
  return teams.filter(isQualified);
}

/**
 * Get all eliminated teams (3 losses)
 * @param teams - Array of teams
 * @returns Teams that have been eliminated
 */
export function getEliminatedTeams(teams: Team[]): Team[] {
  return teams.filter(isEliminated);
}
