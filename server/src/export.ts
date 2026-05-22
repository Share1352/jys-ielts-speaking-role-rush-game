import type { RoomState } from './state.js';

export interface ExportRow {
  roomCode: string;
  roundNumber: number;
  phase: string;
  playerId: string;
  playerName: string;
  seat: number;
  score: number;
  roleId: string | null;
  chaosCardId: string | null;
  rerolledRole: boolean;
  rerolledChaos: boolean;
  rerollPenalty: number;
  currentSpeakerId: string | null;
  followUpRequesterIds: string;
  followUpSelectedRequesterId: string | null;
  followUpAwardedRequesterId: string | null;
  guessesCount: number;
  guessScoringJson: string;
  speakerBonusJson: string;
}

export function buildRoomExport(room: RoomState): ExportRow[] {
  return room.roundHistory.concat(room.activeRound ? [room.activeRound] : []).flatMap((round) =>
    room.playerOrder.map((playerId) => {
      const p = room.players[playerId];
      const rp = round.playerRound[playerId];
      const guesses = Object.values(round.guesses).filter((g) => g.guesserPlayerId === playerId);
      return {
        roomCode: room.code,
        roundNumber: round.roundNumber,
        phase: round.phase,
        playerId,
        playerName: p?.displayName ?? '',
        seat: p?.seat ?? -1,
        score: p?.score ?? 0,
        roleId: rp?.roleId ?? null,
        chaosCardId: rp?.chaosCardId ?? null,
        rerolledRole: rp?.rerolledRole ?? false,
        rerolledChaos: rp?.rerolledChaos ?? false,
        rerollPenalty: (rp?.rerollRolePenalty ?? 0) + (rp?.rerollChaosPenalty ?? 0),
        currentSpeakerId: round.currentSpeakerId,
        followUpRequesterIds: round.followUp.requesterIds.join('|'),
        followUpSelectedRequesterId: round.followUp.selectedRequesterId,
        followUpAwardedRequesterId: round.followUp.awardedRequesterId,
        guessesCount: guesses.length,
        guessScoringJson: JSON.stringify(guesses),
        speakerBonusJson: JSON.stringify(round.speakerBonuses[playerId] ?? {})
      };
    })
  );
}

export function toCsv(rows: ExportRow[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]) as Array<keyof ExportRow>;
  const escape = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
}
