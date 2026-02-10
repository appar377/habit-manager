import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/community-db";
import { sql } from "@/lib/db";
import { getStoreForUserId } from "@/lib/app-data";

const ACHIEVEMENT_DAYS = 7;

function computeStats(store: Awaited<ReturnType<typeof getStoreForUserId>>["store"]) {
  const logStreak = store.getStreakDays();
  const planStreak = store.getPlanStreakDays();
  const comebackCount = store.getLogComebackCount();
  const dailyRates = store.getDailyAchievementRates(ACHIEVEMENT_DAYS);
  const totalScheduled = dailyRates.reduce((a, d) => a + d.scheduled, 0);
  const totalCompleted = dailyRates.reduce((a, d) => a + d.completed, 0);
  const achievementRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;
  return { logStreak, planStreak, comebackCount, achievementRate };
}

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const secret = typeof body.secret === "string" ? body.secret : "";
  const displayName = typeof body.displayName === "string" && body.displayName.trim()
    ? body.displayName.trim()
    : null;

  if (!userId || !secret) {
    return NextResponse.json({ error: "missing_auth" }, { status: 400 });
  }

  const userRows = (await sql`
    SELECT id FROM users WHERE id = ${userId} AND secret = ${secret} LIMIT 1;
  `) as { id: string }[];
  if (userRows.length === 0) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const { store } = await getStoreForUserId(userId);
  const stats = computeStats(store);

  await sql`
    INSERT INTO user_stats (user_id, log_streak, plan_streak, comeback_count, achievement_rate, updated_at)
    VALUES (${userId}, ${stats.logStreak}, ${stats.planStreak}, ${stats.comebackCount}, ${stats.achievementRate}, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      log_streak = EXCLUDED.log_streak,
      plan_streak = EXCLUDED.plan_streak,
      comeback_count = EXCLUDED.comeback_count,
      achievement_rate = EXCLUDED.achievement_rate,
      updated_at = NOW();
  `;

  if (displayName) {
    await sql`
      UPDATE users SET display_name = ${displayName} WHERE id = ${userId};
    `;
  }

  return NextResponse.json({ ok: true, stats });
}
