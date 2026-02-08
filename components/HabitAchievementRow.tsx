"use client";

type Props = {
  name: string;
  completedDays: number;
  scheduledDays: number;
  rate: number;
};

/** 習慣1行：名前と達成率バー。 */
export default function HabitAchievementRow({
  name,
  completedDays,
  scheduledDays,
  rate,
}: Props) {
  const pct = Math.round(rate * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-foreground truncate">{name}</span>
        <span className="text-xs text-fg-muted shrink-0 tabular-nums">
          {completedDays}/{scheduledDays} 日
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-subtle overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
