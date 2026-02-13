import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type UserScheduleRow = {
  id: string;
  habit_id: string;
  rule: string;
  interval_days: number | null;
  weekdays: number[] | null;
  start_time: string | null;
  end_time: string | null;
  enabled: boolean;
};

export const userSchedulesModel = new BaseModel<UserScheduleRow>("user_schedules", [
  "id",
  "habit_id",
  "rule",
  "interval_days",
  "weekdays",
  "start_time",
  "end_time",
  "enabled",
]);

export async function upsertSchedule(row: UserScheduleRow) {
  await sql.query(
    `INSERT INTO user_schedules (id, habit_id, rule, interval_days, weekdays, start_time, end_time, enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT DO NOTHING;`,
    [
      row.id,
      row.habit_id,
      row.rule,
      row.interval_days,
      row.weekdays,
      row.start_time,
      row.end_time,
      row.enabled,
    ]
  );
}

export async function updateScheduleByHabit(
  habitId: string,
  patch: Partial<UserScheduleRow>
) {
  const keys = Object.keys(patch);
  if (keys.length === 0) return;
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  const values = keys.map((key) => (patch as any)[key]);
  values.push(habitId);
  await sql.query(
    `UPDATE user_schedules SET ${setClause} WHERE habit_id = $${keys.length + 1};`,
    values
  );
}

export async function getScheduleByHabit(habitId: string) {
  const res = await sql.query(
    `SELECT id, habit_id, rule, interval_days, weekdays, start_time, end_time, enabled
     FROM user_schedules WHERE habit_id = $1 LIMIT 1;`,
    [habitId]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows?.[0] ?? null;
}

export async function listSchedulesByHabitIds(habitIds: string[]) {
  if (habitIds.length === 0) return [];
  const placeholders = habitIds.map((_, index) => `$${index + 1}`).join(", ");
  const res = await sql.query(
    `SELECT id, habit_id, rule, interval_days, weekdays, start_time, end_time, enabled
     FROM user_schedules
     WHERE habit_id IN (${placeholders});`,
    habitIds
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows ?? [];
}
