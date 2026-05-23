import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { bonusCategories, type GuessResult } from '../lib/types.js';
import { call, useRoomState } from '../lib/socket.js';
import { Scoreboard } from '../components/Scoreboard.js';
import { TimersPanel } from '../components/TimersPanel.js';
import { WheelsPanel } from '../components/WheelsPanel.js';
import { HiddenAssignmentTable } from '../components/HiddenAssignmentTable.js';


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

  const revealStage = !round?.revealGuesses ? 'Before reveal' : !round?.revealSecret ? 'Guesses revealed' : 'Secret revealed';

  return <main className='app-shell stack-md'>
    <header className='panel stack-sm'>
      <div className='row row--spread'>
        <h1>Teacher Dashboard · {roomCode}</h1>
        <div className='row'>
          <span className='status-pill'>Connected</span>
          <span className='badge'>Phase: {phase}</span>
        </div>
      </div>
      <p><strong>Players:</strong> {players.length ? players.map((p: any) => p.displayName).join(', ') : <span className='empty-state'>No students yet</span>}</p>
      {error && <p className='compact-alert'><strong>Error:</strong> {error}</p>}
    </header>

    <section className='panel stack-sm'>
      <h2>Primary Controls</h2>
      {(phase === 'lobby' || phase === 'round_complete') && <button className='btn' disabled={players.length === 0} onClick={() => run('teacher:startRound')}>Start Round</button>}
      {phase === 'prep' && <button className='btn' onClick={() => run('teacher:lockPrep')}>Finish Prep</button>}
      {(phase === 'ready_to_speak' || phase === 'speaker_selection') && <button className='btn btn--primary' onClick={() => run('teacher:spinSpeaker')}>Spin Speaker Wheel</button>}
      {phase === 'speaking' && <>
        <div className='stack-sm'>
          <p className='microcopy'>Live speaking controls</p>
          <div className='row'>
            <button className='btn btn--primary' disabled={Boolean(round?.speakerTimer?.running)} onClick={() => run('teacher:startSpeakerTimer')}>Start Speaking Timer</button>
            <button className='btn' disabled={!round?.speakerTimer?.running} onClick={() => run('teacher:pauseTimer')}>Pause Timer</button>
            <button className='btn' onClick={() => run('teacher:stopTimer')}>Stop Speaking</button>
          </div>
        </div>
      </>}
      {phase === 'speaker_finished' && <>
        <div className='stack-sm'>
          <p className='microcopy'>Post-speaking tasks</p>
          <div className='row'>
            <button className='btn' disabled={(round?.followUp?.requesterIds ?? []).length === 0} onClick={() => run('teacher:spinFollowUpWheel')}>Spin Follow-up Wheel</button>
            <button className='btn' disabled={!round?.followUp?.selectedRequesterId || Boolean(round?.followUp?.awardedRequesterId)} onClick={() => run('teacher:awardFollowUpPoint')}>Award Follow-up Point</button>
            <button className='btn btn--primary' onClick={() => run('teacher:revealGuesses')}>Reveal Guesses</button>
          </div>
        </div>
      </>}
      {phase === 'guesses_revealed' && <button className='btn btn--primary' onClick={() => run('teacher:enterScoring')}>Enter Scoring</button>}
      {phase === 'scoring' && <button className='btn btn--primary' onClick={() => run('teacher:revealSecret')}>Reveal Secret</button>}
      {phase === 'secret_revealed' && <button className='btn btn--primary' onClick={() => run('teacher:nextSpeaker')}>Next Speaker / Finish Round</button>}
      <div className='danger-zone'>
        <button className='btn btn--danger' onClick={() => run('teacher:resetGame')}>Reset Game</button>
      </div>
    </section>

    <section className='panel'>
      <div className='row row--spread'>
        <p><strong>Current speaker:</strong> {currentSpeaker?.displayName ?? <span className='empty-state'>Not selected yet</span>}</p>
        <p><strong>Follow-up selection:</strong> {selectedFollowUp?.displayName ?? <span className='empty-state'>Not selected</span>}</p>
        <p><strong>Reveal stage:</strong> <span className='badge'>{revealStage}</span></p>
      </div>
    </section>

    <section className='data-grid'>
      <div className='stack-md'>
        <WheelsPanel title='Speaker Selection' spinning={Boolean(round?.speakerWheelSpinning)} items={players.map((p: any) => p.displayName)} />
        <WheelsPanel title='Follow-up Selection' spinning={Boolean(round?.followUp?.wheelSpinning)} items={(round?.followUp?.requesterIds ?? []).map((id: string) => publicState.players[id]?.displayName)} />
      </div>
      <div className='stack-md'>
        <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
        <HiddenAssignmentTable round={round} players={players} />
      </div>
    </section>

    <section className='panel'>
      <h2>Scoreboard</h2>
      <Scoreboard players={players} />
    </section>

    {phase === 'scoring' && <section className='panel stack-sm'>
      <h2>Scoring Actions</h2>
      {(round?.guesses ?? []).length === 0 && <p className='compact-alert compact-alert--soft'>No guesses submitted for this speaker yet.</p>}
      {(round?.guesses ?? []).map((g: any) => <div className='row row--readable' key={`${g.guesserPlayerId}-${g.targetSpeakerId}`}>
        <strong>{publicState.players[g.guesserPlayerId]?.displayName ?? g.guesserPlayerId}</strong>
        <div className='row'>
          {(['exact', 'partial', 'miss'] as GuessResult[]).map((r) => <button className='btn' key={r} onClick={() => run('teacher:scoreGuess', { guesserId: g.guesserPlayerId, roleResult: r, chaosResult: 'miss' })}>Role {r}</button>)}
        </div>
      </div>)}
      {round?.currentSpeakerId && <div className='stack-sm'>
        <p className='microcopy'>Speaker bonus (+1 each)</p>
        <div className='row'>
          {bonusCategories.map((b) => <button className='btn' key={b.id} onClick={() => run('teacher:setSpeakerBonus', { speakerId: round.currentSpeakerId, category: b.id })}>{b.label}</button>)}
        </div>
      </div>}
    </section>}
  </main>;
}
