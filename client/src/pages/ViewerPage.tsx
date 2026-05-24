import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { call, useRoomState } from '../lib/socket.js';
import { WheelsPanel } from '../components/WheelsPanel.js';

export function ViewerPage({ socket, roomCode }: { socket: Socket; roomCode: string }) {
  const [payload] = useRoomState(socket);
  useEffect(() => { call(socket, 'viewer:connect', { roomCode }).catch(() => undefined); }, [socket, roomCode]);
  const publicState = payload?.publicState;
  const round = publicState?.activeRound;
  const players = publicState?.playerOrder?.map((id: string) => publicState.players[id]) ?? [];
  const revealStage = !round?.revealGuesses ? 'Before reveal' : !round?.revealSecret ? 'Guesses revealed' : 'Secret revealed';
  const rankedPlayers = [...players].sort((a: any, b: any) => b.score - a.score || a.seat - b.seat);
  const currentSpeakerName = round?.currentSpeakerId ? publicState?.players[round.currentSpeakerId]?.displayName : 'Waiting for next speaker';
  const speakerTimer = round?.speakerTimer?.remainingSec;

  return (
    <main className='app-shell viewer-layout stack-md'>
      <header className='panel viewer-header'>
        <div>
          <p className='viewer-label'>Room code</p>
          <h1 className='viewer-room'>{roomCode}</h1>
        </div>
        <div className='viewer-phase-wrap'>
          <p className='viewer-label'>Current phase</p>
          <p className='viewer-phase'>{round?.phase ?? publicState?.phase ?? '-'}</p>
          <p className='viewer-reveal'>Reveal stage: {revealStage}</p>
        </div>
      </header>

      <section className='panel viewer-prompt'>
        <p className='viewer-label'>Topic / situation</p>
        <p className='viewer-prompt-text'>{round?.topicPrompt ?? 'Waiting for teacher to start a round.'}</p>
      </section>

      <section className='panel viewer-speaker-strip'>
        <div>
          <p className='viewer-label'>Current speaker</p>
          <p className='viewer-speaker-name'>{currentSpeakerName}</p>
        </div>
        <div className='viewer-timer-block'>
          <p className='viewer-label'>Time left</p>
          <p className='viewer-timer'>{typeof speakerTimer === 'number' ? `${speakerTimer}s` : '--'}</p>
        </div>
      </section>

      <section className='panel'>
        <h2 className='viewer-section-title'>Scoreboard</h2>
        <ul className='viewer-scoreboard' aria-label='Scoreboard ranking'>
          {rankedPlayers.map((p: any, index: number) => (
            <li key={p.id} className='viewer-score-row'>
              <span className='viewer-rank'>#{index + 1}</span>
              <span className='viewer-name'>Seat {p.seat}: {p.displayName}</span>
              <span className='viewer-score'>{p.score} pts</span>
            </li>
          ))}
        </ul>
      </section>

      <section className='data-grid'>
        <WheelsPanel title='Speaker Selection Animation' spinning={Boolean(round?.speakerWheelSpinning)} items={players.map((p: any) => p.displayName)} />
        <WheelsPanel title='Follow-up Selection Animation' spinning={Boolean(round?.followUp?.wheelSpinning)} items={(round?.followUp?.requesterIds ?? []).map((id: string) => publicState.players[id]?.displayName)} />
      </section>

      {round?.revealGuesses ? (
        <section className='panel viewer-reveal-panel stack-sm'>
          <h2 className='viewer-section-title'>Guesses</h2>
          {(Object.entries(round.guesses ?? {})).length === 0 ? (
            <p className='empty-state'>No guesses submitted.</p>
          ) : (
            <ul className='viewer-reveal-list'>
              {Object.entries(round.guesses ?? {}).map(([guesserId, guess]: [string, any]) => (
                <li key={guesserId} className='viewer-reveal-item'>
                  <p className='viewer-reveal-name'>{publicState.players[guesserId]?.displayName ?? 'Unknown student'}</p>
                  <p><strong>Speaker guessed:</strong> {publicState.players[guess.speakerId]?.displayName ?? '-'}</p>
                  <p><strong>Role guess:</strong> {guess.roleGuess ?? '-'}</p>
                  <p><strong>Chaos guess:</strong> {guess.chaosGuess ?? '-'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {round?.revealSecret ? (
        <section className='panel viewer-reveal-panel stack-sm'>
          <h2 className='viewer-section-title'>Revealed role and chaos cards</h2>
          {(Object.entries(round.revealedSecretsByPlayerId ?? {})).length === 0 ? (
            <p className='empty-state'>No revealed secrets yet.</p>
          ) : (
            <ul className='viewer-reveal-list'>
              {Object.entries(round.revealedSecretsByPlayerId ?? {}).map(([playerId, secret]: [string, any]) => (
                <li key={playerId} className='viewer-reveal-item'>
                  <p className='viewer-reveal-name'>{publicState.players[playerId]?.displayName ?? 'Unknown student'}</p>
                  <p><strong>Role:</strong> {secret.roleTitle ?? '-'}</p>
                  <p><strong>Chaos card:</strong> {secret.chaosTitle ?? '-'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
