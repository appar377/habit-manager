import { NextResponse } from "next/server";
import { ensureSchema, normalizeFriendCode } from "@/lib/community-db";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const secret = typeof body.secret === "string" ? body.secret : "";
  const rawCode = typeof body.friendCode === "string" ? body.friendCode : "";
  const friendCode = normalizeFriendCode(rawCode);

  if (!userId || !secret || !friendCode) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const userRows = (await sql`
    SELECT id FROM users WHERE id = ${userId} AND secret = ${secret} LIMIT 1;
  `) as { id: string }[];
  if (userRows.length === 0) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const friendRows = (await sql`
    SELECT id FROM users WHERE friend_code = ${friendCode} LIMIT 1;
  `) as { id: string }[];
  if (friendRows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const friendId = friendRows[0].id as string;
  if (friendId === userId) {
    return NextResponse.json({ error: "self_add" }, { status: 400 });
  }

  await sql`
    INSERT INTO user_friends (user_id, friend_id)
    VALUES (${userId}, ${friendId})
    ON CONFLICT DO NOTHING;
  `;
  await sql`
    INSERT INTO user_friends (user_id, friend_id)
    VALUES (${friendId}, ${userId})
    ON CONFLICT DO NOTHING;
  `;

  return NextResponse.json({ ok: true });
}
