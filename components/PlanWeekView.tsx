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
  weekDates: string[];
  summaries: DaySummary[];
  today: string;
};

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function PlanWeekView({ weekDates, summaries, today }: Props) {
  const byDate = new Map(summaries.map((s) => [s.date, s]));

  return (
    <section>
      <h2 className="sr-only">週間予定</h2>
      <div className="grid grid-cols-7 gap-2 min-w-0">
        {weekDates.map((date, i) => {
          const s = byDate.get(date);
          const scheduled = s?.scheduled ?? 0;
          const completed = s?.completed ?? 0;
          const isToday = date === today;
          const d = new Date(date + "T12:00:00Z");
          const dayLabel = DAY_LABELS[d.getUTCDay()];

          return (
            <Link
              key={date}
              href={`/plan?date=${date}`}
              className={`rounded-[var(--radius-xl)] border-2 p-3 min-w-0 flex flex-col gap-1 transition-colors ${
                isToday
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-bg-subtle hover:border-primary/50"
              }`}
            >
              <span className="text-xs text-fg-muted">
                {dayLabel} {formatDateJa(date).replace("月", "/").replace("日", "")}
              </span>
              {isToday && (
                <span className="text-[10px] font-medium text-primary">今日</span>
              )}
              <span className="text-lg font-bold text-foreground tabular-nums">
                {completed}/{scheduled}
              </span>
              <span className="text-xs text-fg-muted">完了</span>
              {scheduled > 0 && (
                <div className="mt-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(completed / scheduled) * 100}%` }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
      <p className="text-xs text-fg-muted mt-3">日付をタップするとその日の予定（日表示）に移動します。</p>
    </section>
  );
}
