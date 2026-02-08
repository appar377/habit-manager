"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { useCheatDayAction } from "@/lib/actions";
import { todayStr } from "@/lib/utils";
import Button from "./ui/Button";

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
};

function formatShort(date: string) {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** 分析用：チートデイ解禁まであとどれだけか、プログレスバーと日別バーでやる気を出す。 */
export default function CheatDayProgress({ status, dailyRatesInCycle }: Props) {
  const [isPending, startTransition] = useTransition();
  const today = todayStr();
  const currentPercent = Math.round(status.cycleAchievementRate * 100);
  const gap = status.requiredPercent - currentPercent;
  const isClose = !status.unlocked && gap > 0 && gap <= 15;

  function useCheatDay() {
    startTransition(async () => {
      await useCheatDayAction(today);
    });
  }

  return (
    <section
      className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]"
      aria-labelledby="cheat-day-progress-title"
    >
      <h2 id="cheat-day-progress-title" className="text-xs font-semibold text-fg-muted mb-3">
        チートデイまで
      </h2>

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
          <Button
            variant="primary"
            onClick={useCheatDay}
            disabled={isPending}
          >
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

          {/* メインプログレスバー（現在の達成率。目標は右端の目盛で示す） */}
          <div>
            <div className="flex justify-between text-xs text-fg-muted mb-1">
              <span>直近の達成率</span>
              <span className="tabular-nums font-medium text-foreground">
                {currentPercent}% <span className="text-fg-muted">/ 目標 {status.requiredPercent}%</span>
              </span>
            </div>
            <div className="relative h-5 rounded-full bg-bg-subtle overflow-visible">
              <motion.div
                className="h-full rounded-full bg-primary min-w-[6px]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, currentPercent)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
              {/* 目標の目盛（達成率100%を幅として、requiredPercent の位置に線） */}
              {currentPercent < status.requiredPercent && status.requiredPercent <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-streak rounded-full shadow-sm"
                  style={{ left: `calc(${status.requiredPercent}% - 2px)` }}
                  title={`目標 ${status.requiredPercent}%`}
                  aria-hidden
                />
              )}
            </div>
            <p className="text-[10px] text-fg-muted mt-0.5 text-right">
              あと {gap}% で解禁
            </p>
          </div>

          <div className="sr-only">
            達成率 {currentPercent}%、目標 {status.requiredPercent}%。あと {gap}% で解禁。
          </div>

          {/* 周期の日別バー（左が古い） */}
          {dailyRatesInCycle.length > 0 && (
            <div>
              <p className="text-xs font-medium text-fg-muted mb-2">
                この周期の日別（{status.periodStart} ～ {status.periodEnd}）
              </p>
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
            <p className="text-xs text-primary font-medium">
              もう少し！ あと {gap}% 達成率を上げれば解禁です。
            </p>
          )}
        </div>
      )}
    </section>
  );
}
