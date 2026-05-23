export function TimersPanel({ prepSec, speakerSec, speakingRunning }: { prepSec?: number; speakerSec?: number; speakingRunning?: boolean }) {
  return <div>
    <p className='timer'>Prep timer: {prepSec ?? 0}s</p>
    <p className='timer'>Speaker timer: {speakerSec ?? 0}s <span className='status-pill'>{speakingRunning ? '🟢 Live' : '⏸️ Stopped'}</span></p>
  </div>;
}
