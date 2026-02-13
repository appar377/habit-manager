import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type UserStatsRow = {
  user_id: string;
  log_streak: number;
  plan_streak: number;
  comeback_count: number;
  achievement_rate: number;
  updated_at: string;
};

export const userStatsModel = new BaseModel<UserStatsRow>("user_stats", [
  "user_id",
  "log_streak",
  "plan_streak",
  "comeback_count",
  "achievement_rate",
  "updated_at",
], "user_id");

export async function ensureUserStatsRow(userId: string) {
  await sql.query(
    "INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING;",
    [userId]
  );
}

export async function upsertUserStats(input: {
  userId: string;
  logStreak: number;
  planStreak: number;
  comebackCount: number;
  achievementRate: number;
}) {
  await sql.query(
    `INSERT INTO user_stats (user_id, log_streak, plan_streak, comeback_count, achievement_rate, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       log_streak = EXCLUDED.log_streak,
       plan_streak = EXCLUDED.plan_streak,
       comeback_count = EXCLUDED.comeback_count,
       achievement_rate = EXCLUDED.achievement_rate,
       updated_at = NOW();`,
    [
      input.userId,
      input.logStreak,
      input.planStreak,
      input.comebackCount,
      input.achievementRate,
    ]
  );
}
