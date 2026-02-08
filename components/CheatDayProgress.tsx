"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useCheatDayAction } from "@/lib/actions";
import { todayStr } from "@/lib/utils";
import type { CheatDayUsage } from "@/lib/store";
import Button from "./ui/Button";
import Input from "./ui/Input";

type Status = {
  unlocked: boolean;
  cycleAchievementRate: number;
  periodDaysWithSchedule: number;
  requiredPercent: number;
  usedInPeriod: boolean;
  periodStart: string;
  periodEnd: string;
};

type DayItem = {
  date: string;
  scheduled: number;
  completed: number;
  rate: number;
};

type Props = {
  status: Status;
  /** この周期の日別達成率（左が古い = periodStart 側）。予定0の日は rate=0 で含める。 */
  dailyRatesInCycle: DayItem[];
  /** 過去のチートデイ使用履歴（メモ付き）。 */
  history?: CheatDayUsage[];
};

function formatShort(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** 分析用：チートデイ解禁まであとどれだけか、プログレスバーと日別バーでやる気を出す。 */
function formatDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${y}/${Number(m)}/${Number(d)}`;
}

export default function CheatDayProgress({ status, dailyRatesInCycle, history = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const today = todayStr();
  const currentPercent = Math.round(status.cycleAchievementRate * 100);
  const gap = status.requiredPercent - currentPercent;
  const isClose = !status.unlocked && gap > 0 && gap <= 15;

  function useCheatDay() {
    startTransition(async () => {
      await useCheatDayAction(today, note.trim() || undefined);
      setNote("");
    });
  }

  return (
    <section
      className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]"
      aria-labelledby="cheat-day-progress-title"
    >
      <h2 id="cheat-day-progress-title" className="sr-only">チートデイまで</h2>

      {status.usedInPeriod ? (
        <p className="text-sm text-fg-muted">
          この周期ではすでにチートデイを使用しました。次の周期で達成率を維持するとまた解禁されます。
        </p>
      ) : status.unlocked ? (
        <div className="space-y-3">
          <p className="text-lg font-bold text-primary">解禁！ 🎉</p>
          <p className="text-sm text-fg-muted">
            直近の達成率 <strong className="text-foreground">{currentPercent}%</strong>
            （目標 {status.requiredPercent}%）をクリアしました。
          </p>
          <div>
            <label className="block text-xs text-fg-muted mb-1">この日のメモ（任意）</label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 好きなものを食べた"
              className="text-sm"
            />
          </div>
          <Button variant="primary" onClick={useCheatDay} disabled={isPending}>
            {isPending ? "取得中…" : "今日をチートデイにする"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* やる気メッセージ */}
          <p className="text-sm font-semibold text-foreground">
            {gap > 0 ? (
              <>あと <span className="text-primary text-base">{gap}%</span> でチートデイ解禁！</>
            ) : (
              "達成率を維持して解禁を目指そう"
            )}
          </p>

          {/* プログレスバー */}
          <div>
            <div className="flex justify-between text-xs text-fg-muted mb-1">
              <span>達成率</span>
              <span className="tabular-nums">{currentPercent}% / 目標 {status.requiredPercent}%</span>
            </div>
            <div className="relative h-5 rounded-full bg-bg-subtle overflow-visible">
              <motion.div
                className="h-full rounded-full bg-primary min-w-[6px]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, currentPercent)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
              {currentPercent < status.requiredPercent && status.requiredPercent <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-streak rounded-full"
                  style={{ left: `calc(${status.requiredPercent}% - 2px)` }}
                  title={`目標 ${status.requiredPercent}%`}
                  aria-hidden
                />
              )}
            </div>
          </div>

          <div className="sr-only">
            達成率 {currentPercent}%、目標 {status.requiredPercent}%。あと {gap}% で解禁。
          </div>

          {dailyRatesInCycle.length > 0 && (
            <div>
              <p className="text-xs text-fg-muted mb-1.5">周期の日別</p>
              <div className="flex gap-1">
                {dailyRatesInCycle.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${d.date}: ${d.completed}/${d.scheduled} 完了`}
                  >
                    <div className="w-full h-12 rounded-t-md bg-bg-subtle overflow-hidden flex flex-col justify-end">
                      <div
                        className="w-full bg-primary transition-all min-h-[2px]"
                        style={{ height: `${Math.min(100, d.rate * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-fg-muted tabular-nums">
                      {formatShort(d.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isClose && (
            <p className="text-xs text-primary font-medium">あと {gap}% で解禁です</p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-fg-muted mb-1.5">過去のチートデイ</p>
          <ul className="space-y-1 text-sm">
            {[...history].reverse().slice(0, 5).map((u) => (
              <li key={u.date} className="text-foreground">
                <span className="tabular-nums">{formatDate(u.date)}</span>
                {u.note && <span className="text-fg-muted ml-2">— {u.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
