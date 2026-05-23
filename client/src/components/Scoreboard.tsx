export function Scoreboard({ players }: { players: any[] }) {
  return <ul>{players.map((p) => <li key={p.id}>Seat {p.seat}: {p.displayName} <span className='score-chip'>{p.score}</span></li>)}</ul>;
}
