import { chaosLabel, roleLabel } from '../lib/cardCatalog.js';

export function GuessPanel({
  canGuess,
  guessRole,
  guessChaos,
  roleOptions,
  chaosOptions,
  onRole,
  onChaos,
  onSubmit
}: {
  canGuess: boolean;
  guessRole: string;
  guessChaos: string;
  roleOptions: string[];
  chaosOptions: string[];
  onRole: (v: string) => void;
  onChaos: (v: string) => void;
  onSubmit: () => void;
}) {
  return <div style={{ display: 'grid', gap: 8, maxWidth: 720 }}>
    <label>
      Speaker role guess
      <select value={guessRole} onChange={(e) => onRole(e.target.value)} disabled={!canGuess || roleOptions.length === 0} style={{ display: 'block', width: '100%', marginTop: 4 }}>
        {roleOptions.map((o) => <option key={o} value={o}>{roleLabel(o)}</option>)}
      </select>
    </label>
    <label>
      Speaker chaos card guess
      <select value={guessChaos} onChange={(e) => onChaos(e.target.value)} disabled={!canGuess || chaosOptions.length === 0} style={{ display: 'block', width: '100%', marginTop: 4 }}>
        {chaosOptions.map((o) => <option key={o} value={o}>{chaosLabel(o)}</option>)}
      </select>
    </label>
    <button disabled={!canGuess || !guessRole || !guessChaos} onClick={onSubmit}>Submit / Edit Guess</button>
  </div>;
}
