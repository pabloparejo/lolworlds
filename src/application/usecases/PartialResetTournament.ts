import type { TournamentState, Match, Round, MatchHistory } from 'domain/entities/types';
import { StageStatus, StageType, TeamStatus } from 'domain/entities/types';
import { updateTournamentState } from 'domain/entities/TournamentState';
import { updateTeamRecord } from 'domain/entities/Team';
import { createKnockoutStage } from 'domain/entities/Stage';
import type { RoundSource } from 'domain/entities/RoundDefinition';

type AnchorRound = {
  roundId: string;
  roundNumber: number;
};

export class PartialResetTournament {
  execute(state: TournamentState): TournamentState {
    const anchor = this.findAnchorRound(state);

    if (!anchor) {
      throw new Error('Partial reset is unavailable without any manual or baseline rounds');
    }

    const keptRoundIds = this.getRoundIdsUpTo(state, anchor.roundNumber);
    if (keptRoundIds.length === 0) {
      throw new Error('Partial reset failed: no rounds available to retain');
    }

    const keptRounds = state.rounds.filter(round => keptRoundIds.includes(round.id));
    const keptMatches = this.buildKeptMatches(state, keptRounds, anchor.roundId);
    const { teams, matchHistory } = this.rebuildTeams(state, keptMatches);

    const roundMetadata = this.buildRoundMetadata(state, keptRoundIds, anchor.roundId);
    const swissStage = this.buildSwissStage(state, keptRoundIds, anchor.roundNumber);

    return updateTournamentState(state, {
      teams,
      matches: keptMatches,
      rounds: keptRounds,
      matchHistory,
      roundMetadata,
      lockedMatches: {},
      swissStage,
      knockoutStage: createKnockoutStage(),
      knockoutBracket: null,
    });
  }

  private findAnchorRound(state: TournamentState): AnchorRound | null {
    const swissRounds = state.swissStage.roundIds
      .map(roundId => state.rounds.find(round => round.id === roundId))
      .filter((round): round is Round => Boolean(round));

    let anchor: AnchorRound | null = null;

    swissRounds.forEach(round => {
      const source = state.roundMetadata?.[round.id]?.source ?? 'simulated';
      if (source === 'manual' || source === 'baseline-json') {
        if (!anchor || round.roundNumber > anchor.roundNumber) {
          anchor = { roundId: round.id, roundNumber: round.roundNumber };
        }
      }
    });

    return anchor;
  }

  private getRoundIdsUpTo(state: TournamentState, roundNumber: number): string[] {
    return state.swissStage.roundIds.filter(roundId => {
      const round = state.rounds.find(r => r.id === roundId);
      return round ? round.roundNumber <= roundNumber : false;
    });
  }

  private buildKeptMatches(state: TournamentState, keptRounds: Round[], manualRoundId: string): Match[] {
    const keptIds = new Set<string>();
    keptRounds.forEach(round => {
      round.matchIds.forEach(matchId => keptIds.add(matchId));
    });

    const manualRound = keptRounds.find(round => round.id === manualRoundId);
    const manualMatchIds = new Set(manualRound?.matchIds ?? []);

    const keptMatches = state.matches
      .filter(match => match.stage === StageType.SWISS && keptIds.has(match.id))
      .map(match => {
        if (manualMatchIds.has(match.id)) {
          return { ...match, winnerId: null, locked: false };
        }
        return match;
      })
      .sort((a, b) => a.roundNumber - b.roundNumber);

    return keptMatches;
  }

  private rebuildTeams(state: TournamentState, matches: Match[]): {
    teams: TournamentState['teams'];
    matchHistory: MatchHistory[];
  } {
    const teamMap = new Map(
      state.teams.map(team => [
        team.id,
        {
          ...team,
          wins: 0,
          losses: 0,
          status: TeamStatus.ACTIVE,
        },
      ])
    );

    const history: MatchHistory[] = [];

    matches.forEach(match => {
      if (!match.winnerId) {
        return;
      }

      const winnerId = match.winnerId;
      const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;

      const winner = teamMap.get(winnerId);
      const loser = teamMap.get(loserId);

      if (winner && loser) {
        teamMap.set(winnerId, updateTeamRecord(winner, true));
        teamMap.set(loserId, updateTeamRecord(loser, false));
      }

      history.push({ team1Id: match.team1Id, team2Id: match.team2Id });
    });

    const teams = state.teams.map(team => teamMap.get(team.id) ?? team);
    return { teams, matchHistory: history };
  }

  private buildRoundMetadata(
    state: TournamentState,
    keptRoundIds: string[],
    manualRoundId: string
  ): TournamentState['roundMetadata'] {
    const metadataEntries = Object.entries(state.roundMetadata ?? {}).filter(([roundId]) =>
      keptRoundIds.includes(roundId)
    );

    return metadataEntries.reduce<Record<string, { source: RoundSource; lockedMatchIds?: string[] }>>(
      (acc, [roundId, metadata]) => {
        if (!metadata) {
          return acc;
        }
        acc[roundId] =
          roundId === manualRoundId
            ? { ...metadata, lockedMatchIds: [] }
            : metadata;
        return acc;
      },
      {}
    );
  }

  private buildSwissStage(
    state: TournamentState,
    keptRoundIds: string[],
    anchorRoundNumber: number
  ): TournamentState['swissStage'] {
    const hasRounds = keptRoundIds.length > 0;
    return {
      ...state.swissStage,
      status: hasRounds ? StageStatus.IN_PROGRESS : StageStatus.NOT_STARTED,
      roundIds: keptRoundIds,
      currentRoundNumber: hasRounds ? anchorRoundNumber : 0,
    };
  }
}
