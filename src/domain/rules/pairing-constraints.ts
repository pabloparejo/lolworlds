import type { Team, MatchHistory } from '../entities/types';

/**
 * Check if two teams have played against each other before
 * @param team1Id - First team's ID
 * @param team2Id - Second team's ID
 * @param matchHistory - Array of previous matchups
 * @returns true if teams have met before
 */
export function haveTeamsMet(
  team1Id: string,
  team2Id: string,
  matchHistory: ReadonlyArray<MatchHistory>
): boolean {
  return matchHistory.some(
    history =>
      (history.team1Id === team1Id && history.team2Id === team2Id) ||
      (history.team1Id === team2Id && history.team2Id === team1Id)
  );
}

/**
 * Check if two teams can be paired according to Swiss rules
 * Official Riot algorithm: avoid repeat matchups only
 * @param team1 - First team
 * @param team2 - Second team
 * @param matchHistory - Array of previous matchups
 * @returns true if pairing is valid
 */
export function canPairTeams(
  team1: Team,
  team2: Team,
  matchHistory: ReadonlyArray<MatchHistory>
): boolean {
  // Cannot pair a team with itself
  if (team1.id === team2.id) {
    return false;
  }

  // Cannot pair teams that have already played
  if (haveTeamsMet(team1.id, team2.id, matchHistory)) {
    return false;
  }

  // Teams must have the same record (same wins and losses)
  if (team1.wins !== team2.wins || team1.losses !== team2.losses) {
    return false;
  }

  return true;
}

/**
 * Get all valid pairing options for a team
 * @param team - The team to find pairings for
 * @param candidateTeams - Pool of teams to pair with
 * @param matchHistory - Array of previous matchups
 * @returns Array of teams that can be paired with the given team
 */
export function getValidPairings(
  team: Team,
  candidateTeams: ReadonlyArray<Team>,
  matchHistory: ReadonlyArray<MatchHistory>
): Team[] {
  return candidateTeams.filter(candidate => canPairTeams(team, candidate, matchHistory));
}

/**
 * Add a matchup to the match history
 * @param matchHistory - Current match history
 * @param team1Id - First team's ID
 * @param team2Id - Second team's ID
 * @returns Updated match history
 */
export function addMatchToHistory(
  matchHistory: MatchHistory[],
  team1Id: string,
  team2Id: string
): MatchHistory[] {
  return [...matchHistory, { team1Id, team2Id }];
}

/**
 * Check if a valid Swiss pairing exists for all remaining teams
 * This is a simplified check - in practice, backtracking may be needed
 * @param teams - Teams to pair
 * @param matchHistory - Previous matchups
 * @returns true if it appears possible to pair all teams
 */
export function canCompleteRound(
  teams: ReadonlyArray<Team>,
  matchHistory: ReadonlyArray<MatchHistory>
): boolean {
  // Need even number of teams
  if (teams.length % 2 !== 0) {
    return false;
  }

  // Group teams by record
  const recordGroups = new Map<string, Team[]>();

  teams.forEach(team => {
    const record = `${team.wins}-${team.losses}`;
    if (!recordGroups.has(record)) {
      recordGroups.set(record, []);
    }
    recordGroups.get(record)!.push(team);
  });

  // Each record group must have even number of teams or valid cross-group pairings
  for (const [, groupTeams] of recordGroups) {
    if (groupTeams.length % 2 !== 0) {
      // Odd group - would need cross-group pairing which violates Swiss rules
      return false;
    }
  }

  return true;
}
