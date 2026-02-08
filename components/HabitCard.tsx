"use client";

import { useState, useTransition } from "react";
import { archiveHabitAction } from "@/lib/actions";
import type { Habit } from "@/lib/store";
import TrendIcon from "./TrendIcon";
import HabitForm from "./HabitForm";
import Button from "./ui/Button";

type Trend = "up" | "down" | "same";

type Props = {
  habit: Habit;
  trend: Trend;
  onArchive: () => void;
  onUpdate: () => void;
};

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

export default function HabitCard({ habit, trend, onArchive, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      await archiveHabitAction(habit.id);
      onArchive();
    });
  }

  if (habit.archived) {
    return (
      <li className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-subtle p-4 opacity-80">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-foreground">{habit.name}</p>
            <span className="inline-block mt-1 text-[10px] font-medium text-fg-muted bg-bg-muted px-2 py-0.5 rounded-md">
              アーカイブ済み
            </span>
          </div>
        </div>
      </li>
    );
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
              <span className="text-[10px] font-medium text-fg-muted">予定に表示</span>
            )}
          </div>
          <p className="font-semibold text-foreground truncate">{habit.name}</p>
          <p className="text-xs text-fg-muted mt-0.5">目標 {targetLabel(habit)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrendIcon trend={trend} className="shrink-0" />
          <div className="flex gap-1">
            <Button variant="ghost" className="min-h-[36px] px-2 text-xs" onClick={() => setEditing(true)}>
              編集
            </Button>
            <Button
              variant="ghost"
              className="min-h-[36px] px-2 text-xs text-fg-muted hover:text-danger"
              onClick={handleArchive}
              disabled={isPending}
            >
              アーカイブ
            </Button>
          </div>
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
