import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { ROOM_PHASE } from '../lib/types.js';
import { getChaosCard, getRoleCard } from '../lib/cardCatalog.js';
import { call, useRoomState } from '../lib/socket.js';
import { GuessPanel } from '../components/GuessPanel.js';
import { TimersPanel } from '../components/TimersPanel.js';

function revealMessage(round: any): string {
  if (!round) return 'Waiting for the teacher to start the round.';
  if (!round.revealGuesses) return 'Guesses are still hidden. Listen carefully and submit your guess while the speaker timer is running.';
  if (!round.revealSecret) return 'Guesses are visible now. Wait for the teacher to reveal the secret cards.';
  return 'Secret cards have been revealed. Wait for the next speaker or the next round.';
}

function randomFrom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)] || '';
}

export function StudentPage({ socket, roomCode }: { socket: Socket; roomCode: string }) {
  const [playerId, setPlayerId] = useState(localStorage.getItem(`pid:${roomCode}`) || '');
  const [name, setName] = useState(localStorage.getItem(`name:${roomCode}`) || '');
  const [payload] = useRoomState(socket);
  const [guessRole, setGuessRole] = useState('');
  const [guessChaos, setGuessChaos] = useState('');
  const [error, setError] = useState('');

  const join = async () => socket.emit('student:join', { roomCode, displayName: name || 'Student', playerId }, (ack: any) => {
    if (ack?.ok) {
      setError('');
      setPlayerId(ack.playerId);
      localStorage.setItem(`pid:${roomCode}`, ack.playerId);
      localStorage.setItem(`name:${roomCode}`, name || 'Student');
    } else {
      setError(ack?.error || 'Could not join room');
    }
  });

  useEffect(() => { if (playerId) join(); }, []);

  const round = payload?.publicState?.activeRound;
  const selfId = payload?.selfPlayerId;
  const roleOptions = useMemo(() => round?.availableRoleIds ?? [], [round]);
  const chaosOptions = useMemo(() => round?.availableChaosCardIds ?? [], [round]);
  const roleCard = getRoleCard(payload?.selfPrivateState?.roleId);
  const chaosCard = getChaosCard(payload?.selfPrivateState?.chaosCardId);
  const canGuess = round?.phase === ROOM_PHASE.speaking && round?.speakerTimer?.running && round?.currentSpeakerId !== selfId;
  const canReroll = round?.phase === ROOM_PHASE.prep;

  useEffect(() => {
    if (roleOptions.length && !roleOptions.includes(guessRole)) setGuessRole(roleOptions[0]);
    if (chaosOptions.length && !chaosOptions.includes(guessChaos)) setGuessChaos(chaosOptions[0]);
  }, [roleOptions, chaosOptions, guessRole, guessChaos]);

  const run = (event: string, extras: object = {}) => {
    setError('');
    return call(socket, event, { roomCode, playerId: selfId, ...extras }).catch((e: Error) => setError(e.message));
  };

  return <main style={{ maxWidth: 900, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif', lineHeight: 1.45 }}>
    <h1>Join Room {roomCode}</h1>
    {!payload && <div style={{ display: 'flex', gap: 8, maxWidth: 420 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Your name' style={{ flex: 1 }} />
      <button onClick={join}>Join</button>
    </div>}
    {error && <p style={{ color: '#b00020' }}><strong>Error:</strong> {error}</p>}

    <p><strong>Phase:</strong> {round?.phase ?? 'lobby'}</p>
    <p><strong>Topic:</strong> {round?.topicTitle ?? 'Waiting for round'}</p>
    <p><strong>Situation:</strong> {round?.topicPrompt ?? 'The teacher has not started a round yet.'}</p>
    <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />

    <section style={{ marginTop: 20, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>My secret cards</h2>
      {roleCard ? <div>
        <h3>Role: {roleCard.title}</h3>
        <p>{roleCard.privateBrief}</p>
      </div> : <p>Role: wait for the teacher to start the round.</p>}
      {chaosCard ? <div>
        <h3>Chaos card</h3>
        <p>{chaosCard.instruction}</p>
        <p><strong>Success:</strong> {chaosCard.successCriteria}</p>
        <p><strong>Useful phrases:</strong> {chaosCard.examplePhrases.join(' / ')}</p>
      </div> : <p>Chaos card: wait for the teacher to start the round.</p>}
      <button disabled={!canReroll || payload?.selfPrivateState?.rerolledRole || roleOptions.length === 0} onClick={() => run('student:rerollRole', { roleId: randomFrom(roleOptions) })}>Reroll Role (-1)</button>
      <button disabled={!canReroll || payload?.selfPrivateState?.rerolledChaos || chaosOptions.length === 0} onClick={() => run('student:rerollChaos', { chaosCardId: randomFrom(chaosOptions) })} style={{ marginLeft: 8 }}>Reroll Chaos (-1)</button>
    </section>

    <section style={{ marginTop: 20, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Guess the speaker</h2>
      {!canGuess && <p>Guessing opens when the teacher starts the speaker timer. The current speaker cannot guess.</p>}
      <GuessPanel canGuess={canGuess} guessRole={guessRole} guessChaos={guessChaos} roleOptions={roleOptions} chaosOptions={chaosOptions} onRole={setGuessRole} onChaos={setGuessChaos} onSubmit={() => run('student:submitGuess', { guessedRoleId: guessRole, guessedChaosCardId: guessChaos })} />
    </section>

    <p style={{ marginTop: 20 }}><strong>Round status:</strong> {revealMessage(round)}</p>
  </main>;
}
