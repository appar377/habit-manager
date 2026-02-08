"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { toggleTodoCompletionAction, saveLogDetailsAction } from "@/lib/actions";
import type { Habit } from "@/lib/store";
import type { Log } from "@/lib/store";
import CheckCircle from "./ui/CheckCircle";
import Input from "./ui/Input";
import Label from "./ui/Label";
import PlanEventDetailSheet from "./PlanEventDetailSheet";

type TodoItem = {
  habitId: string;
  title: string;
  start: string;
  end: string;
  /** 時間指定ありなら true（バッジ表示用） */
  hasTime?: boolean;
};

type PlanOverrideItem = { start: string; end: string; memo?: string };

type Props = {
  todos: TodoItem[];
  completedIds: Set<string>;
  date: string;
  habits: Habit[];
  logsByHabitId: Map<string, Log>;
  overridesForDate?: Record<string, PlanOverrideItem>;
};

export default function PlanListView({
  todos,
  completedIds,
  date,
  habits,
  logsByHabitId,
  overridesForDate = {},
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<{ habitId: string; start: string; end: string } | null>(null);

  const handleToggle = (todo: TodoItem) => {
    const completed = completedIds.has(todo.habitId);
    startTransition(async () => {
      await toggleTodoCompletionAction(todo.habitId, date, !completed, {
        start: todo.start,
        end: todo.end,
      });
      router.refresh();
    });
  };

  const handleSaveDetails = (
    habitId: string,
    todo: TodoItem,
    payload: { sets?: number; reps?: number; durationMin?: number }
  ) => {
    setSavingId(habitId);
    startTransition(async () => {
      await saveLogDetailsAction(habitId, date, {
        ...payload,
        start: todo.start || undefined,
        end: todo.end || undefined,
      });
      setSavingId(null);
      router.refresh();
    });
  };

  if (todos.length === 0) {
    return (
      <p className="text-sm text-fg-muted py-6 text-center">
        この日の予定はありません
      </p>
    );
  }

  return (
    <>
    <ul className="space-y-3 min-w-0">
      {todos.map((todo) => {
        const habit = habits.find((h) => h.id === todo.habitId);
        const log = logsByHabitId.get(todo.habitId);
        const completed = completedIds.has(todo.habitId);
        const isExercise = habit?.type === "exercise";

        return (
          <PlanListRow
            key={todo.habitId}
            todo={todo}
            completed={completed}
            isExercise={!!isExercise}
            log={log}
            isSaving={savingId === todo.habitId}
            onToggle={() => handleToggle(todo)}
            onSave={(payload) => handleSaveDetails(todo.habitId, todo, payload)}
            onOpenDetail={() => setDetailState({ habitId: todo.habitId, start: todo.start, end: todo.end })}
          />
        );
      })}
    </ul>

    {detailState && habits.length > 0 && (
      <PlanEventDetailSheet
        open={true}
        onClose={() => setDetailState(null)}
        habits={habits}
        habitId={detailState.habitId}
        date={date}
        initialStart={detailState.start}
        initialEnd={detailState.end}
        initialMemo={overridesForDate[detailState.habitId]?.memo}
      />
    )}
  </>
  );
}

function PlanListRow({
  todo,
  completed,
  isExercise,
  log,
  isSaving,
  onToggle,
  onSave,
  onOpenDetail,
}: {
  todo: TodoItem;
  completed: boolean;
  isExercise: boolean;
  log: Log | undefined;
  isSaving: boolean;
  onToggle: () => void;
  onSave: (p: { sets?: number; reps?: number; durationMin?: number }) => void;
  onOpenDetail: () => void;
}) {
  const [sets, setSets] = useState(log?.sets?.toString() ?? "");
  const [reps, setReps] = useState(log?.reps?.toString() ?? "");
  const [durationMin, setDurationMin] = useState(
    log?.durationMin ? String(log.durationMin) : ""
  );

  useEffect(() => {
    setSets(log?.sets?.toString() ?? "");
    setReps(log?.reps?.toString() ?? "");
    setDurationMin(log?.durationMin ? String(log.durationMin) : "");
  }, [log?.sets, log?.reps, log?.durationMin]);

  const handleBlur = () => {
    if (isExercise) {
      const s = sets.trim() ? Number(sets) : undefined;
      const r = reps.trim() ? Number(reps) : undefined;
      if (s !== undefined || r !== undefined) onSave({ sets: s, reps: r });
    } else {
      const d = durationMin.trim() ? Number(durationMin) : undefined;
      if (d !== undefined && d > 0) onSave({ durationMin: d });
    }
  };

  return (
    <li className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-3 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3 min-w-0">
        <div className="shrink-0 mt-0.5">
          <CheckCircle
            checked={completed}
            onToggle={onToggle}
            aria-label={completed ? "完了を解除" : "完了にする"}
            aria-pressed={completed}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenDetail}
            className="flex items-center gap-2 flex-wrap text-left w-full rounded-[var(--radius-md)] -m-1 p-1 hover:bg-bg-subtle active:bg-bg-subtle transition-colors"
          >
            <span className="font-medium text-foreground">{todo.title}</span>
            {todo.hasTime && (
              <span className="text-xs text-fg-muted tabular-nums">
                {todo.start}–{todo.end}
              </span>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {isExercise ? (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">セット</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    onBlur={handleBlur}
                    className="w-16 h-9 text-sm tabular-nums"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">rep</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="—"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    onBlur={handleBlur}
                    className="w-16 h-9 text-sm tabular-nums"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Label className="text-xs">分</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="—"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  onBlur={handleBlur}
                  className="w-20 h-9 text-sm tabular-nums"
                />
              </div>
            )}
            {isSaving && (
              <span className="text-xs text-fg-muted">保存中…</span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
