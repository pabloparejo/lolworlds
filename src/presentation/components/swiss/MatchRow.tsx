import React from 'react';
import type { SwissMatchWithTeams } from './types';
import { TeamCard } from './TeamCard';

interface MatchRowProps {
  match: SwissMatchWithTeams;
  onTeamClick?: (teamId: string) => void;
  onSelectWinner?: (matchId: string, teamId: string) => void;
  onVsClick?: (matchId: string) => void;
  showDivider?: boolean;
}

export const MatchRow: React.FC<MatchRowProps> = ({
  match,
  onTeamClick,
  onSelectWinner,
  onVsClick,
  showDivider = true
}) => {
  const { team1, team2 } = match;
  const isLocked = match.locked || Boolean(match.lockedWinnerId);
  const displayWinnerId = match.winnerId ?? match.lockedWinnerId ?? null;
  const isPending = match.winnerId === null;

  const handleSelect = (teamId: string) => {
    if (isPending && onSelectWinner) {
      onSelectWinner(match.id, teamId);
    } else if (onTeamClick) {
      onTeamClick(teamId);
    }
  };

  const isTeamInteractive = (isPending && Boolean(onSelectWinner)) || Boolean(onTeamClick);

  return (
    <div
      role="group"
      aria-label={`${team1.name} versus ${team2.name}`}
      className={`
        flex flex-col gap-1 bg-[rgb(var(--color-card))] p-2 items-center justify-center sm:flex-row
        ${showDivider ? 'border-b border-[rgb(var(--color-border))]' : ''}
      `}
      data-match-id={match.id}
    >
      <TeamCard
        team={team1}
        isWinner={displayWinnerId === team1.id}
        onClick={isTeamInteractive ? () => handleSelect(team1.id) : undefined}
        showBadge={false}
        className="w-full sm:w-56"
      />

      <button
        type="button"
        onClick={onVsClick ? () => onVsClick(match.id) : undefined}
        disabled={!onVsClick}
        className={`
          inline-flex items-center justify-center rounded-full px-4 py-1 text-sm font-semibold tracking-wide transition-colors sm:self-center
          ${isLocked
            ? 'bg-[rgb(var(--color-warning))]/20 text-[rgb(var(--color-warning))]'
            : 'bg-[rgb(var(--color-muted))] text-[rgb(var(--color-muted-foreground))] hover:bg-[rgb(var(--color-accent))]'
          }
          ${onVsClick ? 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-primary))]' : 'cursor-default'}
        `}
        aria-label={`View details for ${team1.name} versus ${team2.name}`}
      >
        {isLocked ? '🔒 VS' : 'VS'}
      </button>

      <TeamCard
        team={team2}
        isWinner={displayWinnerId === team2.id}
        onClick={isTeamInteractive ? () => handleSelect(team2.id) : undefined}
        showBadge={false}
        className="w-full sm:w-56"
      />
    </div>
  );
};

MatchRow.displayName = 'MatchRow';
