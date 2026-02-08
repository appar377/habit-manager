"use client";

import { useTransition } from "react";
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

type Props = {
  status: Status;
};

/** チートデイの解禁状況と「取得」ボタン。 */
export default function CheatDayStatus({ status }: Props) {
  const [isPending, startTransition] = useTransition();
  const today = todayStr();
  const ratePercent = Math.round(status.cycleAchievementRate * 100);

  function useCheatDay() {
    startTransition(async () => {
      await useCheatDayAction(today);
    });
  }

  return (
    <section
      className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-3 shadow-[var(--shadow-card)]"
      aria-labelledby="cheat-day-status-title"
    >
      <h2 id="cheat-day-status-title" className="text-xs font-semibold text-fg-muted mb-2">
        チートデイ
      </h2>
      {status.usedInPeriod ? (
        <p className="text-sm text-fg-muted">
          この周期ではすでにチートデイを使用しました。次の周期で達成率を維持するとまた解禁されます。
        </p>
      ) : status.unlocked ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-primary">解禁！</span>
          <span className="text-xs text-fg-muted">
            直近の達成率 {ratePercent}%（目標 {status.requiredPercent}%）
          </span>
          <Button
            variant="primary"
            className="shrink-0"
            onClick={useCheatDay}
            disabled={isPending}
          >
            {isPending ? "取得中…" : "今日をチートデイにする"}
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-foreground">
            直近の達成率 <strong>{ratePercent}%</strong> / 目標 {status.requiredPercent}%
            （{status.periodStart} ～ {status.periodEnd}、予定あり {status.periodDaysWithSchedule} 日）
          </p>
          <p className="text-xs text-fg-muted mt-0.5">
            達成率を {status.requiredPercent}% 以上に維持するとチートデイが解禁されます。その日はストリークが途切れません。
          </p>
        </div>
      )}
    </section>
  );
}
