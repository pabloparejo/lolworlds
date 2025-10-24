import React, { useMemo } from 'react';
import { DrawAlgorithm, StageStatus } from 'domain/entities/types';
import { DrawSelector } from 'presentation/components/shared/DrawSelector';

interface SwissControlBarProps {
  stageStatus: StageStatus;
  currentRound: number;
  maxRounds: number;
  canSimulateRound: boolean;
  advanceMode: boolean;
  onSimulateRound: () => void;
  onReset: () => void;
  drawAlgorithm: DrawAlgorithm;
  onDrawAlgorithmChange: (algorithm: DrawAlgorithm) => void;
  canChangeWinningChances: boolean;
}

export const SwissControlBar: React.FC<SwissControlBarProps> = ({
  canSimulateRound,
  currentRound,
  drawAlgorithm,
  maxRounds,
  advanceMode,
  onDrawAlgorithmChange,
  onReset,
  onSimulateRound,
  stageStatus,
  canChangeWinningChances,
}) => {
  const isComplete = stageStatus === StageStatus.COMPLETED;
  const canAdjustChances = canChangeWinningChances && !isComplete;
  const simulateLabel = advanceMode
    ? 'Advance Round'
    : stageStatus === StageStatus.NOT_STARTED
      ? 'Start Swiss Stage'
      : 'Simulate Next Round';

  const statusMeta = useMemo(() => {
    switch (stageStatus) {
      case StageStatus.NOT_STARTED:
        return {
          label: 'Not started',
          indicatorClass: 'bg-[rgb(var(--color-warning))]',
        };
      case StageStatus.IN_PROGRESS:
        return {
          label: 'In progress',
          indicatorClass: 'bg-[rgb(var(--color-primary))]',
        };
      case StageStatus.COMPLETED:
        return {
          label: 'Complete',
          indicatorClass: 'bg-[rgb(var(--color-success))]',
        };
      default:
        return {
          label: 'Unknown',
          indicatorClass: 'bg-[rgb(var(--color-muted-foreground))]',
        };
    }
  }, [stageStatus]);

  const displayRound = Math.max(currentRound, 0);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 w-full border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] backdrop-blur supports-[backdrop-filter]:bg-[rgba(var(--color-background),0.85)]">
      <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--color-muted-foreground))]">
            Swiss Stage
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-semibold text-[rgb(var(--color-foreground))]">
              Round {displayRound}/{maxRounds}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-muted-foreground))]">
              <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.indicatorClass}`} aria-hidden="true" />
              <span>{statusMeta.label}</span>
            </span>
          </div>
        </div>
        <DrawSelector
          algorithm={drawAlgorithm}
          onChange={onDrawAlgorithmChange}
          disabled={!canAdjustChances}
        />

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={onSimulateRound}
            disabled={isComplete || !canSimulateRound}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary-foreground))] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isComplete ? 'Swiss Complete' : simulateLabel}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center rounded-lg border border-[rgb(var(--color-border))] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-danger))] transition-colors hover:bg-[rgba(var(--color-danger),0.1)] sm:w-auto"
          >
            Reset Tournament
          </button>
        </div>
      </div>
    </div>
  );
};

SwissControlBar.displayName = 'SwissControlBar';
