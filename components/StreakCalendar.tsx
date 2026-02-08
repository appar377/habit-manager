"use client";

import { motion } from "framer-motion";

export type DayActivity = {
  date: string;
  logged: boolean;
  achieved: boolean;
};

type Props = {
  /** 古い日付から順の直近 N 日分（通常 42 = 6週間） */
  days: DayActivity[];
  /** 今日の日付（YYYY-MM-DD）。今日のセルを枠で強調する。 */
  today: string;
  /** 表示モード: 記録のみ / 達成のみ / 両方（記録=オレンジ、達成=緑） */
  mode?: "log" | "plan" | "both";
  /** コンパクト表示（セル小さめ・凡例なし）。予定ページ用。 */
  compact?: boolean;
};

function formatShort(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export default function StreakCalendar({ days, today, mode = "both", compact = false }: Props) {
  const cols = 7;
  const cellSize = compact ? "max-w-[10px]" : "max-w-[20px]";
  const cellRound = compact ? "rounded-[2px]" : "rounded-[4px]";

  return (
    <motion.div
      className={`rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted shadow-[var(--shadow-card)] ${compact ? "p-2" : "p-3"}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-fg-muted uppercase tracking-wider">活動カレンダー</span>
          <span className="text-[10px] text-fg-subtle">直近{days.length}日 · 左が古い</span>
        </div>
      )}

      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {days.map((d, i) => {
          const isToday = d.date === today;
          const hasLog = d.logged;
          const hasPlan = d.achieved;
          const showLog = mode === "log" || mode === "both";
          const showPlan = mode === "plan" || mode === "both";
          const active = (showLog && hasLog) || (showPlan && hasPlan);
          const achievedOnly = showPlan && hasPlan && !(showLog && hasLog);
          const loggedOnly = showLog && hasLog && !(showPlan && hasPlan);
          const both = showLog && hasPlan && hasLog && hasPlan;

          let bg = "bg-bg-subtle";
          if (active) {
            if (mode === "both" && both) bg = "bg-primary";
            else if (achievedOnly || (mode === "plan")) bg = "bg-primary";
            else if (loggedOnly || (mode === "log")) bg = "bg-streak";
            else bg = "bg-primary";
          }

          return (
            <motion.div
              key={d.date}
              title={`${formatShort(d.date)}${hasLog ? " 記録あり" : ""}${hasPlan ? " 達成" : ""}`}
              className={`
                aspect-square w-full ${cellSize} ${cellRound} ${bg}
                ${isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-bg-muted" : ""}
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: compact ? 0 : i * 0.008, duration: 0.2 }}
            />
          );
        })}
      </div>

      {mode === "both" && !compact && (
        <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-fg-muted">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-primary" />
            達成
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-fg-muted">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-streak" />
            記録
          </span>
        </div>
      )}
    </motion.div>
  );
}
