import type { Team } from 'domain/entities/types';
import { TeamStatus } from 'domain/entities/types';
import type { SeedingConfig, SeedingTeam } from 'domain/entities/SeedingConfig';
import { SeedingLoader, SeedingLoaderError } from 'infrastructure/persistence/SeedingLoader';

export class TeamDataLoader {
  private static latestConfig: SeedingConfig | null = null;

  static getLastLoadedConfig(): SeedingConfig | null {
    return this.latestConfig;
  }

  /**
   * Load and validate teams from a JSON file
   * @param jsonPath - Path to the teams JSON file
   * @returns Promise<Team[]> - Array of validated Team entities
   * @throws Error if validation fails
   */
  static async loadTeams(jsonPath: string): Promise<Team[]> {
    try {
      const loader = new SeedingLoader();
      const config = await loader.load(jsonPath);
      const teams = config.teams.map((team, index) =>
        this.createTeamFromSeedingTeam(team, index)
      );

      this.validateTeamCount(teams);
      this.validateRegionalDistribution(teams);
      this.latestConfig = config;

      return teams;
    } catch (error) {
      if (error instanceof SeedingLoaderError) {
        throw new Error(`TeamDataLoader error: ${error.messages.join(', ')}`);
      }
      if (error instanceof Error) {
        throw new Error(`TeamDataLoader error: ${error.message}`);
      }
      throw new Error('TeamDataLoader error: Unknown failure');
    }
  }

  /**
   * Validate and create a Team entity from raw data
   */
  private static createTeamFromSeedingTeam(data: SeedingTeam, index: number): Team {
    if (!data.id) {
      throw new Error(`Team at index ${index}: Missing id`);
    }

    if (!data.name) {
      throw new Error(`Team at index ${index}: Missing name`);
    }

    return {
      id: data.id,
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
    }, {} as Record<string, number>);

    console.log('Team regional distribution:', regionCounts);
  }
}
