import type { Team } from '/domain/entities/types';
import { getTeamRecord } from '/domain/entities/Team';

interface TeamCardProps {
  team: Team;
  isWinner?: boolean;
  onClick?: () => void;
}

export function TeamCard({ team, isWinner = false, onClick }: TeamCardProps) {
  const record = getTeamRecord(team);

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 rounded-lg border
        ${isWinner
          ? 'border-green-500 bg-green-50 dark:bg-green-950'
          : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))]'
        }
        ${onClick ? 'cursor-pointer hover:bg-[rgb(var(--color-accent))] transition-colors' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="font-semibold text-[rgb(var(--color-foreground))]">
            {team.name}
          </span>
          <span className="text-sm text-[rgb(var(--color-muted-foreground))]">
            {team.region}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`
            px-2 py-1 rounded text-sm font-medium
            ${team.status === 'QUALIFIED'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : team.status === 'ELIMINATED'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }
          `}
        >
          {record}
        </span>
        {isWinner && (
          <span className="text-green-600 dark:text-green-400">✓</span>
        )}
      </div>
    </div>
  );
}
