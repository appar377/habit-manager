"use client";

import { useState, useTransition } from "react";
import type { Habit } from "@/lib/store";
import type { ScheduleRule } from "@/lib/store";
import { deleteHabitAction } from "@/lib/actions";
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

function scheduleTimeLabel(habit: Habit): string {
  if (!habit.scheduleEnabled) return "";
  if (!habit.scheduleStart || !habit.scheduleEnd) return "";
  return `${habit.scheduleStart}–${habit.scheduleEnd}`;
}

type Props = {
  habit: Habit;
  trend: Trend;
  onUpdate: () => void;
  onDeleted?: (habitId: string) => void;
};

export default function HabitCard({ habit, trend, onUpdate, onDeleted }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteHabitAction(habit.id);
      if ("ok" in result && result.ok) {
        setConfirmDelete(false);
        onDeleted?.(habit.id);
      }
    });
  }

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
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg-subtle text-fg-muted">
                予定ON
              </span>
            )}
          </div>
          <p className="font-semibold text-foreground truncate">{habit.name}</p>
          <p className="text-xs text-fg-muted mt-0.5">
            目標 {targetLabel(habit)}
            {habit.scheduleEnabled && (
              <>
                <span className="ml-2">· {scheduleFrequencyLabel(habit)}</span>
                {scheduleTimeLabel(habit) && <span className="ml-2">· {scheduleTimeLabel(habit)}</span>}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            className="min-h-[36px] px-2 text-xs relative z-10 pointer-events-auto"
            onClick={() => setEditing(true)}
          >
            編集
          </Button>
          {confirmDelete ? (
            <span className="flex items-center gap-1 text-xs">
              <Button
                variant="danger"
                className="min-h-[36px] px-2 text-xs"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "削除中…" : "削除する"}
              </Button>
              <Button
                variant="ghost"
                className="min-h-[36px] px-2 text-xs"
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
              >
                キャンセル
              </Button>
            </span>
          ) : (
            <Button
              variant="ghost"
              className="min-h-[36px] px-2 text-xs text-fg-muted hover:text-danger"
              onClick={() => setConfirmDelete(true)}
            >
              削除
            </Button>
          )}
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
