export function Scoreboard({ players }: { players: any[] }) {
  return (
    <section className='panel game-card game-card--scoreboard stack-sm'>
      <div className='game-card__header'>
        <h3 className='game-card__title'>Scoreboard</h3>
        <span className='status-pill game-card__badge'>{players.length} students</span>
      </div>
      {players.length === 0 ? (
        <p className='empty-state game-card__empty'>No scores yet. Students will appear after joining.</p>
      ) : (
        <ul className='scoreboard-list'>
          {players.map((p) => (
            <li key={p.id} className='scoreboard-list__item'>
              <div>
                <p className='scoreboard-list__name'>Seat {p.seat}: {p.displayName}</p>
              </div>
              <span className='score-chip scoreboard-list__score'>{p.score}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
