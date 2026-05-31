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
  scoreTeacherGuess,
  selectFollowUpRequester,
  selectSpeaker,
  startRound,
  submitGuess,
  submitTeacherGuess
} from './rooms.js';
import { buildTeacherPayload, buildStudentPayload, buildViewerPayload } from './payloads.js';
import { startTimer, pauseTimer, stopTimer, resetTimer } from './timers.js';
import type { RoomState, SpeakerBonusCategory } from './state.js';
import { TOPIC_CATEGORIES } from './data/topicSituations.js';
import { CHAOS_CARDS } from './data/chaosCards.js';
import { buildRoomExport, toCsv } from './export.js';
import { sanitizeGuessInput, sanitizeName, sanitizeRoomCode } from './sanitize.js';

const rooms = new Map<string, RoomState>();
const INACTIVITY_TTL_MS = 6 * 60 * 60 * 1000;
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

function ensurePromptsCompliant(): void {
  for (const topic of TOPIC_CATEGORIES) {
    const prompt = topic.publicSituation;
    if (prompt.includes('?')) throw new Error('Public prompts must not include question marks');
    if (/\bdo you think\b|\bshould\b/i.test(prompt)) {
      throw new Error('Public prompts must avoid IELTS-question phrasing');
    }
  }
}

ensurePromptsCompliant();

function getRoomOrThrow(roomCode: string): RoomState {
  const room = rooms.get(sanitizeRoomCode(roomCode));
  if (!room) throw new Error('Room not found');
  return room;
}

function touchRoom(room: RoomState): void {
  room.lastActivityEpochMs = Date.now();
}

function evictStaleRooms(): number {
  const cutoff = Date.now() - INACTIVITY_TTL_MS;
  let evicted = 0;
  for (const [code, room] of rooms.entries()) {
    if (room.lastActivityEpochMs < cutoff) {
      rooms.delete(code);
      evicted += 1;
    }
  }
  return evicted;
}

export function startRoomCleanupScheduler(intervalMs = 10 * 60 * 1000): NodeJS.Timeout {
  return setInterval(() => {
    const evicted = evictStaleRooms();
    if (evicted > 0) console.log(`Evicted ${evicted} inactive room(s)`);
  }, intervalMs);
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
      const code = sanitizeRoomCode(String(roomCode || ''));
      if (rooms.has(code)) throw new Error('Room already exists');
      const room = createRoom(code, String(hostToken || randomUUID()));
      rooms.set(code, room);
      touchRoom(room);
      socket.join(`room:${code}:teacher`);
      emitRoleStates(io, room);
      ack?.({ ok: true, roomCode: code, hostToken: room.hostToken });
    }));

    socket.on('teacher:connect', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode);
      requireTeacher(room, hostToken);
      touchRoom(room);
      socket.join(`room:${room.code}:teacher`);
      socket.emit('room:state', buildTeacherPayload(room, hostToken));
    }));

    socket.on('student:join', ({ roomCode, displayName, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode);
      if (room.locked) throw new Error('Room is locked');
      let id = playerId as string | undefined;
      const cleanedName = sanitizeName(String(displayName || ''));
      if (!id || !room.players[id] || room.players[id].removed) {
        id = randomUUID();
        const seat = room.playerOrder.length + 1;
        const fallbackName = `Student ${seat}`;
        room.players[id] = { id, displayName: cleanedName || fallbackName, seat, connected: true, waitingForNextRound: room.phase !== 'lobby', removed: false, score: 0 };
        room.playerOrder.push(id);
      } else {
        if (room.players[id].waitingForNextRound && room.phase === 'lobby') room.players[id].waitingForNextRound = false;
        if (cleanedName) room.players[id].displayName = cleanedName;
        room.players[id].connected = true;
      }
      touchRoom(room);
      socket.join(`room:${room.code}:student:${id}`);
      socket.emit('room:state', buildStudentPayload(room, id));
      emitRoleStates(io, room);
      ack?.({ ok: true, playerId: id });
    }));

    socket.on('viewer:connect', ({ roomCode }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode);
      touchRoom(room);
      socket.join(`room:${room.code}:viewer`);
      socket.emit('room:state', buildViewerPayload(room));
    }));

    socket.on('teacher:startRound', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      touchRoom(room);
      const eligible = room.playerOrder.filter((id) => !room.players[id].removed && !room.players[id].waitingForNextRound);
      const topic = TOPIC_CATEGORIES[Math.floor(Math.random() * TOPIC_CATEGORIES.length)];
      const rolePool = topic.roleCards.map((role) => role.id);
      const roleByPlayer = pickAssignments(eligible, rolePool);
      const chaosByPlayer = pickAssignments(eligible, CHAOS_POOL);
      startRound(room, topic, CHAOS_POOL, roleByPlayer, chaosByPlayer);
      emitRoleStates(io, room);
    }));

    socket.on('teacher:startPrep', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); emitRoleStates(io, room);
    }));

    socket.on('student:reconnect', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId);
      if (room.locked) throw new Error('Room is locked');
      if (room.players[playerId].waitingForNextRound && room.phase === 'lobby') room.players[playerId].waitingForNextRound = false;
      room.players[playerId].connected = true;
      touchRoom(room);
      socket.join(`room:${room.code}:student:${playerId}`);
      socket.emit('room:state', buildStudentPayload(room, playerId));
      emitRoleStates(io, room);
    }));

    socket.on('student:rerollRole', ({ roomCode, playerId, roleId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); touchRoom(room); applyReroll(room, playerId, 'role', roleId); emitRoleStates(io, room);
    }));
    socket.on('student:rerollChaos', ({ roomCode, playerId, chaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); touchRoom(room); applyReroll(room, playerId, 'chaos', chaosCardId); emitRoleStates(io, room);
    }));
    socket.on('student:submitGuess', ({ roomCode, playerId, guessedRoleId, guessedChaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId);
      touchRoom(room);
      submitGuess(room, playerId, sanitizeGuessInput(String(guessedRoleId || '')), sanitizeGuessInput(String(guessedChaosCardId || '')));
      emitRoleStates(io, room);
    }));
    socket.on('student:requestFollowUp', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId); touchRoom(room); requestFollowUp(room, playerId); emitRoleStates(io, room);
    }));
    socket.on('student:cancelFollowUpRequest', ({ roomCode, playerId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireStudent(room, playerId);
      touchRoom(room);
      const round = room.activeRound;
      if (!round) throw new Error('No active round');
      round.followUp.requesterIds = round.followUp.requesterIds.filter((id) => id !== playerId);
      if (round.followUp.selectedRequesterId === playerId) round.followUp.selectedRequesterId = null;
      emitRoleStates(io, room);
    }));

    socket.on('teacher:spinSpeaker', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      touchRoom(room);
      const round = room.activeRound;
      if (!round || round.speakersRemaining.length === 0) throw new Error('No eligible speakers');
      const speakerId = round.speakersRemaining[Math.floor(Math.random() * round.speakersRemaining.length)];
      selectSpeaker(room, speakerId);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:startSpeakerTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      touchRoom(room);
      room.activeRound.speakerTimer = startTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:pauseTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      touchRoom(room);
      room.activeRound.speakerTimer = pauseTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:stopTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      touchRoom(room);
      room.activeRound.speakerTimer = stopTimer(room.activeRound.speakerTimer); finishSpeaking(room);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:resetTimer', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); if (!room.activeRound) throw new Error('No active round');
      touchRoom(room);
      room.activeRound.speakerTimer = resetTimer(room.activeRound.speakerTimer);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:scoreGuess', ({ roomCode, hostToken, guesserId, roleResult, chaosResult }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); scoreGuessForPlayer(room, guesserId, roleResult, chaosResult); emitRoleStates(io, room); }));
    socket.on('teacher:setSpeakerBonus', ({ roomCode, hostToken, speakerId, category }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); awardSpeakerBonus(room, speakerId, category as SpeakerBonusCategory); emitRoleStates(io, room); }));
    socket.on('teacher:setRoomLock', ({ roomCode, hostToken, locked }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      room.locked = Boolean(locked);
      touchRoom(room);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:spinFollowUpWheel', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room);
      const requesterIds = room.activeRound?.followUp.requesterIds ?? [];
      if (requesterIds.length === 0) throw new Error('No follow-up requesters');
      selectFollowUpRequester(room, requesterIds[Math.floor(Math.random() * requesterIds.length)]);
      emitRoleStates(io, room);
    }));
    socket.on('teacher:awardFollowUpPoint', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); awardFollowUpPoint(room); emitRoleStates(io, room); }));
    socket.on('teacher:endRound', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); nextSpeakerOrRoundComplete(room); emitRoleStates(io, room); }));
    socket.on('teacher:resetGame', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken);
      touchRoom(room);
      room.activeRound = null; room.roundHistory = []; room.phase = 'lobby';
      Object.values(room.players).forEach((p) => { p.score = 0; p.waitingForNextRound = false; });
      emitRoleStates(io, room);
    }));
    socket.on('teacher:exportResults', ({ roomCode, hostToken }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room);
      const results = room.playerOrder.map((id) => room.players[id]).filter(Boolean).map((p) => ({ id: p.id, displayName: p.displayName, seat: p.seat, score: p.score }));
      ack?.({ ok: true, roomCode: room.code, results });
    }));
    socket.on('teacher:export', ({ roomCode, hostToken, format }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room);
      const rows = buildRoomExport(room);
      if (format === 'json') {
        ack?.({ ok: true, roomCode: room.code, format: 'json', content: JSON.stringify(rows, null, 2) });
        return;
      }
      ack?.({ ok: true, roomCode: room.code, format: 'csv', content: toCsv(rows) });
    }));
    socket.on('teacher:revealGuesses', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); revealGuesses(room); emitRoleStates(io, room); }));
    socket.on('teacher:revealSecret', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); revealSecret(room); emitRoleStates(io, room); }));
    socket.on('teacher:nextSpeaker', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); nextSpeakerOrRoundComplete(room); emitRoleStates(io, room); }));
    socket.on('teacher:lockPrep', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); lockPrep(room); emitRoleStates(io, room); }));
    socket.on('teacher:selectSpeaker', ({ roomCode, hostToken, speakerId }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); selectSpeaker(room, speakerId); emitRoleStates(io, room); }));
    socket.on('teacher:enterScoring', ({ roomCode, hostToken }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); enterScoring(room); emitRoleStates(io, room); }));
    socket.on('teacher:selectFollowUpRequester', ({ roomCode, hostToken, playerId }, ack) => withAck(ack, () => { const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room); selectFollowUpRequester(room, playerId); emitRoleStates(io, room); }));
    socket.on('teacher:submitSoloGuess', ({ roomCode, hostToken, guessedRoleId, guessedChaosCardId }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room);
      submitTeacherGuess(room, sanitizeGuessInput(String(guessedRoleId || '')), sanitizeGuessInput(String(guessedChaosCardId || '')));
      emitRoleStates(io, room);
    }));
    socket.on('teacher:scoreSoloGuess', ({ roomCode, hostToken, roleResult, chaosResult }, ack) => withAck(ack, () => {
      const room = getRoomOrThrow(roomCode); requireTeacher(room, hostToken); touchRoom(room);
      scoreTeacherGuess(room, roleResult, chaosResult); emitRoleStates(io, room);
    }));
  });
}
