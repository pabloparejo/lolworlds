import type { TournamentState } from 'domain/entities/types';
import { StageType } from 'domain/entities/types';
import { updateTournamentState } from 'domain/entities/TournamentState';

interface LockMatchResultParams {
  matchId: string;
  winnerId: string | null;
  state: TournamentState;
}

export class LockMatchResult {
  execute({ matchId, winnerId, state }: LockMatchResultParams): TournamentState {
    const match = state.matches.find((m) => m.id === matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.stage !== StageType.SWISS) {
      throw new Error('Only Swiss stage matches can be locked');
    }

    if (match.winnerId) {
      throw new Error('Cannot lock a match that already has a winner');
    }

    if (winnerId && winnerId !== match.team1Id && winnerId !== match.team2Id) {
      throw new Error('Winner must be one of the match participants');
    }

    const lockedMatches = { ...(state.lockedMatches ?? {}) };
    const matches = state.matches.map((current) =>
      current.id === matchId ? { ...current, locked: Boolean(winnerId) } : current
    );

    if (winnerId) {
      lockedMatches[matchId] = winnerId;
    } else {
      delete lockedMatches[matchId];
    }

    const round = state.rounds.find((r) => r.matchIds.includes(matchId));
    const roundMetadata = { ...(state.roundMetadata ?? {}) };

    if (round) {
      const metadata = roundMetadata[round.id] ?? { source: 'simulated' as const, lockedMatchIds: [] };
      const lockedSet = new Set(metadata.lockedMatchIds ?? []);

      if (winnerId) {
        lockedSet.add(matchId);
      } else {
        lockedSet.delete(matchId);
      }

      roundMetadata[round.id] = {
        ...metadata,
        lockedMatchIds: Array.from(lockedSet),
      };
    }

    return updateTournamentState(state, {
      matches,
      lockedMatches,
      roundMetadata,
    });
  }
}
