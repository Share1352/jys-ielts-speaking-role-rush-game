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

  const connectionLabel = socket.connected ? 'Connected' : 'Reconnecting';

  return <main className='app-shell stack-md student-page'>
    <header className='card app-header student-top-sticky'>
      <div className='app-header__top'>
        <h1 className='app-header__title'>Join Room {roomCode}</h1>
        <div className='app-header__meta'>
        <span className='status-pill'><strong>Room:</strong>&nbsp;{roomCode}</span>
        <span className='status-pill'><strong>Phase:</strong>&nbsp;{round?.phase ?? 'lobby'}</span>
        <span className='status-pill'><strong>Status:</strong>&nbsp;{connectionLabel}</span>
        </div>
      </div>
    </header>

    {!payload && <div className='join-form'>
      <input className='input' value={name} onChange={(e) => setName(e.target.value)} placeholder='Your name' />
      <button className='btn btn--primary btn--min-touch btn--join' onClick={join}>Join</button>
    </div>}
    {error && <p className='alert alert--error'><strong>Error:</strong> {error}</p>}

    <section className='card stack-sm'>
      <h2>Public Prompt & Timers</h2>
      <p><strong>Topic:</strong> {round?.topicTitle ?? 'Waiting for round'}</p>
      <p><strong>Situation:</strong> {round?.topicPrompt ?? 'The teacher has not started a round yet.'}</p>
      <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
      <p className='microcopy'><strong>Round status:</strong> {revealMessage(round)}</p>
    </section>

    <section className='card stack-sm section-card section-card--secret'>
      <div className='row row--spread'>
        <h2>My Secret Cards</h2>
        <span className='private-panel-label'>Private</span>
      </div>
      <p className='microcopy'>Private view only. Hidden from other students and viewer screen until teacher reveal.</p>
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
      <div className='row'>
        <button className={`btn btn--min-touch btn--stable ${(!canReroll || payload?.selfPrivateState?.rerolledRole || roleOptions.length === 0) ? 'is-disabled' : ''}`} disabled={!canReroll || payload?.selfPrivateState?.rerolledRole || roleOptions.length === 0} onClick={() => run('student:rerollRole', { roleId: randomFrom(roleOptions) })}>Reroll Role (-1)</button>
        <button className={`btn btn--min-touch btn--stable ${(!canReroll || payload?.selfPrivateState?.rerolledChaos || chaosOptions.length === 0) ? 'is-disabled' : ''}`} disabled={!canReroll || payload?.selfPrivateState?.rerolledChaos || chaosOptions.length === 0} onClick={() => run('student:rerollChaos', { chaosCardId: randomFrom(chaosOptions) })} >Reroll Chaos (-1)</button>
      </div>
      {!canReroll && <p className='alert alert--info'>Reroll actions are locked outside the prep phase.</p>}
      <p className='microcopy'>Each reroll can be used once per round, costs 1 point, and is available during prep phase only.</p>
    </section>

    {round?.soloMode ? <section className='card stack-sm'>
      <h2>1-on-1 Round</h2>
      <p className='alert alert--info'>You are the only speaker. Play your role and complete your chaos card. Your teacher will try to guess your hidden cards, so keep them secret.</p>
    </section> : <section className={`card stack-sm ${!canGuess ? 'disabled-surface' : ''}`}>
      <div className='row row--spread'>
        <h2>Guess the Speaker</h2>
        <span className='status-pill'>{canGuess ? 'Unlocked: Speaker timer is running' : 'Locked: Wait for speaker timer'}</span>
      </div>
      {!canGuess && <p className='alert alert--info'>Guessing opens only while the speaker timer is running. The current speaker cannot guess themselves.</p>}
      <GuessPanel canGuess={canGuess} guessRole={guessRole} guessChaos={guessChaos} roleOptions={roleOptions} chaosOptions={chaosOptions} onRole={setGuessRole} onChaos={setGuessChaos} onSubmit={() => run('student:submitGuess', { guessedRoleId: guessRole, guessedChaosCardId: guessChaos })} />
    </section>}
  </main>;
}
