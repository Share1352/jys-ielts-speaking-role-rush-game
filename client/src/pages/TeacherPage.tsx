import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { bonusCategories, type GuessResult } from '../lib/types.js';
import { call, useRoomState } from '../lib/socket.js';
import { roleLabel, chaosLabel } from '../lib/cardCatalog.js';
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
  const soloMode = Boolean(round?.soloMode);

  // Teacher's solo-mode guess inputs (the teacher guesses the lone student's hidden cards).
  const roleOptions: string[] = round?.availableRoleIds ?? [];
  const chaosOptions: string[] = round?.availableChaosCardIds ?? [];
  const [soloRoleGuess, setSoloRoleGuess] = useState('');
  const [soloChaosGuess, setSoloChaosGuess] = useState('');
  useEffect(() => {
    if (roleOptions.length && !roleOptions.includes(soloRoleGuess)) setSoloRoleGuess(roleOptions[0]);
    if (chaosOptions.length && !chaosOptions.includes(soloChaosGuess)) setSoloChaosGuess(chaosOptions[0]);
  }, [roleOptions, chaosOptions, soloRoleGuess, soloChaosGuess]);

  const run = (event: string, extras: object = {}) => {
    setError('');
    return call(socket, event, { roomCode, hostToken, ...extras }).catch((e: Error) => setError(e.message));
  };

  const revealStage = !round?.revealGuesses ? 'Before reveal' : !round?.revealSecret ? 'Guesses revealed' : 'Secret revealed';
  const phaseBadgeClass = `phase-badge phase-badge--${phase}`;
  const speakingTimerState = round?.speakerTimer?.running ? 'Running' : 'Stopped';

  return <main className='app-shell stack-md'>
    <header className='panel app-header'>
      <div className='app-header__top'>
        <h1>Top Game Header · {roomCode}</h1>
        <div className='app-header__meta'>
          <span className='meta-chip meta-chip--success'>Connected</span>
          <span className={phaseBadgeClass}>Phase: {phase}</span>
        </div>
      </div>
      <p className='info-strip'><strong>Players:</strong> {players.length ? players.map((p: any) => p.displayName).join(', ') : <span className='empty-state'>No students yet</span>}</p>
      {error && <p className='state state--error'><strong>Error:</strong> {error}</p>}
    </header>

    <section className='panel'>
      <h2>Live Round Snapshot</h2>
      <div className='dashboard-grid'>
        <p><strong>Current speaker:</strong> {currentSpeaker?.displayName ?? <span className='empty-state'>Not selected yet</span>}</p>
        <p><strong>Follow-up selection:</strong> {selectedFollowUp?.displayName ?? <span className='empty-state'>Not selected</span>}</p>
        <p><strong>Reveal stage:</strong> <span className='badge'>{revealStage}</span></p>
        <p><strong>Speaker timer:</strong> <span className={round?.speakerTimer?.running ? 'status-pill phase-status phase-status--speaking' : 'status-pill phase-status phase-status--idle'}>{speakingTimerState}</span></p>
      </div>
    </section>

    <section className='panel stack-sm'>
      <h2>Primary Phase Actions</h2>
      {(phase === 'lobby' || phase === 'round_complete') && <div className='stack-sm'>
        <div className='action-group action-group--primary'>
          <button className='btn btn--primary' disabled={players.length === 0} onClick={() => run('teacher:startRound')}>Start Round</button>
        </div>
      </div>}
      {phase === 'prep' && <div className='stack-sm'>
        <div className='action-group action-group--primary'>
          <button className='btn btn--primary' onClick={() => run('teacher:lockPrep')}>Finish Prep</button>
        </div>
      </div>}
      {(phase === 'ready_to_speak' || phase === 'speaker_selection') && <div className='stack-sm'>
        <div className='action-group action-group--primary'>
          <button className='btn btn--primary' onClick={() => run('teacher:spinSpeaker')}>{soloMode ? "Begin Student's Turn" : 'Spin Speaker Wheel'}</button>
        </div>
      </div>}
      {phase === 'speaking' && <>
        <div className='stack-sm'>
          <p className='microcopy'>Primary CTA</p>
          <div className='action-group action-group--primary'>
            <button className='btn btn--primary' disabled={Boolean(round?.speakerTimer?.running)} onClick={() => run('teacher:startSpeakerTimer')}>Start Speaking Timer</button>
          </div>
          <div className='action-group action-group--secondary'>
            <button className='btn' disabled={!round?.speakerTimer?.running} onClick={() => run('teacher:pauseTimer')}>Pause Timer</button>
            <button className='btn' onClick={() => run('teacher:stopTimer')}>Stop Speaking</button>
          </div>
        </div>
      </>}
      {phase === 'speaker_finished' && <>
        <div className='stack-sm'>
          <p className='microcopy'>Primary CTA</p>
          <div className='action-group action-group--primary'>
            <button className='btn btn--primary' onClick={() => run('teacher:revealGuesses')}>Reveal Guesses</button>
          </div>
          {!soloMode && <div className='action-group action-group--secondary'>
            <button className='btn' disabled={(round?.followUp?.requesterIds ?? []).length === 0} onClick={() => run('teacher:spinFollowUpWheel')}>Spin Follow-up Wheel</button>
            <button className='btn' disabled={!round?.followUp?.selectedRequesterId || Boolean(round?.followUp?.awardedRequesterId)} onClick={() => run('teacher:awardFollowUpPoint')}>Award Follow-up Point</button>
          </div>}
        </div>
      </>}

      {soloMode && (phase === 'speaking' || phase === 'speaker_finished') && <div className='stack-sm section-card section-card--secret'>
        <h3>Your Guess (the student's cards are hidden)</h3>
        <p className='microcopy'>You are the guesser in a 1-on-1 round. Pick the role and chaos card you think the student has.</p>
        <label>Role guess
          <select className='input' value={soloRoleGuess} disabled={Boolean(round?.teacherGuess?.locked)} onChange={(e) => setSoloRoleGuess(e.target.value)}>
            {roleOptions.map((id) => <option key={id} value={id}>{roleLabel(id)}</option>)}
          </select>
        </label>
        <label>Chaos card guess
          <select className='input' value={soloChaosGuess} disabled={Boolean(round?.teacherGuess?.locked)} onChange={(e) => setSoloChaosGuess(e.target.value)}>
            {chaosOptions.map((id) => <option key={id} value={id}>{chaosLabel(id)}</option>)}
          </select>
        </label>
        <div className='action-group action-group--primary'>
          <button className='btn' disabled={Boolean(round?.teacherGuess?.locked)} onClick={() => run('teacher:submitSoloGuess', { guessedRoleId: soloRoleGuess, guessedChaosCardId: soloChaosGuess })}>
            {round?.teacherGuess?.submitted ? 'Update Guess' : 'Submit Guess'}
          </button>
        </div>
        {round?.teacherGuess?.submitted && <p className='microcopy'>Guess saved{round?.teacherGuess?.locked ? ' and locked.' : '. You can update it until the timer stops.'}</p>}
      </div>}
      {phase === 'guesses_revealed' && <div className='action-group action-group--primary'><button className='btn btn--primary' onClick={() => run('teacher:enterScoring')}>Enter Scoring</button></div>}
      {phase === 'scoring' && <div className='action-group action-group--primary'><button className='btn btn--primary' onClick={() => run('teacher:revealSecret')}>Reveal Secret</button></div>}
      {phase === 'secret_revealed' && <div className='action-group action-group--primary'><button className='btn btn--primary' onClick={() => run('teacher:nextSpeaker')}>Next Speaker / Finish Round</button></div>}
    </section>

    <section className='panel stack-sm'>
      <h2>Secondary/Admin Actions</h2>
      <div className='action-group action-group--destructive'>
        <button className='btn btn--danger' onClick={() => run('teacher:resetGame')}>Reset Game</button>
      </div>
    </section>

    <section className='dashboard-grid'>
      <h2>Analytics Blocks</h2>
      {!soloMode && <div className='stack-md'>
        <h3>Wheels</h3>
        <WheelsPanel title='Speaker Selection' spinning={Boolean(round?.speakerWheelSpinning)} items={players.map((p: any) => p.displayName)} />
        <WheelsPanel title='Follow-up Selection' spinning={Boolean(round?.followUp?.wheelSpinning)} items={(round?.followUp?.requesterIds ?? []).map((id: string) => publicState.players[id]?.displayName)} />
      </div>}
      <div className='stack-md'>
        <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
        <h3>Hidden Assignments</h3>
        {soloMode && !round?.revealSecret
          ? <p className='compact-alert compact-alert--soft'>1-on-1 round: the student's role and chaos card stay hidden from you until you reveal the secret, so you can guess fairly.</p>
          : <HiddenAssignmentTable round={round} players={players} />}
      </div>
    </section>

    <section className='panel'>
      <h2>Analytics Blocks · Scoreboard</h2>
      <Scoreboard players={players} />
    </section>

    {phase === 'scoring' && <section className='panel stack-sm'>
      <h2>Scoring Actions</h2>
      {soloMode ? <div className='stack-sm'>
        {round?.teacherGuess?.submitted
          ? <div className='stack-sm'>
              <p><strong>Your role guess:</strong> {roleLabel(round.teacherGuess.guessedRoleId)} {round?.teacherGuess?.roleResult ? `· ${round.teacherGuess.roleResult}` : ''}</p>
              <div className='action-group action-group--primary'>
                {(['exact', 'partial', 'miss'] as GuessResult[]).map((r) => <button className='btn' key={`role-${r}`} onClick={() => run('teacher:scoreSoloGuess', { roleResult: r, chaosResult: round?.teacherGuess?.chaosResult ?? 'miss' })}>Role {r}</button>)}
              </div>
              <p><strong>Your chaos guess:</strong> {chaosLabel(round.teacherGuess.guessedChaosCardId)} {round?.teacherGuess?.chaosResult ? `· ${round.teacherGuess.chaosResult}` : ''}</p>
              <div className='action-group action-group--primary'>
                {(['exact', 'partial', 'miss'] as GuessResult[]).map((r) => <button className='btn' key={`chaos-${r}`} onClick={() => run('teacher:scoreSoloGuess', { roleResult: round?.teacherGuess?.roleResult ?? 'miss', chaosResult: r })}>Chaos {r}</button>)}
              </div>
              <p className='microcopy'>This checks how well you guessed. It does not change the student's score.</p>
            </div>
          : <p className='compact-alert compact-alert--soft'>You did not submit a guess for this student.</p>}
      </div> : <>
        {(round?.guesses ?? []).length === 0 && <p className='compact-alert compact-alert--soft'>No guesses submitted for this speaker yet.</p>}
        {(round?.guesses ?? []).map((g: any) => <div className='row row--readable' key={`${g.guesserPlayerId}-${g.targetSpeakerId}`}>
          <strong>{publicState.players[g.guesserPlayerId]?.displayName ?? g.guesserPlayerId}</strong>
          <div className='action-group action-group--primary'>
            {(['exact', 'partial', 'miss'] as GuessResult[]).map((r) => <button className='btn' key={r} onClick={() => run('teacher:scoreGuess', { guesserId: g.guesserPlayerId, roleResult: r, chaosResult: 'miss' })}>Role {r}</button>)}
          </div>
        </div>)}
      </>}
      {round?.currentSpeakerId && <div className='stack-sm'>
        <p className='microcopy'>Speaker bonus (+1 each)</p>
        <div className='action-group action-group--primary'>
          {bonusCategories.map((b) => <button className='btn' key={b.id} onClick={() => run('teacher:setSpeakerBonus', { speakerId: round.currentSpeakerId, category: b.id })}>{b.label}</button>)}
        </div>
      </div>}
    </section>}
  </main>;
}
