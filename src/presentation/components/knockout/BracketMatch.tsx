import type { Match, Team } from 'domain/entities/types';
import { TeamCard } from '../swiss/TeamCard';

interface BracketMatchProps {
  match: Match;
  team1: Team;
  team2: Team;
  onTeamClick?: (teamId: string) => void;
}

export function BracketMatch({ match, team1, team2, onTeamClick }: BracketMatchProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border-2 border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]">
      <TeamCard
        team={team1}
        isWinner={match.winnerId === team1.id}
        onClick={onTeamClick ? () => onTeamClick(team1.id) : undefined}
      />

      <div className="flex items-center justify-center py-1">
        <span className="text-sm font-medium text-[rgb(var(--color-muted-foreground))]">
          vs
        </span>
      </div>

      <TeamCard
        team={team2}
        isWinner={match.winnerId === team2.id}
        onClick={onTeamClick ? () => onTeamClick(team2.id) : undefined}
      />

      {match.winnerId && (
        <div className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-400">
          Winner advances
        </div>
      )}
    </div>
  );
}
