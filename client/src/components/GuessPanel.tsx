import { chaosLabel, roleLabel } from '../lib/cardCatalog.js';

export function GuessPanel({ canGuess, guessRole, guessChaos, roleOptions, chaosOptions, onRole, onChaos, onSubmit }: { canGuess: boolean; guessRole: string; guessChaos: string; roleOptions: string[]; chaosOptions: string[]; onRole: (v: string) => void; onChaos: (v: string) => void; onSubmit: () => void; }) {
  return <div className='stack-sm'>
    <label>
      Speaker role guess
      <select className='select' value={guessRole} onChange={(e) => onRole(e.target.value)} disabled={!canGuess || roleOptions.length === 0}>
        {roleOptions.map((o) => <option key={o} value={o}>{roleLabel(o)}</option>)}
      </select>
    </label>
    <label>
      Speaker chaos card guess
      <select className='select' value={guessChaos} onChange={(e) => onChaos(e.target.value)} disabled={!canGuess || chaosOptions.length === 0}>
        {chaosOptions.map((o) => <option key={o} value={o}>{chaosLabel(o)}</option>)}
      </select>
    </label>
    <button className='btn btn--primary' disabled={!canGuess || !guessRole || !guessChaos} onClick={onSubmit}>Submit / Edit Guess</button>
  </div>;
}
