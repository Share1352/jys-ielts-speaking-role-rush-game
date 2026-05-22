import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { io, type Socket } from 'socket.io-client';
import type { SpeakerBonusCategory } from '@jys/shared';

type GuessResult = 'exact' | 'partial' | 'miss';

type AnyPayload = any;

const bonusCategories: Array<{ id: SpeakerBonusCategory; label: string }> = [
  { id: 'used_idiom', label: 'Used an idiom' },
  { id: 'used_advanced_sentence_structure', label: 'Used an advanced sentence structure' },
  { id: 'completed_chaos_card', label: 'Completed the chaos card' },
  { id: 'fulfilled_role', label: 'Fulfilled the role' },
  { id: 'almost_no_grammar_or_pronunciation_mistakes', label: 'Had almost no grammar or pronunciation mistakes' }
];

const roleOptions = ['role-1', 'role-2', 'role-3', 'role-4', 'role-5'];
const chaosOptions = ['chaos-1', 'chaos-2', 'chaos-3', 'chaos-4', 'chaos-5'];

function useSocket() {
  const [socket] = useState<Socket>(() => io('/', { transports: ['websocket'] }));
  useEffect(() => {
    return () => { socket.close(); };
  }, [socket]);
  return socket;
}

function call(socket: Socket, event: string, payload: object) {
  return new Promise<void>((resolve, reject) => {
    socket.emit(event, payload, (ack: { ok: boolean; error?: string }) => {
      if (ack?.ok) resolve();
      else reject(new Error(ack?.error || 'Action failed'));
    });
  });
}

function useRoomState(socket: Socket) {
  const [payload, setPayload] = useState<AnyPayload | null>(null);
  useEffect(() => {
    const onState = (next: AnyPayload) => setPayload(next);
    socket.on('room:state', onState);
    return () => { socket.off('room:state', onState); };
  }, [socket]);
  return [payload, setPayload] as const;
}

function TeacherPage({ socket, roomCode, hostToken }: { socket: Socket; roomCode: string; hostToken: string }) {
  const [payload] = useRoomState(socket);
  const [error, setError] = useState('');
  useEffect(() => {
    call(socket, 'teacher:connect', { roomCode, hostToken }).catch(async () => {
      await call(socket, 'room:create', { roomCode, hostToken });
      return call(socket, 'teacher:connect', { roomCode, hostToken });
    }).catch((err) => setError(err.message));
  }, [socket, roomCode, hostToken]);

  const publicState = payload?.publicState;
  const round = publicState?.activeRound;
  const players = useMemo(() => publicState?.playerOrder?.map((id: string) => publicState.players[id]) ?? [], [publicState]);

  const run = (event: string, extras: object = {}) => call(socket, event, { roomCode, hostToken, ...extras }).catch((e) => setError(e.message));
  const doExport = () => {
    if (!publicState) return;
    const rows = players.map((p: any) => `${publicState.code},${p.id},${p.displayName},${p.score}`);
    const csv = `roomCode,playerId,name,score\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${publicState.code}-scores.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return <main><h1>Teacher Dashboard · {roomCode}</h1><p>{error}</p>
    <button onClick={() => run('teacher:start_round')}>Start Round</button>
    <button onClick={() => run('teacher:lock_prep')}>Lock Prep</button>
    <button onClick={() => run('teacher:reveal_guesses')}>Reveal Guesses</button>
    <button onClick={() => run('teacher:enter_scoring')}>Enter Scoring</button>
    <button onClick={() => run('teacher:reveal_secret')}>Reveal Secret</button>
    <button onClick={() => run('teacher:next_speaker')}>Next Speaker</button>
    <button onClick={doExport}>Export Scores</button>
    <button onClick={() => window.location.reload()}>Reset Local View</button>

    <h2>Speaker / Timer Controls</h2>
    {players.map((p: any) => <button key={p.id} onClick={() => run('teacher:select_speaker', { speakerId: p.id })}>{p.displayName}</button>)}
    <button onClick={() => run('teacher:speaker_timer', { action: 'start' })}>Start Timer</button>
    <button onClick={() => run('teacher:speaker_timer', { action: 'pause' })}>Pause Timer</button>
    <button onClick={() => run('teacher:speaker_timer', { action: 'stop' })}>Stop Timer</button>
    <button onClick={() => run('teacher:speaker_timer', { action: 'reset' })}>Reset Timer</button>

    <h2>Follow-up Controls</h2>
    {(round?.followUp?.requesterIds ?? []).map((id: string) => {
      const p = publicState.players[id];
      return <button key={id} onClick={() => run('teacher:select_follow_up', { playerId: id })}>Select {p?.displayName}</button>;
    })}
    <button onClick={() => run('teacher:award_follow_up')}>Award +1 Follow-up</button>

    <h2>Scoring</h2>
    {(round?.guesses ?? []).map((g: any) => {
      const p = publicState.players[g.guesserPlayerId];
      return <div key={`${g.guesserPlayerId}-${g.targetSpeakerId}`}>
        <strong>{p?.displayName}</strong>
        {(['exact', 'partial', 'miss'] as GuessResult[]).map((r) =>
          <button key={`r-${r}`} onClick={() => run('teacher:score_guess', { guesserId: g.guesserPlayerId, roleResult: r, chaosResult: 'miss' })}>Role {r}</button>
        )}
      </div>;
    })}

    <h2>Speaker Bonuses</h2>
    {round?.currentSpeakerId && bonusCategories.map((b) =>
      <button key={b.id} onClick={() => run('teacher:bonus', { speakerId: round.currentSpeakerId, category: b.id })}>{b.label}</button>
    )}

    <h2>Scoreboard</h2>
    <ul>{players.map((p: any) => <li key={p.id}>{p.displayName}: {p.score}</li>)}</ul>
  </main>;
}

function StudentPage({ socket, roomCode }: { socket: Socket; roomCode: string }) {
  const [playerId, setPlayerId] = useState(localStorage.getItem(`pid:${roomCode}`) || '');
  const [name, setName] = useState(localStorage.getItem(`name:${roomCode}`) || '');
  const [payload] = useRoomState(socket);
  const [guessRole, setGuessRole] = useState(roleOptions[0]);
  const [guessChaos, setGuessChaos] = useState(chaosOptions[0]);

  const join = async () => {
    socket.emit('student:join', { roomCode, displayName: name || 'Student', playerId }, (ack: any) => {
      if (ack?.ok) {
        setPlayerId(ack.playerId);
        localStorage.setItem(`pid:${roomCode}`, ack.playerId);
        localStorage.setItem(`name:${roomCode}`, name || 'Student');
      }
    });
  };

  useEffect(() => { if (playerId) join(); }, []);

  const round = payload?.publicState?.activeRound;
  const selfId = payload?.selfPlayerId;
  const canGuess = round?.phase === 'speaking' && round?.speakerTimer?.running && round?.currentSpeakerId !== selfId;
  const canRequestFollow = round?.phase === 'speaking' && round?.speakerTimer?.running;
  const canReroll = round?.phase === 'prep';

  return <main><h1>Join Room {roomCode}</h1>
    {!payload && <div><input value={name} onChange={(e) => setName(e.target.value)} placeholder='Your name' /><button onClick={join}>Join</button></div>}
    <p>Phase: {payload?.publicState?.phase}</p>
    <p>Topic: {round?.topicPrompt}</p>
    <h2>My Secret Cards</h2>
    <p>Role: {payload?.selfPrivateState?.roleId ?? 'N/A'}</p>
    <p>Chaos: {payload?.selfPrivateState?.chaosCardId ?? 'N/A'}</p>
    <button disabled={!canReroll || payload?.selfPrivateState?.rerolledRole} onClick={() => call(socket, 'student:reroll_role', { roomCode, playerId: selfId, roleId: roleOptions[Math.floor(Math.random()*roleOptions.length)] })}>Reroll Role (-1)</button>
    <button disabled={!canReroll || payload?.selfPrivateState?.rerolledChaos} onClick={() => call(socket, 'student:reroll_chaos', { roomCode, playerId: selfId, chaosCardId: chaosOptions[Math.floor(Math.random()*chaosOptions.length)] })}>Reroll Chaos (-1)</button>

    <h2>Guess Speaker</h2>
    <select value={guessRole} onChange={(e) => setGuessRole(e.target.value)} disabled={!canGuess}>{roleOptions.map((o) => <option key={o}>{o}</option>)}</select>
    <select value={guessChaos} onChange={(e) => setGuessChaos(e.target.value)} disabled={!canGuess}>{chaosOptions.map((o) => <option key={o}>{o}</option>)}</select>
    <button disabled={!canGuess} onClick={() => call(socket, 'student:submit_guess', { roomCode, playerId: selfId, guessedRoleId: guessRole, guessedChaosCardId: guessChaos })}>Submit / Edit Guess</button>

    <h2>Follow-up</h2>
    <button disabled={!canRequestFollow} onClick={() => call(socket, 'student:request_follow_up', { roomCode, playerId: selfId })}>Request Follow-up Question</button>
  </main>;
}

function ViewerPage({ socket, roomCode }: { socket: Socket; roomCode: string }) {
  const [payload] = useRoomState(socket);
  useEffect(() => { call(socket, 'viewer:connect', { roomCode }).catch(() => undefined); }, [socket, roomCode]);
  const round = payload?.publicState?.activeRound;
  const players = payload?.publicState?.playerOrder?.map((id: string) => payload.publicState.players[id]) ?? [];

  return <main><h1>Viewer · {roomCode}</h1>
    <h2>Phase: {payload?.publicState?.phase}</h2>
    <p>Prompt: {round?.topicPrompt}</p>
    <p>Current speaker: {round?.currentSpeakerId ? payload.publicState.players[round.currentSpeakerId]?.displayName : 'None'}</p>
    <p>Prep timer: {round?.prepTimer?.remainingSec}s</p>
    <p>Speaker timer: {round?.speakerTimer?.remainingSec}s</p>
    <h3>Seats / Scoreboard</h3>
    <ul>{players.map((p: any) => <li key={p.id}>Seat {p.seat}: {p.displayName} ({p.score})</li>)}</ul>
    <h3>Follow-up requests</h3>
    <ul>{(round?.followUp?.requesterIds ?? []).map((id: string) => <li key={id}>{payload.publicState.players[id]?.displayName}</li>)}</ul>
    <p>Guess progress: {Object.values(round?.guessCountsByTargetSpeakerId ?? {}).reduce((a: number, b: any) => a + Number(b), 0)}</p>
    {round?.revealGuesses && <pre>{JSON.stringify(round.guesses, null, 2)}</pre>}
    {round?.revealSecret && <pre>{JSON.stringify(round.revealedSecretsByPlayerId, null, 2)}</pre>}
  </main>;
}

function App() {
  const socket = useSocket();
  const { pathname, search } = window.location;

  if (pathname.startsWith('/teacher/')) {
    const roomCode = pathname.split('/')[2] || '';
    const hostToken = new URLSearchParams(search).get('host') || '';
    return <TeacherPage socket={socket} roomCode={roomCode.toUpperCase()} hostToken={hostToken} />;
  }
  if (pathname.startsWith('/join/')) {
    const roomCode = pathname.split('/')[2] || '';
    return <StudentPage socket={socket} roomCode={roomCode.toUpperCase()} />;
  }
  if (pathname.startsWith('/viewer/')) {
    const roomCode = pathname.split('/')[2] || '';
    return <ViewerPage socket={socket} roomCode={roomCode.toUpperCase()} />;
  }

  return <main><h1>JYS IELTS Speaking Role Rush</h1><p>Use /teacher/:roomCode?host=:hostToken, /join/:roomCode, or /viewer/:roomCode.</p></main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
