import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { bonusCategories, type GuessResult } from '../lib/types.js';
import { call, useRoomState } from '../lib/socket.js';
import { Scoreboard } from '../components/Scoreboard.js';
import { TimersPanel } from '../components/TimersPanel.js';
import { WheelsPanel } from '../components/WheelsPanel.js';
import { HiddenAssignmentTable } from '../components/HiddenAssignmentTable.js';

const buttonStyle = { marginRight: 8, marginBottom: 8 };

export function TeacherPage({ socket, roomCode, hostToken }: { socket: Socket; roomCode: string; hostToken: string }) {
  const [payload] = useRoomState(socket);
  const [error, setError] = useState('');

  useEffect(() => {
    call(socket, 'teacher:connect', { roomCode, hostToken }).catch(async () => {
      await call(socket, 'room:create', { roomCode, hostToken });
      return call(socket, 'teacher:connect', { roomCode, hostToken });
    }).catch((err: Error) => setError(err.message));
  }, [socket, roomCode, hostToken]);

  const publicState = payload?.publicState;
  const phase = publicState?.phase ?? 'loading';
  const round = publicState?.activeRound;
  const players = useMemo(() => publicState?.playerOrder?.map((id: string) => publicState.players[id]) ?? [], [publicState]);
  const currentSpeaker = round?.currentSpeakerId ? publicState?.players?.[round.currentSpeakerId] : null;
  const selectedFollowUp = round?.followUp?.selectedRequesterId ? publicState?.players?.[round.followUp.selectedRequesterId] : null;

  const run = (event: string, extras: object = {}) => {
    setError('');
    return call(socket, event, { roomCode, hostToken, ...extras }).catch((e: Error) => setError(e.message));
  };

  return <main style={{ maxWidth: 980, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
    <h1>Teacher Dashboard · {roomCode}</h1>
    <p><strong>Phase:</strong> {phase}</p>
    <p><strong>Players:</strong> {players.length ? players.map((p: any) => p.displayName).join(', ') : 'No students yet'}</p>
    {currentSpeaker && <p><strong>Current speaker:</strong> {currentSpeaker.displayName}</p>}
    {selectedFollowUp && <p><strong>Selected follow-up student:</strong> {selectedFollowUp.displayName}</p>}
    {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}

    <section style={{ margin: '16px 0', padding: 12, border: '1px solid #ddd' }}>
      <h2>Game controls</h2>
      {(phase === 'lobby' || phase === 'round_complete') && <button style={buttonStyle} disabled={players.length === 0} onClick={() => run('teacher:startRound')}>Start Round</button>}
      {phase === 'prep' && <button style={buttonStyle} onClick={() => run('teacher:lockPrep')}>Finish Prep</button>}
      {(phase === 'ready_to_speak' || phase === 'speaker_selection') && <button style={buttonStyle} onClick={() => run('teacher:spinSpeaker')}>Spin Speaker Wheel</button>}
      {phase === 'speaking' && <>
        <button style={buttonStyle} disabled={Boolean(round?.speakerTimer?.running)} onClick={() => run('teacher:startSpeakerTimer')}>Start Speaking Timer</button>
        <button style={buttonStyle} disabled={!round?.speakerTimer?.running} onClick={() => run('teacher:pauseTimer')}>Pause Timer</button>
        <button style={buttonStyle} onClick={() => run('teacher:stopTimer')}>Stop Speaking</button>
      </>}
      {phase === 'speaker_finished' && <>
        <button style={buttonStyle} disabled={(round?.followUp?.requesterIds ?? []).length === 0} onClick={() => run('teacher:spinFollowUpWheel')}>Spin Follow-up Wheel</button>
        <button style={buttonStyle} disabled={!round?.followUp?.selectedRequesterId || Boolean(round?.followUp?.awardedRequesterId)} onClick={() => run('teacher:awardFollowUpPoint')}>Award Follow-up Point</button>
        <button style={buttonStyle} onClick={() => run('teacher:revealGuesses')}>Reveal Guesses</button>
      </>}
      {phase === 'guesses_revealed' && <button style={buttonStyle} onClick={() => run('teacher:enterScoring')}>Enter Scoring</button>}
      {phase === 'scoring' && <button style={buttonStyle} onClick={() => run('teacher:revealSecret')}>Reveal Secret</button>}
      {phase === 'secret_revealed' && <button style={buttonStyle} onClick={() => run('teacher:nextSpeaker')}>Next Speaker / Finish Round</button>}
      <button style={buttonStyle} onClick={() => run('teacher:resetGame')}>Reset Game</button>
    </section>

    <p><strong>Reveal stage:</strong> {!round?.revealGuesses ? 'Before reveal' : !round?.revealSecret ? 'Guesses revealed' : 'Secret revealed'}</p>
    <WheelsPanel title='Speaker Selection' spinning={Boolean(round?.speakerWheelSpinning)} items={players.map((p: any) => p.displayName)} />
    <WheelsPanel title='Follow-up Selection' spinning={Boolean(round?.followUp?.wheelSpinning)} items={(round?.followUp?.requesterIds ?? []).map((id: string) => publicState.players[id]?.displayName)} />
    <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
    <HiddenAssignmentTable round={round} players={players} />
    <Scoreboard players={players} />

    {phase === 'scoring' && <section style={{ marginTop: 16 }}>
      <h2>Score guesses</h2>
      {(round?.guesses ?? []).map((g: any) => <div key={`${g.guesserPlayerId}-${g.targetSpeakerId}`}>
        <strong>{publicState.players[g.guesserPlayerId]?.displayName ?? g.guesserPlayerId}</strong>
        {(['exact', 'partial', 'miss'] as GuessResult[]).map((r) => <button style={buttonStyle} key={r} onClick={() => run('teacher:scoreGuess', { guesserId: g.guesserPlayerId, roleResult: r, chaosResult: 'miss' })}>Role {r}</button>)}
      </div>)}
      {round?.currentSpeakerId && bonusCategories.map((b) => <button style={buttonStyle} key={b.id} onClick={() => run('teacher:setSpeakerBonus', { speakerId: round.currentSpeakerId, category: b.id })}>{b.label}</button>)}
    </section>}
  </main>;
}
