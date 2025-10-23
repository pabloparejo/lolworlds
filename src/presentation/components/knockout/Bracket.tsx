import type { Match, Team, KnockoutRound } from 'domain/entities/types';
import { BracketMatch } from './BracketMatch';

interface BracketProps {
  matches: Match[];
  teams: Team[];
  onTeamClick?: (teamId: string) => void;
}

export function Bracket({ matches, teams, onTeamClick }: BracketProps) {
  const getTeam = (teamId: string): Team | undefined => {
    return teams.find(t => t.id === teamId);
  };

  const quarterfinalsMatches = matches.filter(m => m.knockoutRound === KnockoutRound.QUARTERFINALS);
  const semifinalsMatches = matches.filter(m => m.knockoutRound === KnockoutRound.SEMIFINALS);
  const finalsMatches = matches.filter(m => m.knockoutRound === KnockoutRound.FINALS);

  return (
    <div className="space-y-8">
      {/* Quarterfinals */}
      {quarterfinalsMatches.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 text-[rgb(var(--color-foreground))]">
            Quarterfinals
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quarterfinalsMatches.map(match => {
              const team1 = getTeam(match.team1Id);
              const team2 = getTeam(match.team2Id);

              if (!team1 || !team2) {
                return null;
              }

              return (
                <BracketMatch
                  key={match.id}
                  match={match}
                  team1={team1}
                  team2={team2}
                  onTeamClick={onTeamClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Semifinals */}
      {semifinalsMatches.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 text-[rgb(var(--color-foreground))]">
            Semifinals
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semifinalsMatches.map(match => {
              const team1 = getTeam(match.team1Id);
              const team2 = getTeam(match.team2Id);

              if (!team1 || !team2) {
                return null;
              }

              return (
                <BracketMatch
                  key={match.id}
                  match={match}
                  team1={team1}
                  team2={team2}
                  onTeamClick={onTeamClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Finals */}
      {finalsMatches.length > 0 && (
        <div>
          <h4 className="text-xl font-bold mb-4 text-[rgb(var(--color-foreground))]">
            Finals
          </h4>
          <div className="max-w-md mx-auto">
            {finalsMatches.map(match => {
              const team1 = getTeam(match.team1Id);
              const team2 = getTeam(match.team2Id);

              if (!team1 || !team2) {
                return null;
              }

              return (
                <BracketMatch
                  key={match.id}
                  match={match}
                  team1={team1}
                  team2={team2}
                  onTeamClick={onTeamClick}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
