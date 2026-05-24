export function HiddenAssignmentTable({ round, players }: { round: any; players: any[] }) {
  return (
    <section className='panel game-card game-card--assignments stack-sm'>
      <div className='game-card__header'>
        <h3 className='game-card__title'>Hidden assignments</h3>
        <span className='status-pill game-card__badge'>Teacher only</span>
      </div>

      <div className='game-card__body'>
        {players.length === 0 ? (
          <p className='empty-state game-card__empty game-card__empty--body'>No student assignments yet.</p>
        ) : (
          <table className='table assignment-table game-card__table'>
            <thead>
              <tr><th>Student</th><th>Role</th><th>Chaos</th><th>Rerolls</th></tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const assignment = round?.hiddenAssignmentsByPlayerId?.[p.id];
                const reroll = round?.rerollsByPlayerId?.[p.id];
                return <tr key={p.id}><td>{p.displayName}</td><td>{assignment?.roleId ?? '-'}</td><td>{assignment?.chaosCardId ?? '-'}</td><td>{reroll ? `${reroll.role ? 'role ' : ''}${reroll.chaos ? 'chaos' : ''}` : '-'}</td></tr>;
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className='game-card__footer-text'>Use this view to verify assignments and rerolls before revealing secrets.</p>
    </section>
  );
}
