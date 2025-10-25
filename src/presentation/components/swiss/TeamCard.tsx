import type { Team } from 'domain/entities/types';

interface TeamCardProps {
  badgeContent?: string | null;
  className?: string;
  isWinner?: boolean;
  onClick?: () => void;
  showBadge?: boolean;
  team: Team;
  style?: React.CSSProperties;
}

export function TeamCard({
  team,
  isWinner = false,
  onClick,
  className,
  style,
}: TeamCardProps) {

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
      style={style}
    >
      <div className="flex items-center">
        <div className="flex flex-col text-center">
          <p className="font-semibold text-[rgb(var(--color-foreground))]">
            {team.id}
          </p>
          <p className="text-xs text-[rgb(var(--color-muted-foreground))]">
            {team.region}
          </p>
        </div>
      </div>
    </div>
  );
}
