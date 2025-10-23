import { useTournamentContext } from 'presentation/contexts/TournamentContext';
import { SwissStage } from 'presentation/components/swiss/SwissStage';
import { KnockoutStage } from 'presentation/components/knockout/KnockoutStage';
import { TeamList } from 'presentation/components/shared/TeamList';
import { DrawSelector } from 'presentation/components/shared/DrawSelector';
import { getQualifiedTeams, getEliminatedTeams } from 'domain/entities/Team';

export function TournamentPage() {
  const { state, isLoading, error, simulateRound, resetTournament, setDrawAlgorithm } = useTournamentContext();

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

  const qualifiedTeams = getQualifiedTeams(state.teams);
  const eliminatedTeams = getEliminatedTeams(state.teams);

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col gap-4">
        <DrawSelector
          algorithm={state.drawAlgorithm}
          onChange={setDrawAlgorithm}
          disabled={state.swissStage.status !== 'NOT_STARTED'}
        />

        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => resetTournament()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reset Tournament
          </button>
        </div>
      </div>

      {/* Main Tournament View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Tournament Area */}
        <div className="lg:col-span-3 space-y-8">
          <SwissStage
            state={state}
            onSimulateRound={simulateRound}
          />

          <div className="border-t border-[rgb(var(--color-border))] pt-8">
            <KnockoutStage
              state={state}
              onSimulateRound={simulateRound}
            />
          </div>
        </div>

        {/* Sidebar with Team Lists */}
        <div className="lg:col-span-1 space-y-6">
          <TeamList
            title="Qualified Teams"
            teams={qualifiedTeams}
            emptyMessage="No teams qualified yet"
          />

          <div className="border-t border-[rgb(var(--color-border))] pt-6">
            <TeamList
              title="Eliminated Teams"
              teams={eliminatedTeams}
              emptyMessage="No teams eliminated yet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
