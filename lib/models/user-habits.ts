import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type UserHabitRow = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  target_sets: number | null;
  target_reps: number | null;
  target_min: number | null;
  archived: boolean;
  priority: number | null;
  created_at: string;
};

export const userHabitsModel = new BaseModel<UserHabitRow>("user_habits", [
  "id",
  "user_id",
  "name",
  "type",
  "target_sets",
  "target_reps",
  "target_min",
  "archived",
  "priority",
  "created_at",
]);

export async function listHabitsByUser(userId: string, includeArchived: boolean) {
  const res = await sql.query(
    `SELECT id, user_id, name, type, target_sets, target_reps, target_min, archived, priority, created_at
     FROM user_habits
     WHERE user_id = $1 ${includeArchived ? "" : "AND archived = FALSE"}
     ORDER BY COALESCE(priority, 99) ASC, created_at ASC;`,
    [userId]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows ?? [];
}

export async function getHabitByUser(userId: string, habitId: string) {
  const res = await sql.query(
    `SELECT id, user_id, name, type, target_sets, target_reps, target_min, archived, priority, created_at
     FROM user_habits
     WHERE user_id = $1 AND id = $2
     LIMIT 1;`,
    [userId, habitId]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows?.[0] ?? null;
}

/** 習慣を削除（user_schedules / user_logs は FK CASCADE で自動削除） */
export async function deleteHabitByUser(userId: string, habitId: string): Promise<boolean> {
  const res = await sql.query(
    "DELETE FROM user_habits WHERE id = $1 AND user_id = $2;",
    [habitId, userId]
  );
  const rowCount = (res as { rowCount?: number }).rowCount;
  return typeof rowCount === "number" && rowCount > 0;
}
