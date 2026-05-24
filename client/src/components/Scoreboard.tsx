export function Scoreboard({ players }: { players: any[] }) {
  return (
    <section className='panel game-card game-card--scoreboard stack-sm'>
      <div className='game-card__header'>
        <h3 className='game-card__title'>Scoreboard</h3>
        <span className='status-pill game-card__badge'>{players.length} students</span>
      </div>
      <div className='game-card__body'>
        {players.length === 0 ? (
          <p className='empty-state game-card__empty game-card__empty--body'>No scores yet. Students will appear after joining.</p>
        ) : (
          <ul className='scoreboard-list game-card__list'>
            {players.map((p) => (
              <li key={p.id} className='scoreboard-list__item game-card__list-item'>
                <div>
                  <p className='scoreboard-list__name'>Seat {p.seat}: {p.displayName}</p>
                </div>
                <span className='score-chip scoreboard-list__score'>{p.score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className='game-card__footer-text'>Live points update after rerolls, guesses, and teacher bonus awards.</p>
    </section>
  );
}
