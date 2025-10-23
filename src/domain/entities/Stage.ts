import type { Stage } from './types';
import { StageType, StageStatus } from './types';

/**
 * Create a new Swiss stage
 */
export function createSwissStage(): Stage {
  return {
    type: StageType.SWISS,
    status: StageStatus.NOT_STARTED,
    roundIds: [],
    currentRoundNumber: 0,
  };
}

/**
 * Create a new Knockout stage
 */
export function createKnockoutStage(): Stage {
  return {
    type: StageType.KNOCKOUT,
    status: StageStatus.NOT_STARTED,
    roundIds: [],
    currentRoundNumber: 0,
  };
}

/**
 * Check if a stage is complete
 */
export function isStageComplete(stage: Stage): boolean {
  return stage.status === StageStatus.COMPLETE;
}

/**
 * Start a stage
 */
export function startStage(stage: Stage): Stage {
  return {
    ...stage,
    status: StageStatus.IN_PROGRESS,
  };
}

/**
 * Complete a stage
 */
export function completeStage(stage: Stage): Stage {
  return {
    ...stage,
    status: StageStatus.COMPLETE,
  };
}

/**
 * Add a round to a stage
 */
export function addRoundToStage(stage: Stage, roundId: string): Stage {
  return {
    ...stage,
    roundIds: [...stage.roundIds, roundId],
    currentRoundNumber: stage.currentRoundNumber + 1,
  };
}

/**
 * Check if stage has started
 */
export function hasStageStarted(stage: Stage): boolean {
  return stage.status !== StageStatus.NOT_STARTED;
}

/**
 * Check if stage is in progress
 */
export function isStageInProgress(stage: Stage): boolean {
  return stage.status === StageStatus.IN_PROGRESS;
}
