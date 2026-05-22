import { chaosOptions, roleOptions } from '../lib/types.js';

export function GuessPanel({
  canGuess, guessRole, guessChaos, onRole, onChaos, onSubmit
}: {
  canGuess: boolean;
  guessRole: string;
  guessChaos: string;
  onRole: (v: string) => void;
  onChaos: (v: string) => void;
  onSubmit: () => void;
}) {
  return <>
    <select value={guessRole} onChange={(e) => onRole(e.target.value)} disabled={!canGuess}>{roleOptions.map((o) => <option key={o}>{o}</option>)}</select>
    <select value={guessChaos} onChange={(e) => onChaos(e.target.value)} disabled={!canGuess}>{chaosOptions.map((o) => <option key={o}>{o}</option>)}</select>
    <button disabled={!canGuess} onClick={onSubmit}>Submit / Edit Guess</button>
  </>;
}
