import React from 'react';
import type { Team } from 'domain/entities/types';
import { TeamCard } from './TeamCard';

interface ResultsSectionProps {
  qualifiedTeams: Team[];
  eliminatedTeams: Team[];
  onTeamClick: (teamId: string) => void;
  qualifiedTitle?: string;
  eliminatedTitle?: string;
}

export const ResultsSection: React.FC<ResultsSectionProps> = React.memo(({
  qualifiedTeams,
  eliminatedTeams,
  onTeamClick,
  qualifiedTitle = 'Qualified (3 Wins)',
  eliminatedTitle = 'Eliminated (3 Losses)'
}) => {
  return (
    <section
      role="region"
      aria-label="Tournament results"
      className="flex-shrink-0 w-72 sm:w-80 px-3 py-2"
    >
      {qualifiedTeams.length > 0 && (
        <div className="mb-6 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-4 py-5 shadow-md shadow-black/5" aria-label="Qualified teams">
          <h3 className="text-lg font-bold mb-2 text-[rgb(var(--color-success))]">
            {qualifiedTitle}
          </h3>
          <div className="flex flex-col gap-3">
            {qualifiedTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => onTeamClick(team.id)}
                badgeContent={`${team.wins}-${team.losses}`}
              />
            ))}
          </div>
        </div>
      )}

      {eliminatedTeams.length > 0 && (
        <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-4 py-5 shadow-md shadow-black/5" aria-label="Eliminated teams">
          <h3 className="text-lg font-bold mb-2 text-[rgb(var(--color-danger))]">
            {eliminatedTitle}
          </h3>
          <div className="flex flex-col gap-3">
            {eliminatedTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => onTeamClick(team.id)}
                badgeContent={`${team.wins}-${team.losses}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
});

ResultsSection.displayName = 'ResultsSection';
