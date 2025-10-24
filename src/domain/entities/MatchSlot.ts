export interface MatchSlot {
  id: string;
  teamAId: string;
  teamBId: string;
  recordBracket: string;
  winnerId: string | null;
  isLocked: boolean;
  wasManuallySet: boolean;
}

export function createMatchSlot(params: {
  id: string;
  teamAId: string;
  teamBId: string;
  recordBracket: string;
  winnerId?: string | null;
  isLocked?: boolean;
  wasManuallySet?: boolean;
}): MatchSlot {
  return {
    id: params.id,
    teamAId: params.teamAId,
    teamBId: params.teamBId,
    recordBracket: params.recordBracket,
    winnerId: params.winnerId ?? null,
    isLocked: params.isLocked ?? false,
    wasManuallySet: params.wasManuallySet ?? false,
  };
}
