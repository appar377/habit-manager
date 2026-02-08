"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/store";
import type { CheatDayConfig, Rival } from "@/lib/store";

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** 分数のみで記録する場合（学習など）: durationMin を渡すと start/end に変換する */
function durationToStartEnd(min: number): { start: string; end: string } {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return {
    start: "00:00",
    end: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  };
}

export async function addLogAction(form: {
  date?: string;
  habitId: string;
  sets?: number;
  reps?: number;
  start?: string;
  end?: string;
  durationMin?: number;
}): Promise<{ feedback: "up" | "down" | "same" }> {
  let start = form.start;
  let end = form.end;
  if (form.durationMin != null && form.durationMin > 0) {
    const t = durationToStartEnd(form.durationMin);
    start = t.start;
    end = t.end;
  }
  const log = store.addLog({
    date: form.date || todayStr(),
    habitId: form.habitId,
    sets: form.sets,
    reps: form.reps,
    start,
    end,
  });
  const habit = store.listHabits().find((h) => h.id === form.habitId);
  const feedback = habit ? store.getFeedback(log, habit) : "same";
  revalidatePath("/capture");
  revalidatePath("/review");
  revalidatePath("/plan");
  return { feedback };
}

export async function addHabitAction(form: {
  name: string;
  type: "exercise" | "study";
  targetSets?: number;
  targetReps?: number;
  targetMin?: number;
  scheduleEnabled?: boolean;
  scheduleRule?: "daily" | "weekly" | "interval_days";
  scheduleIntervalDays?: number;
  scheduleWeekdays?: number[];
  scheduleStart?: string;
  scheduleEnd?: string;
  priority?: number;
}) {
  const habit = store.addHabit({
    name: form.name.trim(),
    type: form.type,
    targetSets: form.targetSets,
    targetReps: form.targetReps,
    targetMin: form.targetMin,
    scheduleEnabled: form.scheduleEnabled,
    scheduleRule: form.scheduleRule,
    scheduleIntervalDays: form.scheduleIntervalDays,
    scheduleWeekdays: form.scheduleWeekdays,
    scheduleStart: form.scheduleStart,
    scheduleEnd: form.scheduleEnd,
    priority: form.priority,
  });
  revalidatePath("/habits");
  revalidatePath("/capture");
  revalidatePath("/plan");
  return { habit };
}

export async function updateHabitAction(
  id: string,
  partial: {
    name?: string;
    type?: "exercise" | "study";
    targetSets?: number;
    targetReps?: number;
    targetMin?: number;
    scheduleEnabled?: boolean;
    scheduleRule?: "daily" | "weekly" | "interval_days";
    scheduleIntervalDays?: number;
    scheduleWeekdays?: number[];
    scheduleStart?: string;
    scheduleEnd?: string;
    priority?: number;
  }
) {
  const habit = store.updateHabit(id, partial);
  revalidatePath("/habits");
  revalidatePath("/capture");
  revalidatePath("/plan");
  return { habit };
}

export async function archiveHabitAction(id: string) {
  const habit = store.archiveHabit(id);
  revalidatePath("/habits");
  revalidatePath("/capture");
  return { habit };
}

/** 時間指定なしの表示順を更新。habitIds の並びがそのまま優先度 1,2,3... になる。 */
export async function updatePlanOrderAction(orderedHabitIds: string[]): Promise<{ error?: string }> {
  orderedHabitIds.forEach((id, index) => {
    store.updateHabit(id, { priority: index + 1 });
  });
  revalidatePath("/plan");
  revalidatePath("/habits");
  return {};
}

/** /plan のTODOチェック: done=true でログ1件追加、false で当日の該当ログ削除。study は予定時間で durationMin、exercise は targetSets*targetReps で volume。 */
export async function toggleTodoCompletionAction(
  habitId: string,
  date: string,
  done: boolean,
  todo: { start: string; end: string }
): Promise<{ error?: string }> {
  const habit = store.getHabit(habitId);
  if (!habit) {
    return { error: "habit not found" };
  }
  if (done) {
    if (habit.type === "study") {
      store.addLog({
        date,
        habitId,
        start: todo.start,
        end: todo.end,
      });
    } else {
      const sets = habit.targetSets ?? 0;
      const reps = habit.targetReps ?? 0;
      store.addLog({
        date,
        habitId,
        sets: sets > 0 ? sets : undefined,
        reps: reps > 0 ? reps : undefined,
      });
    }
  } else {
    store.deleteLogByHabitAndDate(habitId, date);
  }
  revalidatePath("/plan");
  revalidatePath("/review");
  return {};
}

/** Timeline ドラッグ/リサイズで開始・終了時刻を変更したときの保存。15分未満には縮めない。 */
export async function updatePlanOverrideAction(
  date: string,
  habitId: string,
  override: { start: string; end: string }
): Promise<{ error?: string }> {
  const { clampEndToMinDuration } = await import("@/lib/time");
  const normalized = clampEndToMinDuration(override.start, override.end);
  store.setPlanOverride(date, habitId, normalized);
  revalidatePath("/plan");
  return {};
}

/** チートデイの周期・条件を設定（初回選択用）。 */
export async function setCheatDayConfigAction(config: CheatDayConfig): Promise<void> {
  store.setCheatDayConfig(config);
  revalidatePath("/capture");
  revalidatePath("/plan");
  revalidatePath("/review");
}

/** 指定日をチートデイとして使用（ストリーク維持のためその日を達成扱いにする）。 */
export async function useCheatDayAction(date: string): Promise<void> {
  store.useCheatDay(date);
  revalidatePath("/capture");
  revalidatePath("/plan");
  revalidatePath("/review");
}

/** ランキング用ライバルを追加。 */
export async function addRivalAction(input: {
  name: string;
  logStreak?: number;
  planStreak?: number;
  comebackCount?: number;
  achievementRate?: number;
}): Promise<Rival> {
  const rival = store.addRival(input);
  revalidatePath("/ranking");
  return rival;
}

/** ランキング用ライバルを更新。 */
export async function updateRivalAction(
  id: string,
  input: Partial<Pick<Rival, "name" | "logStreak" | "planStreak" | "comebackCount" | "achievementRate">>
): Promise<{ ok: boolean }> {
  const r = store.updateRival(id, input);
  revalidatePath("/ranking");
  return { ok: !!r };
}

/** ランキング用ライバルを削除。 */
export async function removeRivalAction(id: string): Promise<void> {
  store.removeRival(id);
  revalidatePath("/ranking");
}
