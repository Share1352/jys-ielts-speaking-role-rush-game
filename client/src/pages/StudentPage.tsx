import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { chaosOptions, ROOM_PHASE, roleOptions } from '../lib/types.js';
import { call, useRoomState } from '../lib/socket.js';
import { GuessPanel } from '../components/GuessPanel.js';
import { TimersPanel } from '../components/TimersPanel.js';

export function StudentPage({ socket, roomCode }: { socket: Socket; roomCode: string }) {
  const [playerId, setPlayerId] = useState(localStorage.getItem(`pid:${roomCode}`) || '');
  const [name, setName] = useState(localStorage.getItem(`name:${roomCode}`) || '');
  const [payload] = useRoomState(socket);
  const [guessRole, setGuessRole] = useState(roleOptions[0]);
  const [guessChaos, setGuessChaos] = useState(chaosOptions[0]);

  const join = async () => socket.emit('student:join', { roomCode, displayName: name || 'Student', playerId }, (ack: any) => {
    if (ack?.ok) { setPlayerId(ack.playerId); localStorage.setItem(`pid:${roomCode}`, ack.playerId); localStorage.setItem(`name:${roomCode}`, name || 'Student'); }
  });
  useEffect(() => { if (playerId) join(); }, []);

  const round = payload?.publicState?.activeRound;
  const selfId = payload?.selfPlayerId;
  const canGuess = round?.phase === ROOM_PHASE.speaking && round?.speakerTimer?.running && round?.currentSpeakerId !== selfId;
  const canReroll = round?.phase === ROOM_PHASE.prep;
  const revealStage = !round?.revealGuesses ? 'before_reveal' : !round?.revealSecret ? 'guesses_revealed' : 'secret_revealed';

  return <main><h1>Join Room {roomCode}</h1>
    {!payload && <div><input value={name} onChange={(e) => setName(e.target.value)} /><button onClick={join}>Join</button></div>}
    <p>Phase: {round?.phase ?? 'lobby'}</p>
    <p>Prompt: {round?.topicPrompt ?? 'Waiting for round'}</p>
    <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
    <h2>My Secret Cards</h2><p>Role: {payload?.selfPrivateState?.roleId ?? 'N/A'}</p><p>Chaos: {payload?.selfPrivateState?.chaosCardId ?? 'N/A'}</p>
    <button disabled={!canReroll || payload?.selfPrivateState?.rerolledRole} onClick={() => call(socket, 'student:rerollRole', { roomCode, playerId: selfId, roleId: roleOptions[Math.floor(Math.random() * roleOptions.length)] })}>Reroll Role (-1)</button>
    <button disabled={!canReroll || payload?.selfPrivateState?.rerolledChaos} onClick={() => call(socket, 'student:rerollChaos', { roomCode, playerId: selfId, chaosCardId: chaosOptions[Math.floor(Math.random() * chaosOptions.length)] })}>Reroll Chaos (-1)</button>
    <h2>Guess Speaker</h2><GuessPanel canGuess={canGuess} guessRole={guessRole} guessChaos={guessChaos} onRole={setGuessRole} onChaos={setGuessChaos} onSubmit={() => call(socket, 'student:submitGuess', { roomCode, playerId: selfId, guessedRoleId: guessRole, guessedChaosCardId: guessChaos })} />
    <p>Reveal progress: {revealStage}</p>
  </main>;
}
