"use client";

import { useState, useTransition } from "react";
import { archiveHabitAction } from "@/lib/actions";
import type { Habit } from "@/lib/store";
import TrendIcon from "./TrendIcon";
import HabitForm from "./HabitForm";
import Pressable from "./ui/Pressable";

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
      return `${habit.targetSets}×${habit.targetReps}`;
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
      <li className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-100 dark:bg-neutral-800/50 opacity-75">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-foreground">{habit.name}</p>
            <p className="text-xs text-neutral-500">アーカイブ済み</p>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50/50 dark:bg-neutral-800/50">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-medium text-foreground">{habit.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {habit.type === "exercise" ? "運動" : "学習"} · 目標 {targetLabel(habit)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TrendIcon trend={trend} className="shrink-0" />
          <Pressable
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-500 underline min-h-[32px] px-2"
          >
            編集
          </Pressable>
          <Pressable
            onClick={handleArchive}
            disabled={isPending}
            className="text-xs text-neutral-500 underline min-h-[32px] px-2 disabled:opacity-50"
          >
            アーカイブ
          </Pressable>
        </div>
      </div>
      {editing && (
        <div className="mt-4">
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
