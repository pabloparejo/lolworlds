import type { Match, Team } from 'domain/entities/types';

export type SwissMatchWithTeams = Match & {
  team1: Team;
  team2: Team;
  lockedWinnerId?: string | null;
};
