import type { Team } from '../../domain/entities/types';
import { Region, TeamStatus } from '../../domain/entities/types';
import { v4 as uuidv4 } from 'uuid';

interface TeamData {
  name: string;
  region: Region;
}

interface TeamsJSON {
  teams: TeamData[];
}

export class TeamDataLoader {
  /**
   * Load and validate teams from a JSON file
   * @param jsonPath - Path to the teams JSON file
   * @returns Promise<Team[]> - Array of validated Team entities
   * @throws Error if validation fails
   */
  static async loadTeams(jsonPath: string): Promise<Team[]> {
    try {
      const response = await fetch(jsonPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch teams data: ${response.statusText}`);
      }

      const data: TeamsJSON = await response.json();

      if (!data.teams || !Array.isArray(data.teams)) {
        throw new Error('Invalid teams data format: missing "teams" array');
      }

      const teams = data.teams.map((teamData, index) =>
        this.validateAndCreateTeam(teamData, index)
      );

      this.validateTeamCount(teams);
      this.validateRegionalDistribution(teams);

      return teams;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`TeamDataLoader error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate and create a Team entity from raw data
   */
  private static validateAndCreateTeam(data: TeamData, index: number): Team {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error(`Team at index ${index}: Invalid or missing name`);
    }

    if (data.name.length < 1 || data.name.length > 50) {
      throw new Error(`Team at index ${index}: Name must be between 1 and 50 characters`);
    }

    if (!data.region || !Object.values(Region).includes(data.region)) {
      throw new Error(
        `Team at index ${index}: Invalid region "${data.region}". Must be one of: ${Object.values(Region).join(', ')}`
      );
    }

    return {
      id: uuidv4(),
      name: data.name.trim(),
      region: data.region,
      wins: 0,
      losses: 0,
      status: TeamStatus.ACTIVE,
    };
  }

  /**
   * Validate that exactly 16 teams are present
   */
  private static validateTeamCount(teams: Team[]): void {
    const REQUIRED_TEAM_COUNT = 16;
    if (teams.length !== REQUIRED_TEAM_COUNT) {
      throw new Error(
        `Invalid team count: expected ${REQUIRED_TEAM_COUNT}, got ${teams.length}`
      );
    }
  }

  /**
   * Validate regional distribution (optional check for data quality)
   * Logs warning if distribution seems unusual but doesn't throw
   */
  private static validateRegionalDistribution(teams: Team[]): void {
    const regionCounts = teams.reduce((acc, team) => {
      acc[team.region] = (acc[team.region] || 0) + 1;
      return acc;
    }, {} as Record<Region, number>);

    // Log distribution for debugging
    console.log('Team regional distribution:', regionCounts);

    // Warn if any region has 0 teams (unusual but not fatal)
    Object.values(Region).forEach(region => {
      if (!regionCounts[region]) {
        console.warn(`Warning: No teams from region ${region}`);
      }
    });
  }
}
