import { Server, type Socket } from 'socket.io';
import { randomUUID } from 'node:crypto';
import {
  applyReroll,
  awardFollowUpPoint,
  awardSpeakerBonus,
  createRoom,
  enterScoring,
  finishSpeaking,
  lockPrep,
  nextSpeakerOrRoundComplete,
  requestFollowUp,
  revealGuesses,
  revealSecret,
  scoreGuessForPlayer,
  selectFollowUpRequester,
  selectSpeaker,
  startRound,
  submitGuess
} from './rooms.js';
import { buildTeacherPayload, buildStudentPayload, buildViewerPayload } from './payloads.js';
import { startTimer, pauseTimer, stopTimer, resetTimer } from './timers.js';
import type { RoomState, SpeakerBonusCategory } from './state.js';
import { TOPIC_CATEGORIES } from './data/topicSituations.js';
import { CHAOS_CARDS } from './data/chaosCards.js';

const rooms = new Map<string, RoomState>();

const ROLE_POOL = TOPIC_CATEGORIES.flatMap((topic) => topic.roleCards.map((role) => role.id));
const TOPIC_PROMPTS = TOPIC_CATEGORIES.map((topic) => topic.publicSituation);
const CHAOS_POOL = CHAOS_CARDS.map((card) => card.id);

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickAssignments(playerIds: string[], pool: string[]): Record<string, string> {
  const assignments: Record<string, string> = {};
  const shuffled = shuffle(pool);
  playerIds.forEach((playerId, index) => {
    assignments[playerId] = shuffled[index % shuffled.length];
  });
  return assignments;
}

function ensurePromptsCompliant(prompts: string[]): void {
  for (const prompt of prompts) {
    if (prompt.includes('?')) throw new Error('Public prompts must not include question marks');
    if (/\bdo you think\b|\bshould\b/i.test(prompt)) {
      throw new Error('Public prompts must avoid IELTS-question phrasing');
    }
  }
}

ensurePromptsCompliant(TOPIC_PROMPTS);

function getRoomOrThrow(roomCode: string): RoomState {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) throw new Error('Room not found');
  return room;
}

function emitRoleStates(io: Server, room: RoomState): void {
  io.to(`room:${room.code}:teacher`).emit('room:state', buildTeacherPayload(room, room.hostToken));
  for (const playerId of room.playerOrder) {
    io.to(`room:${room.code}:student:${playerId}`).emit('room:state', buildStudentPayload(room, playerId));
  }
  io.to(`room:${room.code}:viewer`).emit('room:state', buildViewerPayload(room));
}

function requireTeacher(room: RoomState, hostToken: string): void {
  if (room.hostToken !== hostToken) throw new Error('Unauthorized teacher token');
}

function requireStudent(room: RoomState, playerId: string): void {
  if (!room.players[playerId] || room.players[playerId].removed) throw new Error('Unauthorized player');
}

function withAck(ack: ((payload: unknown) => void) | undefined, fn: () => void): void {
  try { fn(); ack?.({ ok: true }); } catch (error) { ack?.({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }); }
}

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.on('room:create', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const code = String(roomCode || '').toUpperCase();
      if (!code) throw new Error('roomCode required');
      if (rooms.has(code)) throw new Error('Room already exists');
      const room = createRoom(code, String(hostToken || randomUUID()));
      rooms.set(code, room);
      socket.join(`room:${code}:teacher`);
      emitRoleStates(io, room);
      ack?.({ ok: true, roomCode: code, hostToken: room.hostToken });
    }));

    socket.on('teacher:connect', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode);
      requireTeacher(room, hostToken);
      socket.join(`room:${room.code}:teacher`);
      socket.emit('room:state', buildTeacherPayload(room, hostToken));
    }));

    socket.on('student:join', ({ roomCode, displayName, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode);
      let id = playerId as string | undefined;
      if (!id || !room.players[id] || room.players[id].removed) {
        id = randomUUID();
        const seat = room.playerOrder.length + 1;
        room.players[id] = { id, displayName: String(displayName || `Student ${seat}`), seat, connected: true, waitingForNextRound: false, removed: false, score: 0 };
        room.playerOrder.push(id);
      } else {
        room.players[id].connected = true;
      }
      socket.join(`room:${room.code}:student:${id}`);
      socket.emit('room:state', buildStudentPayload(room, id));
      emitRoleStates(io, room);
      ack?.({ ok: true, playerId: id });
    }));

    socket.on('viewer:connect', ({ roomCode }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode);
      socket.join(`room:${room.code}:viewer`);
      socket.emit('room:state', buildViewerPayload(room));
    }));

    socket.on('teacher:start_round', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      const eligible = room.playerOrder.filter((id) => !room.players[id].removed && !room.players[id].waitingForNextRound);
      const roleByPlayer = pickAssignments(eligible, ROLE_POOL);
      const chaosByPlayer = pickAssignments(eligible, CHAOS_POOL);
      startRound(room, TOPIC_PROMPTS[Math.floor(Math.random() * TOPIC_PROMPTS.length)], roleByPlayer, chaosByPlayer);
      emitRoleStates(io, room);
    }));

    socket.on('student:reroll_role', ({ roomCode, playerId, roleId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); applyReroll(room, playerId, 'role', roleId); emitRoleStates(io, room);
    }));
    socket.on('student:reroll_chaos', ({ roomCode, playerId, chaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); applyReroll(room, playerId, 'chaos', chaosCardId); emitRoleStates(io, room);
    }));
    socket.on('student:submit_guess', ({ roomCode, playerId, guessedRoleId, guessedChaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); submitGuess(room, playerId, guessedRoleId, guessedChaosCardId); emitRoleStates(io, room);
    }));
    socket.on('student:request_follow_up', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); requestFollowUp(room, playerId); emitRoleStates(io, room);
    }));

    socket.on('teacher:lock_prep', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); lockPrep(room); emitRoleStates(io, room); }));
    socket.on('teacher:select_speaker', ({ roomCode, hostToken, speakerId }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); selectSpeaker(room, speakerId); emitRoleStates(io, room); }));
    socket.on('teacher:speaker_timer', ({ roomCode, hostToken, action }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      if (action === 'start') room.activeRound.speakerTimer = startTimer(room.activeRound.speakerTimer);
      if (action === 'pause') room.activeRound.speakerTimer = pauseTimer(room.activeRound.speakerTimer);
      if (action === 'stop') { room.activeRound.speakerTimer = stopTimer(room.activeRound.speakerTimer); finishSpeaking(room); }
      if (action === 'reset') room.activeRound.speakerTimer = resetTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:reveal_guesses', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); revealGuesses(room); emitRoleStates(io, room); }));
    socket.on('teacher:enter_scoring', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); enterScoring(room); emitRoleStates(io, room); }));
    socket.on('teacher:score_guess', ({ roomCode, hostToken, guesserId, roleResult, chaosResult }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); scoreGuessForPlayer(room, guesserId, roleResult, chaosResult); emitRoleStates(io, room); }));
    socket.on('teacher:bonus', ({ roomCode, hostToken, speakerId, category }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); awardSpeakerBonus(room, speakerId, category as SpeakerBonusCategory); emitRoleStates(io, room); }));
    socket.on('teacher:select_follow_up', ({ roomCode, hostToken, playerId }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); selectFollowUpRequester(room, playerId); emitRoleStates(io, room); }));
    socket.on('teacher:award_follow_up', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); awardFollowUpPoint(room); emitRoleStates(io, room); }));
    socket.on('teacher:reveal_secret', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); revealSecret(room); emitRoleStates(io, room); }));
    socket.on('teacher:next_speaker', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); nextSpeakerOrRoundComplete(room); emitRoleStates(io, room); }));
  });
}
