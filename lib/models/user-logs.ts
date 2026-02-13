import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type UserLogRow = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  sets: number | null;
  reps: number | null;
  start_time: string | null;
  end_time: string | null;
  duration_min: number;
  volume: number;
};

export const userLogsModel = new BaseModel<UserLogRow>("user_logs", [
  "id",
  "user_id",
  "habit_id",
  "date",
  "sets",
  "reps",
  "start_time",
  "end_time",
  "duration_min",
  "volume",
]);

export async function listLogsByUser(userId: string, date?: string) {
  const res = await sql.query(
    `SELECT id, user_id, habit_id, date, sets, reps, start_time, end_time, duration_min, volume
     FROM user_logs
     WHERE user_id = $1 ${date ? "AND date = $2" : ""}
     ORDER BY date ASC;`,
    date ? [userId, date] : [userId]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows ?? [];
}

export async function insertLog(row: UserLogRow) {
  await sql.query(
    `INSERT INTO user_logs (id, user_id, habit_id, date, sets, reps, start_time, end_time, duration_min, volume)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
    [
      row.id,
      row.user_id,
      row.habit_id,
      row.date,
      row.sets,
      row.reps,
      row.start_time,
      row.end_time,
      row.duration_min,
      row.volume,
    ]
  );
}

export async function deleteLogByHabitAndDate(userId: string, habitId: string, date: string) {
  const res = await sql.query(
    "DELETE FROM user_logs WHERE user_id = $1 AND habit_id = $2 AND date = $3;",
    [userId, habitId, date]
  );
  return (res as any).rowCount ?? 0;
}
