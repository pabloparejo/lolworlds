import type { TournamentState } from 'domain/entities/types';
import { StageType } from 'domain/entities/types';
import { RecordBracket } from './RecordBracket';

interface SwissStageProps {
  state: TournamentState;
  onTeamClick?: (teamId: string) => void;
  onVsClick?: (matchId: string) => void;
  onSimulateRound?: () => void;
}

export function SwissStage({ state, onTeamClick, onVsClick, onSimulateRound }: SwissStageProps) {
  const { swissStage, matches, teams } = state;

  // Get Swiss stage matches
  const swissMatches = matches.filter(m => m.stage === StageType.SWISS);

  // Group matches by record bracket
  const matchesByRecord = new Map<string, typeof matches>();

  swissMatches.forEach(match => {
    const record = match.recordBracket || 'Unknown';
    if (!matchesByRecord.has(record)) {
      matchesByRecord.set(record, []);
    }
    matchesByRecord.get(record)!.push(match);
  });

  // Get unique records and sort them
  const records = Array.from(matchesByRecord.keys()).sort();

  const isComplete = swissStage.status === 'COMPLETED';
  const hasStarted = swissStage.status !== 'NOT_STARTED';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-foreground))]">
          Swiss Stage
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[rgb(var(--color-muted-foreground))]">
            Round {swissStage.currentRoundNumber}/5
          </span>
          {onSimulateRound && !isComplete && (
            <button
              onClick={onSimulateRound}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {hasStarted ? 'Simulate Next Round' : 'Start Swiss Stage'}
            </button>
          )}
          {isComplete && (
            <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
              ✓ Complete
            </span>
          )}
        </div>
      </div>

      {swissMatches.length === 0 && !hasStarted && (
        <div className="text-center py-12 text-[rgb(var(--color-muted-foreground))]">
          <p>Click "Start Swiss Stage" to begin the tournament</p>
        </div>
      )}

      {records.map(record => (
        <RecordBracket
          key={record}
          record={record}
          matches={matchesByRecord.get(record) || []}
          teams={teams}
          onTeamClick={onTeamClick}
          onVsClick={onVsClick}
        />
      ))}
    </div>
  );
}
