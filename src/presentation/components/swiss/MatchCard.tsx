import { Match, Team } from '../../../domain/entities/types';
import { TeamCard } from './TeamCard';

interface MatchCardProps {
  match: Match;
  team1: Team;
  team2: Team;
  onTeamClick?: (teamId: string) => void;
  onVsClick?: () => void;
}

export function MatchCard({ match, team1, team2, onTeamClick, onVsClick }: MatchCardProps) {
  const isResolved = match.winnerId !== null;
  const isLocked = match.locked;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]">
      <TeamCard
        team={team1}
        isWinner={match.winnerId === team1.id}
        onClick={onTeamClick ? () => onTeamClick(team1.id) : undefined}
      />

      <div className="flex items-center justify-center">
        <button
          className={`
            px-4 py-1 rounded text-sm font-medium
            ${isLocked
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-[rgb(var(--color-muted))] text-[rgb(var(--color-muted-foreground))]'
            }
            ${onVsClick ? 'hover:bg-[rgb(var(--color-accent))] cursor-pointer' : ''}
          `}
          onClick={onVsClick}
          disabled={!onVsClick}
        >
          {isLocked ? '🔒 vs' : 'vs'}
        </button>
      </div>

      <TeamCard
        team={team2}
        isWinner={match.winnerId === team2.id}
        onClick={onTeamClick ? () => onTeamClick(team2.id) : undefined}
      />

      {match.recordBracket && (
        <div className="text-xs text-center text-[rgb(var(--color-muted-foreground))] mt-2">
          Record: {match.recordBracket}
        </div>
      )}
    </div>
  );
}
