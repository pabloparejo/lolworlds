import { describe, it, expect } from 'vitest';
import { KnockoutSeeder } from './KnockoutSeeder';
import {
  TeamStatus,
  Region,
  type Team,
} from 'domain/entities/types';

const createTeam = (id: string, name: string, wins: number, losses: number): Team => ({
  id,
  name,
  region: Region.LCK,
  wins,
  losses,
  status: TeamStatus.QUALIFIED,
});

describe('KnockoutSeeder', () => {
  const seeder = new KnockoutSeeder();

  it('pairs 3-0 teams with 3-2 opponents on opposite sides', () => {
    const teams: Team[] = [
      createTeam('A', 'Alpha', 3, 0),
      createTeam('O', 'Omega', 3, 0),
      createTeam('B', 'Bravo', 3, 1),
      createTeam('C', 'Charlie', 3, 1),
      createTeam('D', 'Delta', 3, 1),
      createTeam('E', 'Eden', 3, 2),
      createTeam('F', 'Fury', 3, 2),
      createTeam('G', 'Giant', 3, 2),
    ];

    const matches = seeder.seedBracket(teams);
    expect(matches).toHaveLength(4);

    const quarterfinalPairs = matches.map(match => [match.team1Id, match.team2Id]);

    const match1Ids = quarterfinalPairs[0];
    const match4Ids = quarterfinalPairs[3];

    const idToRecord = new Map(teams.map(team => [team.id, `${team.wins}-${team.losses}`]));

    expect(match1Ids.some(id => idToRecord.get(id) === '3-0')).toBe(true);
    expect(match1Ids.some(id => idToRecord.get(id) === '3-2')).toBe(true);
    expect(match4Ids.some(id => idToRecord.get(id) === '3-0')).toBe(true);
    expect(match4Ids.some(id => idToRecord.get(id) === '3-2')).toBe(true);

    const middleMatches = quarterfinalPairs.slice(1, 3);
    middleMatches.forEach(pair => {
      const records = pair.map(id => idToRecord.get(id));
      const count3Zero = records.filter(record => record === '3-0').length;
      const count3Two = records.filter(record => record === '3-2').length;
      expect(count3Zero).toBe(0);
      expect(count3Two).toBeLessThanOrEqual(1);
    });
  });

  it('throws when the Swiss distribution is invalid', () => {
    const teams: Team[] = [
      createTeam('A', 'Alpha', 3, 0),
      createTeam('B', 'Bravo', 3, 0),
      createTeam('C', 'Charlie', 3, 0), // extra 3-0
      createTeam('D', 'Delta', 3, 1),
      createTeam('E', 'Echo', 3, 1),
      createTeam('F', 'Foxtrot', 3, 1),
      createTeam('G', 'Giant', 3, 2),
      createTeam('H', 'Hydra', 3, 2),
    ];

    expect(() => seeder.seedBracket(teams)).toThrow(/Swiss format expects exactly two 3-0 teams/);
  });
});
