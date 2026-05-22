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
import { buildRoomExport, toCsv } from './export.js';

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

    socket.on('teacher:startRound', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      const eligible = room.playerOrder.filter((id) => !room.players[id].removed && !room.players[id].waitingForNextRound);
      const roleByPlayer = pickAssignments(eligible, ROLE_POOL);
      const chaosByPlayer = pickAssignments(eligible, CHAOS_POOL);
      startRound(room, TOPIC_PROMPTS[Math.floor(Math.random() * TOPIC_PROMPTS.length)], roleByPlayer, chaosByPlayer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:startPrep', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); emitRoleStates(io, room);
    }));

    socket.on('student:reconnect', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId);
      room.players[playerId].connected = true;
      socket.join(`room:${room.code}:student:${playerId}`);
      socket.emit('room:state', buildStudentPayload(room, playerId));
      emitRoleStates(io, room);
    }));
    socket.on('student:rerollRole', ({ roomCode, playerId, roleId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); applyReroll(room, playerId, 'role', roleId); emitRoleStates(io, room);
    }));
    socket.on('student:rerollChaos', ({ roomCode, playerId, chaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); applyReroll(room, playerId, 'chaos', chaosCardId); emitRoleStates(io, room);
    }));
    socket.on('student:submitGuess', ({ roomCode, playerId, guessedRoleId, guessedChaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); submitGuess(room, playerId, guessedRoleId, guessedChaosCardId); emitRoleStates(io, room);
    }));
    socket.on('student:requestFollowUp', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); requestFollowUp(room, playerId); emitRoleStates(io, room);
    }));
    socket.on('student:cancelFollowUpRequest', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId);
      const round = room.activeRound;
      if (!round) throw new Error('No active round');
      round.followUp.requesterIds = round.followUp.requesterIds.filter((id) => id !== playerId);
      if (round.followUp.selectedRequesterId === playerId) round.followUp.selectedRequesterId = null;
      emitRoleStates(io, room);
    }));

    socket.on('teacher:spinSpeaker', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      const round = room.activeRound;
      if (!round || round.speakersRemaining.length === 0) throw new Error('No eligible speakers');
      const speakerId = round.speakersRemaining[Math.floor(Math.random() * round.speakersRemaining.length)];
      selectSpeaker(room, speakerId);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:startSpeakerTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      room.activeRound.speakerTimer = startTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:pauseTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      room.activeRound.speakerTimer = pauseTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:stopTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      room.activeRound.speakerTimer = stopTimer(room.activeRound.speakerTimer); finishSpeaking(room);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:resetTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      room.activeRound.speakerTimer = resetTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:scoreGuess', ({ roomCode, hostToken, guesserId, roleResult, chaosResult }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); scoreGuessForPlayer(room, guesserId, roleResult, chaosResult); emitRoleStates(io, room); }));
    socket.on('teacher:setSpeakerBonus', ({ roomCode, hostToken, speakerId, category }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); awardSpeakerBonus(room, speakerId, category as SpeakerBonusCategory); emitRoleStates(io, room); }));
    socket.on('teacher:spinFollowUpWheel', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      const requesterIds = room.activeRound?.followUp.requesterIds ?? [];
      if (requesterIds.length === 0) throw new Error('No follow-up requesters');
      selectFollowUpRequester(room, requesterIds[Math.floor(Math.random() * requesterIds.length)]);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:awardFollowUpPoint', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); awardFollowUpPoint(room); emitRoleStates(io, room); }));
    socket.on('teacher:endRound', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); nextSpeakerOrRoundComplete(room); emitRoleStates(io, room); }));
    socket.on('teacher:resetGame', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      room.activeRound = null; room.roundHistory = []; room.phase = 'lobby';
      Object.values(room.players).forEach((p) => { p.score = 0; });
      emitRoleStates(io, room);
    }));
    socket.on('teacher:exportResults', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      const results = room.playerOrder.map((id) => room.players[id]).filter(Boolean).map((p) => ({ id: p.id, displayName: p.displayName, seat: p.seat, score: p.score }));
      ack?.({ ok: true, roomCode: room.code, results });
    }));
    socket.on('teacher:export', ({ roomCode, hostToken, format }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      const rows = buildRoomExport(room);
      if (format === 'json') {
        ack?.({ ok: true, roomCode: room.code, format: 'json', content: JSON.stringify(rows, null, 2) });
        return;
      }
      ack?.({ ok: true, roomCode: room.code, format: 'csv', content: toCsv(rows) });
    }));
    socket.on('teacher:revealGuesses', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); revealGuesses(room); emitRoleStates(io, room); }));
    socket.on('teacher:revealSecret', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); revealSecret(room); emitRoleStates(io, room); }));
    socket.on('teacher:nextSpeaker', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); nextSpeakerOrRoundComplete(room); emitRoleStates(io, room); }));
    socket.on('teacher:lockPrep', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); lockPrep(room); emitRoleStates(io, room); }));
    socket.on('teacher:selectSpeaker', ({ roomCode, hostToken, speakerId }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); selectSpeaker(room, speakerId); emitRoleStates(io, room); }));
    socket.on('teacher:enterScoring', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); enterScoring(room); emitRoleStates(io, room); }));
    socket.on('teacher:selectFollowUpRequester', ({ roomCode, hostToken, playerId }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); selectFollowUpRequester(room, playerId); emitRoleStates(io, room); }));
  });
}
