import React, { useMemo } from 'react';
import { RecordGroup } from './RecordGroup';
import { groupMatchesByRecord } from '../../utils/recordGroupingUtils';
import type { SwissMatchWithTeams } from './types';
import type { Team } from 'domain/entities/types';
import { TeamSummarySection } from './TeamSummarySection';

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

  const paddingTopClass = useMemo(() => {
    switch (roundNumber) {
      case 1:
        return 'pt-18';
      case 2:
        return 'pt-13';
      case 3:
        return 'pt-4';
      case 4:
        return 'pt-0'
      case 5:
        return 'pt-28';
      default:
        return '';
    }
  }, [roundNumber]);

  return (
    <div
      role="region"
      aria-label={`Round ${roundNumber}`}
      className="flex h-full w-72 flex-shrink-0 flex-col justify-center px-3 py-4 sm:w-80 sm:px-4"
      data-round={roundNumber}
    >
      <h3
        className="text-lg font-bold mb-2 text-[rgb(var(--color-foreground))]"
        tabIndex={0}
      >
        Round {roundNumber}
      </h3>
      <section className={paddingTopClass}>
        {topSummary && (
          <TeamSummarySection
            title={topSummary.title}
            teams={topSummary.teams}
            onTeamClick={onTeamClick}
            variant="success"
            className="mb-2"
          />
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

        {bottomSummary && (
          <TeamSummarySection
            title={bottomSummary.title}
            teams={bottomSummary.teams}
            onTeamClick={onTeamClick}
            variant="danger"
          />
        )}
      </section>
    </div>
  );
});

RoundColumn.displayName = 'RoundColumn';
