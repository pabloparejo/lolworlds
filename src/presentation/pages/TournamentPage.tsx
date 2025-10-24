import { useTournamentContext } from 'presentation/contexts/TournamentContext';
import { SwissStageHorizontal } from 'presentation/components/swiss/SwissStageHorizontal';

export function TournamentPage() {
  const {
    state,
    isLoading,
    error,
    simulateRound,
    resetTournament,
    setDrawAlgorithm,
    lockMatchResult,
  } = useTournamentContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-[rgb(var(--color-foreground))]">
            Loading tournament...
          </div>
          <div className="text-[rgb(var(--color-muted-foreground))]">
            Preparing teams and stages
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
            Error Loading Tournament
          </div>
          <div className="text-[rgb(var(--color-muted-foreground))] mb-4">
            {error}
          </div>
          <button
            onClick={() => resetTournament()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Tournament
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-[rgb(var(--color-muted-foreground))]">
          No tournament data available
        </div>
      </div>
    );
  }

  const handleTeamClick = () => {};
  const handleVsClick = () => {};
  const handleSelectMatchWinner = (matchId: string, teamId: string) => {
    if (!state) {
      return;
    }

    const match = state.matches.find((m) => m.id === matchId);
    if (!match || match.winnerId) {
      return;
    }

    const currentLockedWinner = state.lockedMatches?.[matchId] ?? null;
    const nextWinner = currentLockedWinner === teamId ? null : teamId;
    lockMatchResult(matchId, nextWinner);
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-3 pb-20 sm:pb-24 sm:px-4">
      <SwissStageHorizontal
        state={state}
        drawAlgorithm={state.drawAlgorithm}
        onDrawAlgorithmChange={setDrawAlgorithm}
        onTeamClick={handleTeamClick}
        onSelectMatchWinner={handleSelectMatchWinner}
        onVsClick={handleVsClick}
        onSimulateRound={simulateRound}
        onResetTournament={() => resetTournament()}
      />
    </div>
  );
}
