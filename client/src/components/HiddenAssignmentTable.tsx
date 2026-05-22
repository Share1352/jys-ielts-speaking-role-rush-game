export function HiddenAssignmentTable({ round, players }: { round: any; players: any[] }) {
  return <table><thead><tr><th>Student</th><th>Role</th><th>Chaos</th><th>Rerolls</th></tr></thead><tbody>
    {players.map((p) => {
      const assignment = round?.hiddenAssignmentsByPlayerId?.[p.id];
      const reroll = round?.rerollsByPlayerId?.[p.id];
      return <tr key={p.id}><td>{p.displayName}</td><td>{assignment?.roleId ?? '-'}</td><td>{assignment?.chaosCardId ?? '-'}</td><td>{reroll ? `${reroll.role ? 'role ' : ''}${reroll.chaos ? 'chaos' : ''}` : '-'}</td></tr>;
    })}
  </tbody></table>;
}
