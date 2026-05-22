import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { call, useRoomState } from '../lib/socket.js';
import { Scoreboard } from '../components/Scoreboard.js';
import { TimersPanel } from '../components/TimersPanel.js';
import { WheelsPanel } from '../components/WheelsPanel.js';

export function ViewerPage({ socket, roomCode }: { socket: Socket; roomCode: string }) {
  const [payload] = useRoomState(socket);
  useEffect(() => { call(socket, 'viewer:connect', { roomCode }).catch(() => undefined); }, [socket, roomCode]);
  const publicState = payload?.publicState;
  const round = publicState?.activeRound;
  const players = publicState?.playerOrder?.map((id: string) => publicState.players[id]) ?? [];
  const revealStage = !round?.revealGuesses ? 'Before reveal' : !round?.revealSecret ? 'Guesses revealed' : 'Secret revealed';

  return <main><h1>Viewer · {roomCode}</h1>
    <p>Phase: {round?.phase ?? publicState?.phase}</p><p>Prompt: {round?.topicPrompt ?? '-'}</p><p>Reveal stage: {revealStage}</p>
    <WheelsPanel title='Speaker Selection Animation' spinning={Boolean(round?.speakerWheelSpinning)} items={players.map((p: any) => p.displayName)} />
    <WheelsPanel title='Follow-up Selection Animation' spinning={Boolean(round?.followUp?.wheelSpinning)} items={(round?.followUp?.requesterIds ?? []).map((id: string) => publicState.players[id]?.displayName)} />
    <TimersPanel prepSec={round?.prepTimer?.remainingSec} speakerSec={round?.speakerTimer?.remainingSec} speakingRunning={round?.speakerTimer?.running} />
    <Scoreboard players={players} />
    {round?.revealGuesses ? <pre>{JSON.stringify(round.guesses, null, 2)}</pre> : <p>Guesses hidden until reveal.</p>}
    {round?.revealSecret ? <pre>{JSON.stringify(round.revealedSecretsByPlayerId, null, 2)}</pre> : <p>Secrets hidden.</p>}
  </main>;
}
