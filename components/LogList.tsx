import type { Log } from "@/lib/store";

type Habit = { id: string; name: string };

export default function LogList({
  logs,
  habits,
}: {
  logs: Log[];
  habits: Habit[];
}) {
  const name = (id: string) => habits.find((h) => h.id === id)?.name ?? id;

  if (logs.length === 0) {
    return (
      <p className="text-neutral-500 text-sm py-6 text-center">
        今日のログはまだありません
      </p>
    );
  }

  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {logs.map((l) => (
        <li
          key={l.id}
          className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-200/80 dark:border-neutral-700"
        >
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-medium text-foreground">{name(l.habitId)}</span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400 tabular-nums">
              {l.volume > 0 ? `${l.volume} rep` : `${l.durationMin}分`}
            </span>
          </div>
          {(l.sets != null && l.reps != null) || (l.start && l.start !== "00:00") ? (
            <div className="text-xs text-neutral-500 mt-1">
              {l.sets != null && l.reps != null && (
                <span>{l.sets}×{l.reps}</span>
              )}
              {l.start && l.start !== "00:00" && (
                <span className={l.sets != null ? " ml-2" : ""}>
                  {l.start}
                  {l.end ? `–${l.end}` : ""}
                </span>
              )}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
