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
    SELECT id FROM users WHERE id = ${userId} AND secret = ${secret} LIMIT 1;
  `) as { id: string }[];
  if (userRows.length === 0) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const rows = (await sql`
    SELECT u.id, u.display_name, s.log_streak, s.plan_streak, s.comeback_count, s.achievement_rate
    FROM user_friends f
    JOIN users u ON u.id = f.friend_id
    LEFT JOIN user_stats s ON s.user_id = u.id
    WHERE f.user_id = ${userId}
    ORDER BY u.display_name ASC;
  `) as {
    id: string;
    display_name: string;
    log_streak: number | null;
    plan_streak: number | null;
    comeback_count: number | null;
    achievement_rate: number | null;
  }[];

  const friends = rows.map((r) => ({
    id: r.id as string,
    name: r.display_name as string,
    logStreak: Number(r.log_streak ?? 0),
    planStreak: Number(r.plan_streak ?? 0),
    comebackCount: Number(r.comeback_count ?? 0),
    achievementRate: Number(r.achievement_rate ?? 0),
  }));

  return NextResponse.json({ friends });
}
