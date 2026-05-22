export function WheelsPanel({ title, items, spinning }: { title: string; items: string[]; spinning?: boolean }) {
  return <section>
    <h3>{title}</h3>
    <p>{spinning ? '🎡 Spinning...' : 'Ready'}</p>
    <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </section>;
}
