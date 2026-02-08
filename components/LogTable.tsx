type Log = {
  id: string;
  date: string;
  habitId: string;
  sets?: number;
  reps?: number;
  start?: string;
  end?: string;
  durationMin: number;
  volume: number;
};
type Habit = { id: string; name: string };

export default function LogTable({ logs, habits }: { logs: Log[]; habits: Habit[] }) {
  const habitName = (id: string) => habits.find((h) => h.id === id)?.name ?? id;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["date", "habit", "sets", "reps", "start", "end", "duration", "volume"].map((h) => (
            <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {logs.map((l) => (
          <tr key={l.id}>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.date}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{habitName(l.habitId)}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.sets ?? ""}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.reps ?? ""}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.start ?? ""}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.end ?? ""}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.durationMin}</td>
            <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{l.volume}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
