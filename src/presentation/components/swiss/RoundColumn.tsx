import React, { useMemo } from 'react';
import { RecordGroup } from './RecordGroup';
import { groupMatchesByRecord } from '../../utils/recordGroupingUtils';
import type { SwissMatchWithTeams } from './types';
import type { Team } from 'domain/entities/types';
import { TeamCard } from './TeamCard';

interface RoundColumnProps {
  roundNumber: number;
  matches: SwissMatchWithTeams[];
  onTeamClick: (teamId: string) => void;
  onSelectWinner: (matchId: string, teamId: string) => void;
  onVsClick: (matchId: string) => void;
  topSummary?: {
    title: string;
    teams: Array<{ team: Team; record: string }>;
  };
  bottomSummary?: {
    title: string;
    teams: Array<{ team: Team; record: string }>;
  };
}

export const RoundColumn: React.FC<RoundColumnProps> = React.memo(({
  roundNumber,
  matches,
  onTeamClick,
  onSelectWinner,
  onVsClick,
  topSummary,
  bottomSummary,
}) => {
  const recordGroups = useMemo(() => {
    return groupMatchesByRecord(matches);
  }, [matches]);

  return (
    <div
      role="region"
      aria-label={`Round ${roundNumber}`}
      className="flex h-full w-72 flex-shrink-0 flex-col justify-center gap-4 px-3 py-4 sm:w-80 sm:px-4"
      data-round={roundNumber}
    >
      <h3
        className="text-lg font-bold mb-2 text-[rgb(var(--color-foreground))]"
        tabIndex={0}
      >
        Round {roundNumber}
      </h3>

      {topSummary && topSummary.teams.length > 0 && (
        <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-3 py-3 shadow-sm shadow-black/5" aria-label={topSummary.title}>
          <h4 className="text-sm font-semibold text-[rgb(var(--color-success))]">
            {topSummary.title}
          </h4>
          <div className="mt-2 flex flex-col gap-2">
            {topSummary.teams.map(({ team, record }) => (
              <TeamCard
                key={team.id}
                team={team}
                showBadge
                badgeContent={record}
                onClick={() => onTeamClick(team.id)}
              />
            ))}
          </div>
        </section>
      )}

      {Array.from(recordGroups.entries()).map(([record, groupMatches]) => (
        <RecordGroup
          key={record}
          record={record}
          matches={groupMatches}
          onTeamClick={onTeamClick}
          onSelectWinner={onSelectWinner}
          onVsClick={onVsClick}
        />
      ))}

      {bottomSummary && bottomSummary.teams.length > 0 && (
        <section className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-3 py-3 shadow-sm shadow-black/5" aria-label={bottomSummary.title}>
          <h4 className="text-sm font-semibold text-[rgb(var(--color-danger))]">
            {bottomSummary.title}
          </h4>
          <div className="mt-2 flex flex-col gap-2">
            {bottomSummary.teams.map(({ team, record }) => (
              <TeamCard
                key={team.id}
                team={team}
                showBadge
                badgeContent={record}
                onClick={() => onTeamClick(team.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

RoundColumn.displayName = 'RoundColumn';
