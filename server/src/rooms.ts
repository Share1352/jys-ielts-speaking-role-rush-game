import type { GuessResult, GuessSubmission, PlayerRoundState, RoomPhase, RoomState, RoundState, SpeakerBonusCategory } from './state.js';
import { createTimer, stopTimer } from './timers.js';

const PREP_DURATION = 90;
const SPEAKER_DURATION = 90;
const FOLLOW_UP_DURATION = 30;

const canTransition: Record<RoomPhase, RoomPhase[]> = {
  lobby: ['round_setup'],
  round_setup: ['prep'],
  prep: ['ready_to_speak'],
  ready_to_speak: ['speaker_selection'],
  speaker_selection: ['speaking'],
  speaking: ['speaker_finished'],
  speaker_finished: ['guesses_revealed'],
  guesses_revealed: ['scoring'],
  scoring: ['secret_revealed'],
  secret_revealed: ['ready_to_speak', 'round_complete'],
  round_complete: ['round_setup', 'lobby']
};

export function createRoom(code: string, hostToken: string): RoomState {
  const now = Date.now();
  return { code, hostToken, phase: 'lobby', locked: false, createdAtEpochMs: now, lastActivityEpochMs: now, players: {}, playerOrder: [], activeRound: null, roundHistory: [] };
}

export function transitionPhase(room: RoomState, next: RoomPhase): void {
  const current = room.phase;
  if (!canTransition[current].includes(next)) throw new Error(`Invalid phase transition ${current} -> ${next}`);
  room.phase = next;
  if (room.activeRound) room.activeRound.phase = next;
  if (current === 'speaking' && next === 'speaker_finished' && room.activeRound) {
    room.activeRound.speakerTimer = stopTimer(room.activeRound.speakerTimer);
    lockGuessing(room.activeRound);
  }
}

export function startRound(room: RoomState, topicPrompt: string, roleByPlayer: Record<string, string>, chaosByPlayer: Record<string, string>): RoundState {
  transitionPhase(room, 'round_setup');
  const playerRound: Record<string, PlayerRoundState> = {};
  const eligible = room.playerOrder.filter((id) => room.players[id] && !room.players[id].removed && !room.players[id].waitingForNextRound);
  for (const id of eligible) {
    playerRound[id] = { roleId: roleByPlayer[id] ?? null, chaosCardId: chaosByPlayer[id] ?? null, rerolledRole: false, rerolledChaos: false, rerollRolePenalty: 0, rerollChaosPenalty: 0, hasSpoken: false };
  }
  const round: RoundState = {
    roundNumber: room.roundHistory.length + 1,
    phase: 'round_setup', topicPrompt, playerRound,
    speakersRemaining: [...eligible], currentSpeakerId: null,
    prepTimer: createTimer('prep', PREP_DURATION), speakerTimer: createTimer('speaker', SPEAKER_DURATION), followUpTimer: createTimer('follow_up', FOLLOW_UP_DURATION),
    guesses: {}, revealGuesses: false, revealSecret: false,
    followUp: { requesterIds: [], selectedRequesterId: null, awardedRequesterId: null, locked: false },
    speakerBonuses: {}
  };
  room.activeRound = round;
  transitionPhase(room, 'prep');
  return round;
}

export function applyReroll(room: RoomState, playerId: string, type: 'role'|'chaos', newValue: string): void {
  const round = mustRound(room);
  if (room.phase !== 'prep') throw new Error('Rerolls are only allowed during prep');
  const p = round.playerRound[playerId];
  if (!p) throw new Error('Player not in current round');
  if (type === 'role') {
    if (p.rerolledRole) throw new Error('Role reroll already used');
    if (hasAlternativeUniqueValue(round, playerId, 'role') && Object.values(round.playerRound).some((other) => other !== p && other.roleId === newValue)) throw new Error('Role must be unique when possible');
    p.roleId = newValue; p.rerolledRole = true; p.rerollRolePenalty = -1;
  } else {
    if (p.rerolledChaos) throw new Error('Chaos reroll already used');
    if (hasAlternativeUniqueValue(round, playerId, 'chaos') && Object.values(round.playerRound).some((other) => other !== p && other.chaosCardId === newValue)) throw new Error('Chaos card must be unique when possible');
    p.chaosCardId = newValue; p.rerolledChaos = true; p.rerollChaosPenalty = -1;
  }
  room.players[playerId].score += -1;
}


function hasAlternativeUniqueValue(round: RoundState, playerId: string, type: 'role'|'chaos'): boolean {
  const values = Object.entries(round.playerRound)
    .filter(([id]) => id !== playerId)
    .map(([, state]) => (type === 'role' ? state.roleId : state.chaosCardId))
    .filter((value): value is string => Boolean(value));
  const own = type === 'role' ? round.playerRound[playerId]?.roleId : round.playerRound[playerId]?.chaosCardId;
  return !own || values.includes(own);
}

export function lockPrep(room: RoomState): void { if (room.phase === 'prep') transitionPhase(room, 'ready_to_speak'); }

export function selectSpeaker(room: RoomState, speakerId: string): void {
  const round = mustRound(room);
  if (room.phase !== 'ready_to_speak' && room.phase !== 'speaker_selection') throw new Error('Not ready for speaker selection');
  if (!round.speakersRemaining.includes(speakerId)) throw new Error('Speaker already used or ineligible');
  if (room.phase === 'ready_to_speak') transitionPhase(room, 'speaker_selection');
  round.currentSpeakerId = speakerId;
  transitionPhase(room, 'speaking');
}

export function submitGuess(room: RoomState, guesserId: string, guessedRoleId: string, guessedChaosCardId: string): void {
  const round = mustRound(room);
  if (room.phase !== 'speaking' || !round.speakerTimer.running) throw new Error('Guessing is locked');
  if (!round.currentSpeakerId || guesserId === round.currentSpeakerId) throw new Error('Current speaker cannot guess');
  const key = `${guesserId}:${round.currentSpeakerId}`;
  const now = Date.now();
  const prior = round.guesses[key];
  const payload: GuessSubmission = {
    guesserPlayerId: guesserId, targetSpeakerId: round.currentSpeakerId, guessedRoleId, guessedChaosCardId,
    submittedAtEpochMs: prior?.submittedAtEpochMs ?? now, updatedAtEpochMs: now, locked: false
  };
  round.guesses[key] = payload;
}

export function requestFollowUp(room: RoomState, requesterId: string): void {
  const round = mustRound(room);
  if (room.phase !== 'speaking' || !round.speakerTimer.running || round.followUp.locked) throw new Error('Follow-up requests are locked');
  if (!round.followUp.requesterIds.includes(requesterId)) round.followUp.requesterIds.push(requesterId);
}

export function finishSpeaking(room: RoomState): void {
  const round = mustRound(room);
  transitionPhase(room, 'speaker_finished');
  round.followUp.locked = true;
}

export function selectFollowUpRequester(room: RoomState, playerId: string): void {
  const round = mustRound(room);
  if (room.phase !== 'speaker_finished') throw new Error('Follow-up selection only after speaking');
  if (!round.followUp.requesterIds.includes(playerId)) throw new Error('Player did not request follow-up');
  round.followUp.selectedRequesterId = playerId;
}

export function awardFollowUpPoint(room: RoomState): void {
  const round = mustRound(room);
  const selected = round.followUp.selectedRequesterId;
  if (!selected) throw new Error('No selected follow-up requester');
  if (round.followUp.awardedRequesterId) throw new Error('Already awarded');
  round.followUp.awardedRequesterId = selected;
  room.players[selected].score += 1;
}

export function revealGuesses(room: RoomState): void { transitionPhase(room, 'guesses_revealed'); mustRound(room).revealGuesses = true; }
export function enterScoring(room: RoomState): void { transitionPhase(room, 'scoring'); }

export function scoreGuessForPlayer(room: RoomState, guesserId: string, roleResult: GuessResult, chaosResult: GuessResult): void {
  const round = mustRound(room);
  if (!round.currentSpeakerId) throw new Error('No current speaker');
  const key = `${guesserId}:${round.currentSpeakerId}`;
  const guess = round.guesses[key];
  if (!guess) throw new Error('Guess not found');
  guess.roleResult = roleResult; guess.chaosResult = chaosResult;
  const pts = (roleResult === 'exact' ? 2 : roleResult === 'partial' ? 1 : 0) + (chaosResult === 'exact' ? 2 : chaosResult === 'partial' ? 1 : 0);
  guess.awardedPoints = pts; room.players[guesserId].score += pts;
}

export function awardSpeakerBonus(room: RoomState, speakerId: string, category: SpeakerBonusCategory): void {
  const round = mustRound(room);
  if (!round.speakerBonuses[speakerId]) round.speakerBonuses[speakerId] = {};
  if (!round.speakerBonuses[speakerId][category]) {
    round.speakerBonuses[speakerId][category] = true;
    room.players[speakerId].score += 1;
  }
}

export function revealSecret(room: RoomState): void { transitionPhase(room, 'secret_revealed'); mustRound(room).revealSecret = true; }

export function nextSpeakerOrRoundComplete(room: RoomState): void {
  const round = mustRound(room);
  const current = round.currentSpeakerId;
  if (current && round.playerRound[current]) round.playerRound[current].hasSpoken = true;
  round.speakersRemaining = round.speakersRemaining.filter((id) => id !== current);
  round.currentSpeakerId = null;
  round.guesses = {};
  round.followUp = { requesterIds: [], selectedRequesterId: null, awardedRequesterId: null, locked: false };
  round.revealGuesses = false;
  round.revealSecret = false;
  if (round.speakersRemaining.length === 0) {
    transitionPhase(room, 'round_complete');
    room.roundHistory.push(round);
    room.activeRound = null;
  } else {
    transitionPhase(room, 'ready_to_speak');
  }
}

function lockGuessing(round: RoundState): void { Object.values(round.guesses).forEach((g) => (g.locked = true)); }
function mustRound(room: RoomState): RoundState { if (!room.activeRound) throw new Error('No active round'); return room.activeRound; }
