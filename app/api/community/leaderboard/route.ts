import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/community-db";
import { getUserProfile, listFriendsWithStats, getSelfStats } from "@/lib/repositories/community-repo";

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const secret = typeof body.secret === "string" ? body.secret : "";

  if (!userId || !secret) {
    return NextResponse.json({ error: "missing_auth" }, { status: 400 });
  }

  const profile = await getUserProfile(userId, secret);
  if (!profile) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const friends = await listFriendsWithStats(userId);
  const selfStats = await getSelfStats(userId);

  const myStats = {
    logStreak: Number(selfStats?.log_streak ?? 0),
    planStreak: Number(selfStats?.plan_streak ?? 0),
    comebackCount: Number(selfStats?.comeback_count ?? 0),
    achievementRate: Number(selfStats?.achievement_rate ?? 0),
  };

  const rivals = friends.map((r) => ({
    id: r.id,
    name: r.name,
    logStreak: r.logStreak,
    planStreak: r.planStreak,
    comebackCount: r.comebackCount,
    achievementRate: r.achievementRate,
  }));

  return NextResponse.json({
    me: { name: profile.display_name as string },
    myStats,
    rivals,
  });
}
