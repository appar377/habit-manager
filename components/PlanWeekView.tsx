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
      <div className="-mx-4 px-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max snap-x snap-mandatory pb-2">
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
              className={`snap-start w-[140px] rounded-[var(--radius-xl)] border-2 p-3 min-w-0 flex flex-col gap-2 transition-colors shadow-[var(--shadow-card)] ${
                isToday
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-bg-muted hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[999px] ${
                  isToday ? "bg-primary text-primary-contrast" : "bg-bg-subtle text-fg-muted"
                }`}>
                  {dayLabel}
                </span>
                {isToday && <span className="text-[10px] font-medium text-primary">今日</span>}
              </div>
              <span className="text-xs text-fg-muted">
                {formatDateJa(date).replace("月", "/").replace("日", "")}
              </span>
              <div className="mt-1">
                {scheduled > 0 ? (
                  <>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {completed}/{scheduled}
                    </span>
                    <span className="text-xs text-fg-muted ml-1">完了</span>
                    <div className="mt-2 h-2 rounded-full bg-border/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(completed / scheduled) * 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-fg-subtle">予定なし</span>
                )}
              </div>
            </Link>
          );
        })}
        </div>
      </div>
      <p className="text-xs text-fg-muted mt-3">日付をタップするとその日の予定（日表示）に移動します。</p>
    </section>
  );
}
