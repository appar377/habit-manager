import type { Habit, HabitType, ScheduleRule, Log } from "@/lib/store";
import { ensureSchema } from "@/lib/community-db";
import {
  type UserHabitRow,
  listHabitsByUser,
  getHabitByUser,
  userHabitsModel,
} from "@/lib/models/user-habits";
import {
  type UserScheduleRow,
  listSchedulesByHabitIds,
  getScheduleByHabit,
  upsertSchedule,
  updateScheduleByHabit,
} from "@/lib/models/user-schedules";
import {
  type UserLogRow,
  listLogsByUser,
  insertLog,
  deleteLogByHabitAndDate as deleteLogByHabitAndDateModel,
} from "@/lib/models/user-logs";

type HabitRow = {
  id: string;
  name: string;
  type: HabitType;
  target_sets: number | null;
  target_reps: number | null;
  target_min: number | null;
  archived: boolean;
  priority: number | null;
  schedule_enabled: boolean | null;
  rule: ScheduleRule | null;
  interval_days: number | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
};

function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    targetSets: row.target_sets ?? undefined,
    targetReps: row.target_reps ?? undefined,
    targetMin: row.target_min ?? undefined,
    archived: row.archived ?? false,
    scheduleEnabled: row.schedule_enabled ?? false,
    scheduleRule: row.rule ?? undefined,
    scheduleIntervalDays: row.interval_days ?? undefined,
    scheduleWeekdays: row.weekdays ?? undefined,
    scheduleStart: row.start_time ?? undefined,
    scheduleEnd: row.end_time ?? undefined,
    priority: row.priority ?? undefined,
  };
}

export async function listHabits(userId: string, includeArchived = false): Promise<Habit[]> {
  await ensureSchema();
  const habitRows = await listHabitsByUser(userId, includeArchived);
  const schedules = await listSchedulesByHabitIds(habitRows.map((h: UserHabitRow) => h.id));
  const scheduleByHabit = new Map<string, UserScheduleRow>(
    schedules.map((s: UserScheduleRow) => [s.habit_id, s])
  );
  const rows: HabitRow[] = habitRows.map((h: UserHabitRow) => {
    const s = scheduleByHabit.get(h.id);
    return {
      id: h.id,
      name: h.name,
      type: h.type as HabitType,
      target_sets: h.target_sets,
      target_reps: h.target_reps,
      target_min: h.target_min,
      archived: h.archived,
      priority: h.priority,
      schedule_enabled: s?.enabled ?? false,
      rule: (s?.rule ?? null) as ScheduleRule | null,
      interval_days: s?.interval_days ?? null,
      weekdays: s?.weekdays ?? null,
      start_time: s?.start_time ?? null,
      end_time: s?.end_time ?? null,
    };
  });
  return rows.map(rowToHabit);
}

export async function getHabit(userId: string, habitId: string): Promise<Habit | undefined> {
  await ensureSchema();
  const habit = await getHabitByUser(userId, habitId);
  if (!habit) return undefined;
  const schedule = await getScheduleByHabit(habitId);
  const row: HabitRow = {
    id: habit.id,
    name: habit.name,
    type: habit.type as HabitType,
    target_sets: habit.target_sets,
    target_reps: habit.target_reps,
    target_min: habit.target_min,
    archived: habit.archived,
    priority: habit.priority,
    schedule_enabled: schedule?.enabled ?? false,
    rule: (schedule?.rule ?? null) as ScheduleRule | null,
    interval_days: schedule?.interval_days ?? null,
    weekdays: schedule?.weekdays ?? null,
    start_time: schedule?.start_time ?? null,
    end_time: schedule?.end_time ?? null,
  };
  return rowToHabit(row);
}

export async function addHabit(userId: string, input: {
  name: string;
  type: HabitType;
  targetSets?: number;
  targetReps?: number;
  targetMin?: number;
  scheduleEnabled?: boolean;
  scheduleRule?: ScheduleRule;
  scheduleIntervalDays?: number;
  scheduleWeekdays?: number[];
  scheduleStart?: string;
  scheduleEnd?: string;
  priority?: number;
}): Promise<Habit> {
  await ensureSchema();
  const habitId = crypto.randomUUID();
  await userHabitsModel.insert({
    id: habitId,
    user_id: userId,
    name: input.name.trim(),
    type: input.type,
    target_sets: input.targetSets ?? null,
    target_reps: input.targetReps ?? null,
    target_min: input.targetMin ?? null,
    archived: false,
    priority: input.priority ?? null,
  });
  await upsertSchedule({
    id: crypto.randomUUID(),
    habit_id: habitId,
    rule: input.scheduleRule ?? "daily",
    interval_days: input.scheduleIntervalDays ?? null,
    weekdays: input.scheduleWeekdays ?? null,
    start_time: input.scheduleStart ?? null,
    end_time: input.scheduleEnd ?? null,
    enabled: input.scheduleEnabled ?? false,
  });
  const habit = await getHabit(userId, habitId);
  if (!habit) throw new Error("habit_insert_failed");
  return habit;
}

export async function updateHabit(
  userId: string,
  habitId: string,
  partial: {
    name?: string;
    type?: HabitType;
    targetSets?: number;
    targetReps?: number;
    targetMin?: number;
    archived?: boolean;
    scheduleEnabled?: boolean;
    scheduleRule?: ScheduleRule;
    scheduleIntervalDays?: number;
    scheduleWeekdays?: number[];
    scheduleStart?: string;
    scheduleEnd?: string;
    priority?: number;
  }
): Promise<Habit | undefined> {
  await ensureSchema();
  const current = await getHabit(userId, habitId);
  if (!current) return undefined;

  await userHabitsModel.updateById(habitId, {
    name: partial.name ?? current.name,
    type: partial.type ?? current.type,
    target_sets: partial.targetSets ?? current.targetSets ?? null,
    target_reps: partial.targetReps ?? current.targetReps ?? null,
    target_min: partial.targetMin ?? current.targetMin ?? null,
    archived: partial.archived ?? current.archived ?? false,
    priority: partial.priority ?? current.priority ?? null,
  });

  await updateScheduleByHabit(habitId, {
    enabled: partial.scheduleEnabled ?? current.scheduleEnabled ?? false,
    rule: partial.scheduleRule ?? current.scheduleRule ?? "daily",
    interval_days: partial.scheduleIntervalDays ?? current.scheduleIntervalDays ?? null,
    weekdays: partial.scheduleWeekdays ?? current.scheduleWeekdays ?? null,
    start_time: partial.scheduleStart ?? current.scheduleStart ?? null,
    end_time: partial.scheduleEnd ?? current.scheduleEnd ?? null,
  });

  return getHabit(userId, habitId);
}

export async function archiveHabit(userId: string, habitId: string): Promise<Habit | undefined> {
  return updateHabit(userId, habitId, { archived: true });
}

export async function listLogs(userId: string, date?: string): Promise<Log[]> {
  await ensureSchema();
  const rows = await listLogsByUser(userId, date);
  return rows.map((row: UserLogRow) => ({
    id: row.id,
    date: row.date,
    habitId: row.habit_id,
    sets: row.sets ?? undefined,
    reps: row.reps ?? undefined,
    start: row.start_time ?? undefined,
    end: row.end_time ?? undefined,
    durationMin: row.duration_min,
    volume: row.volume,
  }));
}

export async function addLog(userId: string, input: {
  date: string;
  habitId: string;
  sets?: number;
  reps?: number;
  start?: string;
  end?: string;
}): Promise<Log> {
  await ensureSchema();
  const durationMin = input.start && input.end ? diffMinutes(input.start, input.end) : 0;
  const volume = (input.sets ?? 0) * (input.reps ?? 0);
  const id = crypto.randomUUID();
  await insertLog({
    id,
    user_id: userId,
    habit_id: input.habitId,
    date: input.date,
    sets: input.sets ?? null,
    reps: input.reps ?? null,
    start_time: input.start ?? null,
    end_time: input.end ?? null,
    duration_min: durationMin,
    volume,
  });
  return {
    id,
    date: input.date,
    habitId: input.habitId,
    sets: input.sets,
    reps: input.reps,
    start: input.start,
    end: input.end,
    durationMin,
    volume,
  };
}

export async function deleteLogByHabitAndDate(userId: string, habitId: string, date: string): Promise<number> {
  await ensureSchema();
  return deleteLogByHabitAndDateModel(userId, habitId, date);
}

function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return Math.max(0, e - s);
}
