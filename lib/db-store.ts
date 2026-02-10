import { sql } from "@/lib/db";
import type { Habit, HabitType, ScheduleRule, Log } from "@/lib/store";
import { ensureSchema } from "@/lib/community-db";

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
  const rows = await sql`
    SELECT h.id, h.name, h.type, h.target_sets, h.target_reps, h.target_min, h.archived, h.priority,
           s.enabled as schedule_enabled, s.rule, s.interval_days, s.weekdays, s.start_time, s.end_time
    FROM user_habits h
    LEFT JOIN user_schedules s ON s.habit_id = h.id
    WHERE h.user_id = ${userId} ${includeArchived ? sql`` : sql`AND h.archived = FALSE`}
    ORDER BY COALESCE(h.priority, 99) ASC, h.created_at ASC;
  `;
  return (rows as HabitRow[]).map(rowToHabit);
}

export async function getHabit(userId: string, habitId: string): Promise<Habit | undefined> {
  await ensureSchema();
  const rows = await sql`
    SELECT h.id, h.name, h.type, h.target_sets, h.target_reps, h.target_min, h.archived, h.priority,
           s.enabled as schedule_enabled, s.rule, s.interval_days, s.weekdays, s.start_time, s.end_time
    FROM user_habits h
    LEFT JOIN user_schedules s ON s.habit_id = h.id
    WHERE h.user_id = ${userId} AND h.id = ${habitId}
    LIMIT 1;
  `;
  const typed = rows as HabitRow[];
  return typed[0] ? rowToHabit(typed[0]) : undefined;
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
  await sql`
    INSERT INTO user_habits (id, user_id, name, type, target_sets, target_reps, target_min, archived, priority)
    VALUES (
      ${habitId},
      ${userId},
      ${input.name.trim()},
      ${input.type},
      ${input.targetSets ?? null},
      ${input.targetReps ?? null},
      ${input.targetMin ?? null},
      FALSE,
      ${input.priority ?? null}
    );
  `;
  await sql`
    INSERT INTO user_schedules (id, habit_id, rule, interval_days, weekdays, start_time, end_time, enabled)
    VALUES (
      ${crypto.randomUUID()},
      ${habitId},
      ${input.scheduleRule ?? "daily"},
      ${input.scheduleIntervalDays ?? null},
      ${input.scheduleWeekdays ?? null},
      ${input.scheduleStart ?? null},
      ${input.scheduleEnd ?? null},
      ${input.scheduleEnabled ?? false}
    )
    ON CONFLICT DO NOTHING;
  `;
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

  await sql`
    UPDATE user_habits
    SET
      name = ${partial.name ?? current.name},
      type = ${partial.type ?? current.type},
      target_sets = ${partial.targetSets ?? current.targetSets ?? null},
      target_reps = ${partial.targetReps ?? current.targetReps ?? null},
      target_min = ${partial.targetMin ?? current.targetMin ?? null},
      archived = ${partial.archived ?? current.archived ?? false},
      priority = ${partial.priority ?? current.priority ?? null}
    WHERE id = ${habitId} AND user_id = ${userId};
  `;

  await sql`
    UPDATE user_schedules
    SET
      enabled = ${partial.scheduleEnabled ?? current.scheduleEnabled ?? false},
      rule = ${partial.scheduleRule ?? current.scheduleRule ?? "daily"},
      interval_days = ${partial.scheduleIntervalDays ?? current.scheduleIntervalDays ?? null},
      weekdays = ${partial.scheduleWeekdays ?? current.scheduleWeekdays ?? null},
      start_time = ${partial.scheduleStart ?? current.scheduleStart ?? null},
      end_time = ${partial.scheduleEnd ?? current.scheduleEnd ?? null}
    WHERE habit_id = ${habitId};
  `;

  return getHabit(userId, habitId);
}

export async function archiveHabit(userId: string, habitId: string): Promise<Habit | undefined> {
  return updateHabit(userId, habitId, { archived: true });
}

export async function listLogs(userId: string, date?: string): Promise<Log[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT id, date, habit_id as "habitId", sets, reps, start, end, duration_min as "durationMin", volume
    FROM user_logs
    WHERE user_id = ${userId} ${date ? sql`AND date = ${date}` : sql``}
    ORDER BY date ASC;
  `;
  return rows as Log[];
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
  await sql`
    INSERT INTO user_logs (id, user_id, habit_id, date, sets, reps, start, end, duration_min, volume)
    VALUES (
      ${id},
      ${userId},
      ${input.habitId},
      ${input.date},
      ${input.sets ?? null},
      ${input.reps ?? null},
      ${input.start ?? null},
      ${input.end ?? null},
      ${durationMin},
      ${volume}
    );
  `;
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
  const res = await sql`
    DELETE FROM user_logs WHERE user_id = ${userId} AND habit_id = ${habitId} AND date = ${date};
  `;
  // @neondatabase/serverless returns rowCount on res
  return (res as unknown as { rowCount?: number }).rowCount ?? 0;
}

function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return Math.max(0, e - s);
}
