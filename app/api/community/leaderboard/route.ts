import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/community-db";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const secret = typeof body.secret === "string" ? body.secret : "";

  if (!userId || !secret) {
    return NextResponse.json({ error: "missing_auth" }, { status: 400 });
  }

  const userRows = (await sql`
    SELECT id, display_name FROM users WHERE id = ${userId} AND secret = ${secret} LIMIT 1;
  `) as { id: string; display_name: string }[];
  if (userRows.length === 0) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const friends = (await sql`
    SELECT u.id, u.display_name, s.log_streak, s.plan_streak, s.comeback_count, s.achievement_rate
    FROM user_friends f
    JOIN users u ON u.id = f.friend_id
    LEFT JOIN user_stats s ON s.user_id = u.id
    WHERE f.user_id = ${userId};
  `) as {
    id: string;
    display_name: string;
    log_streak: number | null;
    plan_streak: number | null;
    comeback_count: number | null;
    achievement_rate: number | null;
  }[];

  const selfStatsRows = (await sql`
    SELECT log_streak, plan_streak, comeback_count, achievement_rate
    FROM user_stats WHERE user_id = ${userId} LIMIT 1;
  `) as {
    log_streak: number | null;
    plan_streak: number | null;
    comeback_count: number | null;
    achievement_rate: number | null;
  }[];

  const myStats = {
    logStreak: Number(selfStatsRows[0]?.log_streak ?? 0),
    planStreak: Number(selfStatsRows[0]?.plan_streak ?? 0),
    comebackCount: Number(selfStatsRows[0]?.comeback_count ?? 0),
    achievementRate: Number(selfStatsRows[0]?.achievement_rate ?? 0),
  };

  const rivals = friends.map((r) => ({
    id: r.id as string,
    name: r.display_name as string,
    logStreak: Number(r.log_streak ?? 0),
    planStreak: Number(r.plan_streak ?? 0),
    comebackCount: Number(r.comeback_count ?? 0),
    achievementRate: Number(r.achievement_rate ?? 0),
  }));

  return NextResponse.json({
    me: { name: userRows[0].display_name as string },
    myStats,
    rivals,
  });
}
