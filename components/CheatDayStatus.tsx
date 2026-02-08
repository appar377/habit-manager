"use client";

import { useState, useTransition } from "react";
import { useCheatDayAction } from "@/lib/actions";
import { todayStr } from "@/lib/utils";
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

type Props = {
  status: Status;
};

/** チートデイの解禁状況と「取得」ボタン。取得時に任意でメモ（報酬の内容など）を付けられる。 */
export default function CheatDayStatus({ status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const today = todayStr();
  const ratePercent = Math.round(status.cycleAchievementRate * 100);

  function useCheatDay() {
    startTransition(async () => {
      await useCheatDayAction(today, note.trim() || undefined);
      setNote("");
    });
  }

  const isCompact = !status.unlocked && (status.usedInPeriod || (status.requiredPercent - ratePercent > 0));

  return (
    <section
      className={`rounded-[var(--radius-lg)] border border-border bg-bg-subtle ${isCompact ? "px-3 py-2" : "p-3"} shadow-[var(--shadow-card)]`}
      aria-labelledby="cheat-day-status-title"
    >
      <h2 id="cheat-day-status-title" className={isCompact ? "sr-only" : "text-xs font-semibold text-fg-muted mb-2"}>
        チートデイ
      </h2>
      {status.usedInPeriod ? (
        <p className="text-sm text-fg-muted">この周期は使用済み。次の周期で達成率を維持すると解禁されます。</p>
      ) : status.unlocked ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-primary">解禁！</span>
            <span className="text-xs text-fg-muted">
              直近の達成率 {ratePercent}%（目標 {status.requiredPercent}%）
            </span>
          </div>
          <div>
            <label className="block text-xs text-fg-muted mb-1">この日のメモ（任意）</label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 好きなものを食べた、お休みの日"
              className="text-sm"
            />
          </div>
          <Button variant="primary" onClick={useCheatDay} disabled={isPending}>
            {isPending ? "取得中…" : "今日をチートデイにする"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-foreground">
          あと <strong className="text-primary">{status.requiredPercent - ratePercent}%</strong> で解禁
          <span className="text-fg-muted font-normal">（直近 {ratePercent}% / 目標 {status.requiredPercent}%）</span>
        </p>
      )}
    </section>
  );
}
