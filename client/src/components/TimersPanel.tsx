export function TimersPanel({ prepSec, speakerSec, speakingRunning }: { prepSec?: number; speakerSec?: number; speakingRunning?: boolean }) {
  return (
    <section className='panel game-card game-card--timers stack-sm'>
      <div className='game-card__header'>
        <h3 className='game-card__title'>Timers</h3>
        <span className={`status-pill game-card__badge ${speakingRunning ? 'game-card__badge--live' : 'game-card__badge--idle'}`}>
          {speakingRunning ? 'Live speaking' : 'Not live'}
        </span>
      </div>

      <div className='game-card__body game-card__body--stack'>
        <div className='timer-block timer-block--prep'>
          <p className='timer-block__label'>Prep phase</p>
          <p className='timer-block__value'>{prepSec ?? 0}s</p>
        </div>

        <div className={`timer-block ${speakingRunning ? 'timer-block--live' : 'timer-block--paused'}`}>
          <p className='timer-block__label'>Speaker timer</p>
          <p className='timer-block__value'>{speakerSec ?? 0}s</p>
        </div>
      </div>
      <p className='game-card__footer-text'>Guesses can only be submitted while the speaker timer is running.</p>
    </section>
  );
}
