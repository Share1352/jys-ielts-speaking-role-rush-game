import { chaosLabel, roleLabel } from '../lib/cardCatalog.js';

export function GuessPanel({ canGuess, guessRole, guessChaos, roleOptions, chaosOptions, onRole, onChaos, onSubmit }: { canGuess: boolean; guessRole: string; guessChaos: string; roleOptions: string[]; chaosOptions: string[]; onRole: (v: string) => void; onChaos: (v: string) => void; onSubmit: () => void; }) {
  const isDisabled = !canGuess;

  return (
    <section className='panel game-card game-card--guess stack-sm'>
      <div className='game-card__header'>
        <h3 className='game-card__title'>Guess speaker cards</h3>
        <span className={`status-pill game-card__badge ${canGuess ? 'game-card__badge--live' : 'game-card__badge--locked'}`}>
          {canGuess ? 'Inputs open' : 'Inputs locked'}
        </span>
      </div>

      {!canGuess && (
        <p className='empty-state game-card__empty'>Guessing is locked because the speaker timer is not running or has already stopped.</p>
      )}

      <label className='form-field stack-sm'>
        <span className='form-field__label'>Speaker role guess</span>
        <select className='select form-field__control' value={guessRole} onChange={(e) => onRole(e.target.value)} disabled={isDisabled || roleOptions.length === 0}>
          {roleOptions.map((o) => <option key={o} value={o}>{roleLabel(o)}</option>)}
        </select>
      </label>

      <label className='form-field stack-sm'>
        <span className='form-field__label'>Speaker chaos card guess</span>
        <select className='select form-field__control' value={guessChaos} onChange={(e) => onChaos(e.target.value)} disabled={isDisabled || chaosOptions.length === 0}>
          {chaosOptions.map((o) => <option key={o} value={o}>{chaosLabel(o)}</option>)}
        </select>
      </label>

      <button className='btn btn--primary guess-submit' disabled={isDisabled || !guessRole || !guessChaos} onClick={onSubmit}>Submit / Edit Guess</button>
    </section>
  );
}
