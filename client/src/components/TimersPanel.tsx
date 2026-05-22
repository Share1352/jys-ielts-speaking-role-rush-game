export function TimersPanel({ prepSec, speakerSec, speakingRunning }: { prepSec?: number; speakerSec?: number; speakingRunning?: boolean }) {
  return <div>
    <p>Prep timer: {prepSec ?? 0}s</p>
    <p>Speaker timer: {speakerSec ?? 0}s {speakingRunning ? '🟢 Live' : '⏸️ Stopped'}</p>
  </div>;
}
