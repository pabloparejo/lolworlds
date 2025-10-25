import React from 'react';
import type { Team } from 'domain/entities/types';
import { MatchRow } from './MatchRow';
import { TeamCard } from './TeamCard';
import type { SwissMatchWithTeams } from './types';

interface RecordGroupProps {
  record: string;
  matches?: SwissMatchWithTeams[];
  teams?: Array<{ team: Team; badgeContent?: string }>;
  onTeamClick: (teamId: string) => void;
  onSelectWinner?: (matchId: string, teamId: string) => void;
  onVsClick?: (matchId: string) => void;
}

export const RecordGroup: React.FC<RecordGroupProps> = React.memo(({
  record,
  matches = [],
  teams = [],
  onTeamClick,
  onSelectWinner,
  onVsClick
}) => {
  const hasMatches = matches.length > 0;
  const hasTeams = teams.length > 0;

  if (!hasMatches && !hasTeams) {
    return null;
  }

  const totalCount = hasMatches ? matches.length : teams.length;
  const countLabel = hasMatches
    ? `${totalCount} match${totalCount === 1 ? '' : 'es'}`
    : `${totalCount} team${totalCount === 1 ? '' : 's'}`;

  return (
    <section
      role="group"
      aria-label={`Teams with ${record} record`}
      className="mb-2 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-2 py-2 shadow-sm shadow-black/5"
    >
      <header className="mb-1 flex items-center justify-between px-2">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--color-muted-foreground))]">
          {record}
        </h4>
        <span className="text-xs font-medium text-[rgb(var(--color-muted-foreground))]">
          {countLabel}
        </span>
      </header>
      <div className="flex flex-col">
        {hasMatches && matches.map((match, index) => (
          <MatchRow
            key={match.id}
            match={match}
            onTeamClick={onTeamClick}
            onSelectWinner={onSelectWinner}
            onVsClick={onVsClick}
            showDivider={index !== matches.length - 1}
          />
        ))}

        {hasTeams && (
          <ul className="flex flex-column gap-2 px-2 py-2">
            {teams.map(({ team, badgeContent }) => (
              <li key={team.id} className="flex-shrink-0">
                <TeamCard
                  team={team}
                  onClick={() => onTeamClick(team.id)}
                  showBadge
                  badgeContent={badgeContent ?? record}
                  className="w-20"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
});

RecordGroup.displayName = 'RecordGroup';
