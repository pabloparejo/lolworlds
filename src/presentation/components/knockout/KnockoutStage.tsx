import type { TournamentState } from 'domain/entities/types';
import { StageType } from 'domain/entities/types';
import { Bracket } from './Bracket';

interface KnockoutStageProps {
  state: TournamentState;
  onTeamClick?: (teamId: string) => void;
  onSimulateRound?: () => void;
}

export function KnockoutStage({ state, onTeamClick, onSimulateRound }: KnockoutStageProps) {
  const { knockoutStage, matches, teams } = state;

  // Get Knockout stage matches
  const knockoutMatches = matches.filter(m => m.stage === StageType.KNOCKOUT);

  const isComplete = knockoutStage.status === 'COMPLETE';
  const hasStarted = knockoutStage.status !== 'NOT_STARTED';
  const canStart = state.swissStage.status === 'COMPLETE';

  // Get champion (winner of finals)
  const finalsMatch = knockoutMatches.find(m => m.knockoutRound === 'FINALS');
  const champion = finalsMatch?.winnerId
    ? teams.find(t => t.id === finalsMatch.winnerId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-foreground))]">
          Knockout Stage
        </h2>
        <div className="flex items-center gap-4">
          {!canStart && (
            <span className="text-sm text-[rgb(var(--color-muted-foreground))]">
              Complete Swiss Stage first
            </span>
          )}
          {onSimulateRound && canStart && !isComplete && (
            <button
              onClick={onSimulateRound}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {hasStarted ? 'Simulate Next Round' : 'Start Knockout Stage'}
            </button>
          )}
          {isComplete && champion && (
            <div className="text-center">
              <span className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold text-lg">
                🏆 Champion: {champion.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {!canStart && (
        <div className="text-center py-12 text-[rgb(var(--color-muted-foreground))]">
          <p>Complete the Swiss Stage to unlock the Knockout Stage</p>
        </div>
      )}

      {canStart && knockoutMatches.length === 0 && !hasStarted && (
        <div className="text-center py-12 text-[rgb(var(--color-muted-foreground))]">
          <p>Click "Start Knockout Stage" to seed the bracket with qualified teams</p>
        </div>
      )}

      {knockoutMatches.length > 0 && (
        <Bracket
          matches={knockoutMatches}
          teams={teams}
          onTeamClick={onTeamClick}
        />
      )}
    </div>
  );
}
