import type { Team } from 'domain/entities/types';
import { TeamStatus } from 'domain/entities/types';
import { getTeamRecord } from 'domain/entities/Team';

interface TeamCardProps {
  team: Team;
  isWinner?: boolean;
  onClick?: () => void;
  showBadge?: boolean;
  badgeContent?: string | null;
  className?: string;
}

export function TeamCard({
  team,
  isWinner = false,
  onClick,
  showBadge = true,
  badgeContent,
  className,
}: TeamCardProps) {
  const record = getTeamRecord(team);
  const resolvedBadge = badgeContent ?? record;
  const shouldRenderBadge = showBadge && resolvedBadge;

  const badgeClassName = (() => {
    switch (team.status) {
      case TeamStatus.QUALIFIED:
        return 'bg-[rgba(var(--color-success),0.15)] text-[rgb(var(--color-success))]';
      case TeamStatus.ELIMINATED:
        return 'bg-[rgba(var(--color-danger),0.15)] text-[rgb(var(--color-danger))]';
      default:
        return 'bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]';
    }
  })();

  return (
    <div
      className={`
        flex items-center justify-center px-2 py-1 rounded-lg border
        ${isWinner
          ? 'border-[rgb(var(--color-success))] bg-[rgba(var(--color-success),0.12)]'
          : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))]'
        }
        ${onClick ? 'cursor-pointer hover:bg-[rgb(var(--color-accent))] transition-colors' : ''}
        ${className ?? ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex flex-col text-center">
          <p className="font-semibold text-[rgb(var(--color-foreground))]">
            {team.id}
          </p>
          <p className="text-sm text-[rgb(var(--color-muted-foreground))]">
            {team.region}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {shouldRenderBadge && (
          <span className={`px-2 py-1 rounded text-sm font-medium ${badgeClassName}`}>
            {resolvedBadge}
          </span>
        )}
      </div>
    </div>
  );
}
