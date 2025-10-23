import type { Match, Team } from ../../../domain/entities/types';
import { MatchCard } from './MatchCard';

interface RecordBracketProps {
  record: string;
  matches: Match[];
  teams: Team[];
  onTeamClick?: (teamId: string) => void;
  onVsClick?: (matchId: string) => void;
}

export function RecordBracket({ record, matches, teams, onTeamClick, onVsClick }: RecordBracketProps) {
  if (matches.length === 0) {
    return null;
  }

  const getTeam = (teamId: string): Team | undefined => {
    return teams.find(t => t.id === teamId);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--color-foreground))]">
        Record: {record}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map(match => {
          const team1 = getTeam(match.team1Id);
          const team2 = getTeam(match.team2Id);

          if (!team1 || !team2) {
            return null;
          }

          return (
            <MatchCard
              key={match.id}
              match={match}
              team1={team1}
              team2={team2}
              onTeamClick={onTeamClick}
              onVsClick={onVsClick ? () => onVsClick(match.id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
