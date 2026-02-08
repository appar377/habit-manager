"use client";

type DayItem = {
  date: string;
  scheduled: number;
  completed: number;
  rate: number;
};

type Props = {
  days: DayItem[];
  /** 日付の表示形式（例: "2/1"） */
  formatLabel?: (date: string) => string;
};

/** 日別の達成率を横並びバーで表示（直近7日など）。 */
export default function DailyRateBar({
  days,
  formatLabel = (d) => {
    const [y, m, day] = d.split("-");
    return `${Number(m)}/${Number(day)}`;
  },
}: Props) {
  return (
    <div className="flex gap-1">
      {days.map((d) => (
        <div
          key={d.date}
          className="flex-1 flex flex-col items-center gap-1"
          title={`${d.date}: ${d.completed}/${d.scheduled} 完了`}
        >
          <div className="w-full h-16 rounded-t-md bg-bg-subtle overflow-hidden flex flex-col justify-end">
            <div
              className="w-full bg-primary transition-all min-h-[2px]"
              style={{ height: `${Math.min(100, d.rate * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-fg-muted tabular-nums">
            {formatLabel(d.date)}
          </span>
        </div>
      ))}
    </div>
  );
}
