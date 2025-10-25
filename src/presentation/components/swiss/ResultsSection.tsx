import React from 'react';
import type { Team } from 'domain/entities/types';
import { RecordGroup } from './RecordGroup';

interface ResultsSectionProps {
  qualifiedGroups: Array<{ record: string; teams: Team[] }>;
  eliminatedGroups: Array<{ record: string; teams: Team[] }>;
  onTeamClick: (teamId: string) => void;
  qualifiedTitle?: string;
  eliminatedTitle?: string;
}

export const ResultsSection: React.FC<ResultsSectionProps> = React.memo(({
  qualifiedGroups,
  eliminatedGroups,
  onTeamClick,
  qualifiedTitle = 'Qualified Teams',
  eliminatedTitle = 'Eliminated Teams'
}) => {
  const visibleQualifiedGroups = qualifiedGroups.filter(group => group.teams.length > 0);
  const visibleEliminatedGroups = eliminatedGroups.filter(group => group.teams.length > 0);

  return (
    <section
      role="region"
      aria-label="Tournament results"
      className="flex-shrink-0 w-72 sm:w-80 px-3 py-2"
    >
      {visibleQualifiedGroups.length > 0 && (
        <div className="mb-6" aria-label="Qualified teams">
          <h3 className="text-lg font-bold mb-3 text-[rgb(var(--color-success))]">
            {qualifiedTitle}
          </h3>
          <div className="flex flex-col">
            {visibleQualifiedGroups.map(group => (
              <RecordGroup
                key={group.record}
                record={group.record}
                teams={group.teams.map(team => ({ team }))}
                onTeamClick={onTeamClick}
              />
            ))}
          </div>
        </div>
      )}

      {visibleEliminatedGroups.length > 0 && (
        <div className="mb-6" aria-label="Eliminated teams">
          <h3 className="text-lg font-bold mb-3 text-[rgb(var(--color-danger))]">
            {eliminatedTitle}
          </h3>
          <div className="flex flex-col">
            {visibleEliminatedGroups.map(group => (
              <RecordGroup
                key={group.record}
                record={group.record}
                teams={group.teams.map(team => ({ team }))}
                onTeamClick={onTeamClick}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
});

ResultsSection.displayName = 'ResultsSection';
