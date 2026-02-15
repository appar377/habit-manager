"use server";

import { revalidatePath } from "next/cache";
import { store } from "@/lib/store";
import type { CheatDayConfig, Habit, Rival } from "@/lib/store";
import { getOrCreateUser } from "@/lib/user";
import { addHabit, updateHabit, archiveHabit, deleteHabit, addLog, deleteLogByHabitAndDate, getHabit, listLogs } from "@/lib/db-store";
import { getFeedbackResult } from "@/lib/feedback";

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
  const user = await getOrCreateUser();
  let start = form.start;
  let end = form.end;
  if (form.durationMin != null && form.durationMin > 0) {
    const t = durationToStartEnd(form.durationMin);
    start = t.start;
    end = t.end;
  }
  const date = form.date || todayStr();
  const log = await addLog(user.id, {
    date,
    habitId: form.habitId,
    sets: form.sets,
    reps: form.reps,
    start,
    end,
  });
  const habit = await getHabit(user.id, form.habitId);
  let feedback: "up" | "down" | "same" = "same";
  if (habit) {
    const prevLogs = (await listLogs(user.id))
      .filter((l) => l.habitId === form.habitId && l.id !== log.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const prev = prevLogs[0] ?? null;
    feedback = getFeedbackResult(log, prev, habit);
  }
  revalidatePath("/capture");
  revalidatePath("/review");
  revalidatePath("/plan");
  return { feedback };
}

export type AddHabitResult = { habit: Habit } | { error: string };

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
}): Promise<AddHabitResult> {
  try {
    const user = await getOrCreateUser();
    const habit = await addHabit(user.id, {
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
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return { error: message === "user_cookie_missing" ? "user_cookie_missing" : "server_error" };
  }
}

export type UpdateHabitResult = { habit: Habit | undefined } | { error: string };

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
): Promise<UpdateHabitResult> {
  try {
    const user = await getOrCreateUser();
    const habit = await updateHabit(user.id, id, partial);
    revalidatePath("/habits");
    revalidatePath("/capture");
    revalidatePath("/plan");
    return { habit };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return { error: message === "user_cookie_missing" ? "user_cookie_missing" : "server_error" };
  }
}

export async function archiveHabitAction(id: string) {
  const user = await getOrCreateUser();
  const habit = await archiveHabit(user.id, id);
  revalidatePath("/habits");
  revalidatePath("/capture");
  return { habit };
}

export type DeleteHabitResult = { ok: true } | { error: string };

export async function deleteHabitAction(id: string): Promise<DeleteHabitResult> {
  try {
    const user = await getOrCreateUser();
    const deleted = await deleteHabit(user.id, id);
    if (!deleted) return { error: "habit_not_found" };
    revalidatePath("/habits");
    revalidatePath("/capture");
    revalidatePath("/plan");
    revalidatePath("/review");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return { error: message === "user_cookie_missing" ? "user_cookie_missing" : "server_error" };
  }
}

/** 時間指定なしの表示順を更新。habitIds の並びがそのまま優先度 1,2,3... になる。 */
export async function updatePlanOrderAction(orderedHabitIds: string[]): Promise<{ error?: string }> {
  const user = await getOrCreateUser();
  for (let i = 0; i < orderedHabitIds.length; i++) {
    await updateHabit(user.id, orderedHabitIds[i], { priority: i + 1 });
  }
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
  const user = await getOrCreateUser();
  const habit = await getHabit(user.id, habitId);
  if (!habit) {
    return { error: "habit not found" };
  }
  if (done) {
    if (habit.type === "study") {
      await addLog(user.id, { date, habitId, start: todo.start, end: todo.end });
    } else {
      const sets = habit.targetSets ?? 0;
      const reps = habit.targetReps ?? 0;
      await addLog(user.id, {
        date,
        habitId,
        sets: sets > 0 ? sets : undefined,
        reps: reps > 0 ? reps : undefined,
      });
    }
  } else {
    await deleteLogByHabitAndDate(user.id, habitId, date);
  }
  revalidatePath("/plan");
  revalidatePath("/review");
  return {};
}

/** リスト表示で rep・時間などを追記・更新。該当日のその習慣のログを1件にまとめて保存。 */
export async function saveLogDetailsAction(
  habitId: string,
  date: string,
  details: { sets?: number; reps?: number; durationMin?: number; start?: string; end?: string }
): Promise<{ error?: string }> {
  const user = await getOrCreateUser();
  const habit = await getHabit(user.id, habitId);
  if (!habit) return { error: "habit not found" };
  const existing = (await listLogs(user.id, date)).find((l) => l.habitId === habitId);
  let start = details.start ?? existing?.start;
  let end = details.end ?? existing?.end;
  if (details.durationMin != null && details.durationMin > 0) {
    const t = durationToStartEnd(details.durationMin);
    start = t.start;
    end = t.end;
  }
  await deleteLogByHabitAndDate(user.id, habitId, date);
  await addLog(user.id, {
    date,
    habitId,
    sets: details.sets ?? existing?.sets,
    reps: details.reps ?? existing?.reps,
    start: start ?? undefined,
    end: end ?? undefined,
  });
  revalidatePath("/plan");
  revalidatePath("/review");
  return {};
}

/** Timeline ドラッグ/リサイズ・詳細シートで開始・終了・メモを変更したときの保存。15分未満には縮めない。 */
export async function updatePlanOverrideAction(
  date: string,
  habitId: string,
  override: { start: string; end: string; memo?: string }
): Promise<{ error?: string }> {
  const { clampEndToMinDuration } = await import("@/lib/time");
  const normalized = clampEndToMinDuration(override.start, override.end);
  store.setPlanOverride(date, habitId, { ...normalized, memo: override.memo });
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

/** 指定日をチートデイとして使用。note は任意（その日の報酬・過ごし方のメモ）。 */
export async function useCheatDayAction(date: string, note?: string): Promise<void> {
  store.useCheatDay(date, note);
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
