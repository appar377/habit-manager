"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { addLogAction } from "@/lib/actions";
import type { Habit } from "@/lib/store";
import { todayStr } from "@/lib/utils";
import FeedbackToast from "./FeedbackToast";
import Pressable from "./ui/Pressable";

const LAST_HABIT_KEY = "habit-manager-lastHabitId";

function getLastHabitId(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const s = sessionStorage.getItem(LAST_HABIT_KEY);
  return s && s.length > 0 ? s : fallback;
}

function setLastHabitId(id: string) {
  try {
    sessionStorage.setItem(LAST_HABIT_KEY, id);
  } catch {
    // ignore
  }
}

export default function LogForm({
  habits,
  defaultHabitId,
  initialDate,
  onSuccess,
}: {
  habits: Habit[];
  defaultHabitId: string;
  /** 予定ページなどから渡す。その日付で記録を追加するとき用。 */
  initialDate?: string;
  /** 記録送信成功後に呼ばれる（シートを閉じるなど）。 */
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [habitId, setHabitId] = useState(defaultHabitId);

  // サーバーから渡された habits が変わったあとで lastHabitId を反映（hydration 後）
  useEffect(() => {
    const last = getLastHabitId(defaultHabitId);
    if (habits.some((h) => h.id === last)) setHabitId(last);
  }, [defaultHabitId, habits]);

  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const initial = initialDate ?? todayStr();
  const [date] = useState(initial);
  const [toastFeedback, setToastFeedback] = useState<"up" | "down" | "same" | null>(null);

  const habit = habits.find((h) => h.id === habitId);
  const isExercise = habit?.type === "exercise";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!habitId) return;
    startTransition(async () => {
      const result = await addLogAction({
        date,
        habitId,
        sets: sets ? Number(sets) : undefined,
        reps: reps ? Number(reps) : undefined,
        durationMin: durationMin ? Number(durationMin) : undefined,
      });
      setLastHabitId(habitId);
      setSets("");
      setReps("");
      setDurationMin("");
      if (result?.feedback) setToastFeedback(result.feedback);
      router.refresh();
      onSuccess?.();
    });
  }

  const fillPreset = (s: number, r: number) => {
    setSets(String(s));
    setReps(String(r));
  };

  return (
    <>
      <form onSubmit={submit} className="flex flex-col gap-4 flex-1 min-h-0">
      {/* 1. 習慣：チップ選択（1タップ・視線移動なし） */}
      <div>
        <p className="text-xs text-neutral-500 mb-2">習慣</p>
        <div className="flex flex-wrap gap-2">
          {habits.map((h) => (
            <Pressable
              key={h.id}
              onClick={() => setHabitId(h.id)}
              className={`min-h-[44px] px-4 rounded-xl text-base font-medium transition-colors ${
                habitId === h.id
                  ? "bg-foreground text-background"
                  : "bg-neutral-200 dark:bg-neutral-700 text-foreground hover:bg-neutral-300 dark:hover:bg-neutral-600"
              }`}
              aria-pressed={habitId === h.id}
              aria-label={`${h.name}を選択`}
            >
              {h.name}
            </Pressable>
          ))}
        </div>
      </div>

      {/* 2. 入力：習慣タイプで最小項目のみ（縦に並べて視線は上→下のみ） */}
      {isExercise ? (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">セット × 回数</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              placeholder="10"
              className="flex-1 min-h-[48px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-background text-lg text-center"
              aria-label="セット数"
            />
            <span className="text-neutral-400 font-medium">×</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="25"
              className="flex-1 min-h-[48px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-background text-lg text-center"
              aria-label="回数"
            />
          </div>
          {habit?.targetSets != null && habit?.targetReps != null && (
            <div className="flex gap-2">
              <Pressable
                onClick={() => fillPreset(habit.targetSets!, habit.targetReps!)}
                className="text-xs text-neutral-500 underline"
              >
                目標 {habit.targetSets}×{habit.targetReps} で入力
              </Pressable>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-xs text-neutral-500 mb-2">分数</p>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            placeholder={habit?.targetMin ? String(habit.targetMin) : "90"}
            className="w-full min-h-[48px] px-4 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-background text-lg"
            aria-label="分数"
          />
        </div>
      )}

      {/* 親指圏に記録ボタンを寄せる（spacer で下に押し下げ） */}
      <div className="flex-1 min-h-[0.5rem]" aria-hidden />
      <Pressable
        type="submit"
        disabled={isPending || !habitId}
        className="w-full min-h-[48px] rounded-xl bg-foreground text-background font-semibold text-base disabled:opacity-50 active:opacity-90"
      >
        {isPending ? "記録中…" : "記録する"}
      </Pressable>
    </form>
      <FeedbackToast feedback={toastFeedback} onDone={() => setToastFeedback(null)} />
    </>
  );
}
