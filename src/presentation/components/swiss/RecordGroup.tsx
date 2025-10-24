import React from 'react';
import { MatchRow } from './MatchRow';
import type { SwissMatchWithTeams } from './types';

interface RecordGroupProps {
  record: string;
  matches: SwissMatchWithTeams[];
  onTeamClick: (teamId: string) => void;
  onSelectWinner: (matchId: string, teamId: string) => void;
  onVsClick: (matchId: string) => void;
}

export const RecordGroup: React.FC<RecordGroupProps> = React.memo(({
  record,
  matches,
  onTeamClick,
  onSelectWinner,
  onVsClick
}) => {
  return (
    <section
      role="group"
      aria-label={`Teams with ${record} record`}
      className="mb-2 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-card))] px-3 py-3 shadow-sm shadow-black/5"
    >
      <header className="mb-1 flex items-center justify-between px-2">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-[rgb(var(--color-muted-foreground))]">
          {record}
        </h4>
        <span className="text-xs font-medium text-[rgb(var(--color-muted-foreground))]">
          {matches.length} match{matches.length === 1 ? '' : 'es'}
        </span>
      </header>
      <div className="flex flex-col">
        {matches.map(match => (
          <MatchRow
            key={match.id}
            match={match}
            onTeamClick={onTeamClick}
            onSelectWinner={onSelectWinner}
            onVsClick={onVsClick}
          />
        ))}
      </div>
    </section>
  );
});

RecordGroup.displayName = 'RecordGroup';
