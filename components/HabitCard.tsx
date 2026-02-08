"use client";

import { useState } from "react";
import type { Habit } from "@/lib/store";
import type { ScheduleRule } from "@/lib/store";
import TrendIcon from "./TrendIcon";
import HabitForm from "./HabitForm";
import Button from "./ui/Button";

type Trend = "up" | "down" | "same";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function targetLabel(habit: Habit): string {
  if (habit.type === "exercise") {
    if (habit.targetSets != null && habit.targetReps != null) {
      return `${habit.targetSets}×${habit.targetReps} rep`;
    }
    if (habit.targetMin != null) return `${habit.targetMin}分`;
    return "—";
  }
  if (habit.targetMin != null) return `${habit.targetMin}分`;
  return "—";
}

function scheduleFrequencyLabel(habit: Habit): string {
  if (!habit.scheduleEnabled || !habit.scheduleRule) return "予定なし";
  const rule = habit.scheduleRule as ScheduleRule;
  if (rule === "daily") return "毎日";
  if (rule === "weekly") {
    const w = habit.scheduleWeekdays ?? [];
    if (w.length === 0) return "週?";
    if (w.length === 7) return "毎日";
    return "週" + w.map((d) => WEEKDAY_LABELS[d]).join("");
  }
  if (rule === "interval_days") {
    const n = habit.scheduleIntervalDays ?? 1;
    return n === 1 ? "毎日" : `${n}日ごと`;
  }
  return "予定あり";
}

type Props = {
  habit: Habit;
  trend: Trend;
  onUpdate: () => void;
};

export default function HabitCard({ habit, trend, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                habit.type === "exercise"
                  ? "bg-accent-muted text-accent"
                  : "bg-primary-soft text-primary"
              }`}
            >
              {habit.type === "exercise" ? "運動" : "学習"}
            </span>
            {habit.scheduleEnabled && (
              <span className="text-[10px] font-medium text-fg-muted">予定に表示</span>
            )}
          </div>
          <p className="font-semibold text-foreground truncate">{habit.name}</p>
          <p className="text-xs text-fg-muted mt-0.5">
            目標 {targetLabel(habit)}
            {habit.scheduleEnabled && (
              <span className="ml-2"> · {scheduleFrequencyLabel(habit)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrendIcon trend={trend} className="shrink-0" />
          <Button variant="ghost" className="min-h-[36px] px-2 text-xs" onClick={() => setEditing(true)}>
            編集
          </Button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-fg-muted mb-3">編集</h3>
          <HabitForm
            initial={habit}
            onSuccess={() => {
              setEditing(false);
              onUpdate();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </li>
  );
}
