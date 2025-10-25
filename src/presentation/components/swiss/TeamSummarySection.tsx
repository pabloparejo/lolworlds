import React from 'react';
import { TeamCard } from './TeamCard';
import type { Team } from 'domain/entities/types';

interface TeamSummaryProps {
  title: string;
  teams: Array<{ team: Team; record: string }>;
  onTeamClick: (teamId: string) => void;
  variant: 'success' | 'danger';
  className?: string;
}

export const TeamSummarySection: React.FC<TeamSummaryProps> = ({
  title,
  teams,
  onTeamClick,
  variant,
  className = '',
}) => {
  if (teams.length === 0) return null;

  const colorClass = variant === 'success'
    ? 'border-[rgb(var(--color-success))] text-[rgb(var(--color-success))]'
    : 'border-[rgb(var(--color-danger))] text-[rgb(var(--color-danger))]';

  return (
    <section
      className={`rounded-2xl border bg-[rgb(var(--color-card))] px-2 py-2 shadow-sm shadow-black/5 ${colorClass} ${className}`}
      aria-label={title}
    >
      <h4 className={`text-sm font-semibold ${variant === 'success' ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-danger))]'}`}>
        {title}
      </h4>
      <div className="mt-2 flex flex-row gap-2">
        {teams.map(({ team, record }) => (
          <TeamCard
            badgeContent={record}
            key={team.id}
            onClick={() => onTeamClick(team.id)}
            showBadge
            className="w-72"
            team={team}
          />
        ))}
      </div>
    </section>
  );
};
