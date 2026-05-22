import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { bonusCategories, type GuessResult } from '../lib/types.js';
import { call, callWithAck, useRoomState } from '../lib/socket.js';
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
  const round = publicState?.activeRound;
  const players = useMemo(() => publicState?.playerOrder?.map((id: string) => publicState.players[id]) ?? [], [publicState]);
  const run = (event: string, extras: object = {}) => call(socket, event, { roomCode, hostToken, ...extras }).catch((e: Error) => setError(e.message));

  return <main><h1>Teacher Dashboard · {roomCode}</h1><p>{error}</p>
    <p>Reveal stage: {!round?.revealGuesses ? 'Before reveal' : !round?.revealSecret ? 'Guesses revealed' : 'Secret revealed'}</p>
    <button onClick={() => run('teacher:spinSpeaker')}>Spin Speaker Wheel</button>
    <button onClick={() => run('teacher:spinFollowUpWheel')}>Spin Follow-up Wheel</button>
    <WheelsPanel title='Speaker Selection' spinning={Boolean(round?.speakerWheelSpinning)} items={players.map((p: any) => p.displayName)} />
    <WheelsPanel title='Follow-up Selection' spinning={Boolean(round?.followUp?.wheelSpinning)} items={(round?.followUp?.requesterIds ?? []).map((id: string) => publicState.players[id]?.displayName)} />
    <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
    <HiddenAssignmentTable round={round} players={players} />
    <Scoreboard players={players} />
    <button onClick={() => run('teacher:revealGuesses')}>Reveal Guesses</button><button onClick={() => run('teacher:revealSecret')}>Reveal Secret</button>
    {(round?.guesses ?? []).map((g: any) => <div key={`${g.guesserPlayerId}-${g.targetSpeakerId}`}>{(['exact', 'partial', 'miss'] as GuessResult[]).map((r) => <button key={r} onClick={() => run('teacher:scoreGuess', { guesserId: g.guesserPlayerId, roleResult: r, chaosResult: 'miss' })}>Role {r}</button>)}</div>)}
    {round?.currentSpeakerId && bonusCategories.map((b) => <button key={b.id} onClick={() => run('teacher:setSpeakerBonus', { speakerId: round.currentSpeakerId, category: b.id })}>{b.label}</button>)}
  </main>;
}
