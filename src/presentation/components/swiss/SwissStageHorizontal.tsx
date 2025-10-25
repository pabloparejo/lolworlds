import React, { useMemo } from 'react';
import type { TournamentState } from 'domain/entities/types';
import { StageStatus, StageType, DrawAlgorithm } from 'domain/entities/types';
import { RoundColumn } from './RoundColumn';
import { ResultsSection } from './ResultsSection';
import { SwissControlBar } from './SwissControlBar';
import { KnockoutStage } from '../knockout/KnockoutStage';
import type { SwissMatchWithTeams } from './types';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { shouldDisplayRound } from '../../utils/recordGroupingUtils';

const SWISS_MAX_ROUNDS = 5;

interface SwissStageHorizontalProps {
  state: TournamentState;
  drawAlgorithm: DrawAlgorithm;
  onDrawAlgorithmChange: (algorithm: DrawAlgorithm) => void;
  onTeamClick: (teamId: string) => void;
  onSelectMatchWinner: (matchId: string, teamId: string) => void;
  onVsClick: (matchId: string) => void;
  onSimulateRound: () => void;
  onResetTournament: () => void;
  onPartialReset: () => void;
}

export const SwissStageHorizontal: React.FC<SwissStageHorizontalProps> = ({
  state,
  drawAlgorithm,
  onDrawAlgorithmChange,
  onTeamClick,
  onSelectMatchWinner,
  onVsClick,
  onSimulateRound,
  onResetTournament,
  onPartialReset,
}) => {
  const stageStatus = state.swissStage.status;
  const currentRound = state.swissStage.currentRoundNumber ?? 0;

  const { scrollRef } = useHorizontalScroll();

  useAutoScroll({
    scrollRef,
    currentRound,
    enabled: stageStatus === StageStatus.IN_PROGRESS
  });

  const swissMatches = useMemo(
    () => state.matches.filter(match => match.stage === StageType.SWISS),
    [state.matches]
  );

  const teamMap = useMemo(
    () => new Map(state.teams.map(team => [team.id, team])),
    [state.teams]
  );

  const lockedMatches = state.lockedMatches ?? {};

  const currentRoundMatches = useMemo(
    () => swissMatches.filter(match => match.roundNumber === currentRound),
    [swissMatches, currentRound]
  );

  const pendingMatches = currentRoundMatches.filter(match => match.winnerId === null);
  const hasPendingMatches = pendingMatches.length > 0;
  const allPendingLocked =
    stageStatus === StageStatus.IN_PROGRESS &&
    hasPendingMatches &&
    pendingMatches.every(match => Boolean(lockedMatches[match.id]));

  const canSimulateRound = hasPendingMatches;
  const advanceMode = allPendingLocked;
  const canChangeWinningChances = state.matchHistory.length === 0;

  const canPartialReset = useMemo(() => {
    const swissRounds = state.swissStage.roundIds
      .map(roundId => state.rounds.find(round => round.id === roundId))
      .filter((round): round is typeof state.rounds[number] => Boolean(round));

    return swissRounds.some(round => {
      const source = state.roundMetadata?.[round.id]?.source ?? 'simulated';
      return source === 'manual' || source === 'baseline-json';
    });
  }, [state.swissStage.roundIds, state.rounds, state.roundMetadata]);

  const getTeamsByRecordFromSnapshot = (
    record: string,
    snapshot?: Map<string, { wins: number; losses: number }>
  ) => {
    if (!snapshot) {
      return [] as Array<{ team: typeof state.teams[number]; record: string }>;
    }
    const [winsTarget, lossesTarget] = record.split('-').map(Number);
    return state.teams
      .map(team => {
        const entry = snapshot.get(team.id);
        if (!entry) {
          return null;
        }
        if (entry.wins === winsTarget && entry.losses === lossesTarget) {
          return { team, record };
        }
        return null;
      })
      .filter((value): value is { team: typeof state.teams[number]; record: string } => value !== null)
      .sort((a, b) => a.team.name.localeCompare(b.team.name));
  };

  const { rounds, recordSnapshots } = useMemo(() => {
    if (currentRound === 0) {
      return { rounds: [] as Array<{ roundNumber: number; matches: SwissMatchWithTeams[] }>, recordSnapshots: new Map<number, Map<string, { wins: number; losses: number }>>() };
    }

    const roundNumbers = Array.from({ length: currentRound }, (_, i) => i + 1).filter(roundNumber => shouldDisplayRound(roundNumber, currentRound));
    const runningRecords = new Map<string, { wins: number; losses: number }>();
    state.teams.forEach(team => {
      runningRecords.set(team.id, { wins: 0, losses: 0 });
    });

    const cloneRecords = () => {
      const snapshot = new Map<string, { wins: number; losses: number }>();
      runningRecords.forEach((value, key) => {
        snapshot.set(key, { wins: value.wins, losses: value.losses });
      });
      return snapshot;
    };

    const recordSnapshots = new Map<number, Map<string, { wins: number; losses: number }>>();
    recordSnapshots.set(0, cloneRecords());

    const rounds = roundNumbers
      .map(roundNumber => {
        const matchesForRoundRaw = swissMatches.filter(match => match.roundNumber === roundNumber);

        const matchesForRound = matchesForRoundRaw
          .map((match): SwissMatchWithTeams | null => {
            const team1 = teamMap.get(match.team1Id);
            const team2 = teamMap.get(match.team2Id);

            if (!team1 || !team2) {
              return null;
            }

            return {
              ...match,
              team1,
              team2,
              lockedWinnerId: lockedMatches[match.id] ?? null,
            };
          })
          .filter((match): match is SwissMatchWithTeams => match !== null);

        matchesForRoundRaw.forEach(match => {
          if (!match.winnerId) {
            return;
          }

          const winnerRecord = runningRecords.get(match.winnerId);
          if (winnerRecord) {
            winnerRecord.wins += 1;
          }

          const loserId = match.team1Id === match.winnerId ? match.team2Id : match.team1Id;
          const loserRecord = runningRecords.get(loserId);
          if (loserRecord) {
            loserRecord.losses += 1;
          }
        });

        recordSnapshots.set(roundNumber, cloneRecords());

        return { roundNumber, matches: matchesForRound };
      })
      .filter(({ matches }) => matches.length > 0);

    return { rounds, recordSnapshots };
  }, [currentRound, swissMatches, teamMap, lockedMatches, state.teams]);

  const finalSnapshot = recordSnapshots.get(SWISS_MAX_ROUNDS);
  const qualifiedRecordOrder = ['3-0', '3-1', '3-2'] as const;
  const finalQualifiedGroups = qualifiedRecordOrder.map(recordValue => {
    const teamsForRecord = getTeamsByRecordFromSnapshot(recordValue, finalSnapshot).map(({ team }) => team);
    return { record: recordValue, teams: teamsForRecord };
  });

  const eliminatedRecordOrder = ['0-3', '1-3', '2-3'] as const;
  const finalEliminatedGroups = eliminatedRecordOrder.map(recordValue => {
    const teamsForRecord = getTeamsByRecordFromSnapshot(recordValue, finalSnapshot).map(({ team }) => team);
    return { record: recordValue, teams: teamsForRecord };
  });

  const qualifiedCount = finalQualifiedGroups.reduce((sum, group) => sum + group.teams.length, 0);
  const eliminatedCount = finalEliminatedGroups.reduce((sum, group) => sum + group.teams.length, 0);
  const shouldShowResults = stageStatus === StageStatus.COMPLETED && (qualifiedCount > 0 || eliminatedCount > 0);
  const shouldShowKnockout = stageStatus === StageStatus.COMPLETED;

  const summaryConfig: Record<number, { top: { label: string; record: string }; bottom: { label: string; record: string } }> = {
    4: {
      top: { label: 'Qualified (3-0)', record: '3-0' },
      bottom: { label: 'Eliminated (0-3)', record: '0-3' },
    },
    5: {
      top: { label: 'Qualified (3-1)', record: '3-1' },
      bottom: { label: 'Eliminated (1-3)', record: '1-3' },
    },
  };

  const enrichedRounds = rounds.map(({ roundNumber, matches }) => {
    const summary = summaryConfig[roundNumber];
    let topSummary: { title: string; teams: Array<{ team: typeof state.teams[number]; record: string }> } | undefined;
    let bottomSummary: { title: string; teams: Array<{ team: typeof state.teams[number]; record: string }> } | undefined;

    if (summary) {
      const snapshot = recordSnapshots.get(Math.max(roundNumber - 1, 0));
      const topTeams = getTeamsByRecordFromSnapshot(summary.top.record, snapshot);
      const bottomTeams = getTeamsByRecordFromSnapshot(summary.bottom.record, snapshot);

      topSummary = { title: summary.top.label, teams: topTeams };
      bottomSummary = { title: summary.bottom.label, teams: bottomTeams };
    }

    return { roundNumber, matches, topSummary, bottomSummary };
  });

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex-1 overflow-hidden pb-24 pt-1 sm:pb-28">
        <div
          ref={scrollRef}
          className="flex min-h-full items-stretch overflow-x-auto scroll-smooth px-3 pb-6 sm:px-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {rounds.length === 0 && (
            <div className="flex h-full flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--color-border))] px-6 py-8 text-sm text-[rgb(var(--color-muted-foreground))]">
              Swiss stage has not started. Choose a draw algorithm and start the stage to see the first matches.
            </div>
          )}

          {enrichedRounds.map(({ roundNumber, matches, topSummary, bottomSummary }) => (
            <RoundColumn
              bottomSummary={bottomSummary}
              key={roundNumber}
              matches={matches}
              onSelectWinner={onSelectMatchWinner}
              onTeamClick={onTeamClick}
              onVsClick={onVsClick}
              roundNumber={roundNumber}
              topSummary={topSummary}
            />
          ))}

          {shouldShowResults && (
            <ResultsSection
              qualifiedGroups={finalQualifiedGroups}
              eliminatedGroups={finalEliminatedGroups}
              qualifiedTitle="Qualified Teams (3 Wins)"
              eliminatedTitle="Eliminated Teams"
              onTeamClick={onTeamClick}
            />
          )}

          {shouldShowKnockout && (
            <div className="flex-shrink-0 min-w-[560px] px-3 py-4">
              <KnockoutStage
                state={state}
                onTeamClick={onTeamClick}
                onSimulateRound={onSimulateRound}
              />
            </div>
          )}
        </div>
      </div>

      <SwissControlBar
        stageStatus={stageStatus}
        currentRound={currentRound}
        maxRounds={SWISS_MAX_ROUNDS}
        canSimulateRound={canSimulateRound}
        advanceMode={advanceMode}
        canChangeWinningChances={canChangeWinningChances}
        onSimulateRound={onSimulateRound}
        onFullReset={onResetTournament}
        onPartialReset={onPartialReset}
        canPartialReset={canPartialReset}
        drawAlgorithm={drawAlgorithm}
        onDrawAlgorithmChange={onDrawAlgorithmChange}
      />
    </div>
  );
};

SwissStageHorizontal.displayName = 'SwissStageHorizontal';
