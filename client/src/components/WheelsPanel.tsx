export function WheelsPanel({ title, items, spinning }: { title: string; items: string[]; spinning?: boolean }) {
  return (
    <section className='panel game-card game-card--wheel stack-sm'>
      <div className='game-card__header'>
        <h3 className='game-card__title'>{title}</h3>
        <span className='status-pill game-card__badge'>{spinning ? 'Spinning' : 'Ready'}</span>
      </div>
      {items.length === 0 ? (
        <p className='empty-state game-card__empty'>No participants available for this wheel.</p>
      ) : (
        <ul className='wheel-list'>
          {items.map((item) => <li key={item} className='wheel-list__item'>{item}</li>)}
        </ul>
      )}
    </section>
  );
}
