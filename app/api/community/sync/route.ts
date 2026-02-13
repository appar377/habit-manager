import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/community-db";
import { getStoreForUserId } from "@/lib/app-data";
import { validateUser } from "@/lib/repositories/community-repo";
import { upsertUserStats } from "@/lib/models/user-stats";
import { updateUserDisplayName } from "@/lib/models/users";

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

  const valid = await validateUser(userId, secret);
  if (!valid) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const { store } = await getStoreForUserId(userId);
  const stats = computeStats(store);

  await upsertUserStats({
    userId,
    logStreak: stats.logStreak,
    planStreak: stats.planStreak,
    comebackCount: stats.comebackCount,
    achievementRate: stats.achievementRate,
  });

  if (displayName) {
    await updateUserDisplayName(userId, displayName);
  }

  return NextResponse.json({ ok: true, stats });
}
