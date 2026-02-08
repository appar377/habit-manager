"use client";

import Link from "next/link";
import { formatDateJa } from "@/lib/utils";

type DaySummary = {
  date: string;
  scheduled: number;
  completed: number;
  rate: number;
};

type Props = {
  year: number;
  month: number;
  selectedDate: string;
  today: string;
  cells: (string | null)[];
  summaries: DaySummary[];
};

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function PlanMonthView({
  year,
  month,
  selectedDate,
  today,
  cells,
  summaries,
}: Props) {
  const byDate = new Map(summaries.map((s) => [s.date, s]));
  const currentYear = new Date().getFullYear();
  const monthLabel = year !== currentYear ? `${year}年${month}月` : `${month}月`;

  return (
    <section>
      <h2 className="sr-only">{monthLabel}のカレンダー</h2>
      <p className="text-sm font-semibold text-foreground mb-3">{monthLabel}</p>
      <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-subtle p-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_LABELS.map((label) => (
            <span key={label} className="text-xs text-fg-muted py-1">
              {label}
            </span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={`empty-${i}`} />;
            const s = byDate.get(d);
            const completed = s?.completed ?? 0;
            const scheduled = s?.scheduled ?? 0;
            const isSelected = d === selectedDate;
            const isToday = d === today;
            const dayNum = new Date(d + "T12:00:00Z").getUTCDate();

            return (
              <Link
                key={d}
                href={`/plan?date=${d}`}
                className={`flex flex-col items-center justify-center min-h-[52px] rounded-[var(--radius-md)] text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-contrast"
                    : isToday
                      ? "ring-2 ring-primary text-primary bg-primary-soft/50"
                      : "text-foreground hover:bg-bg-muted"
                }`}
              >
                <span className="font-medium">{dayNum}</span>
                {scheduled > 0 && (
                  <span className={`text-xs tabular-nums ${isSelected ? "text-primary-contrast/90" : "text-fg-muted"}`}>
                    {completed}/{scheduled}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-fg-muted mt-3">日付をタップするとその日の予定（日表示）に移動します。</p>
    </section>
  );
}
