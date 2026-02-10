import { NextResponse } from "next/server";
import { ensureUserRow } from "@/lib/user";
import { createUniqueFriendCode } from "@/lib/community-db";
import { sql } from "@/lib/db";

const USER_ID_COOKIE = "hm_uid";
const USER_SECRET_COOKIE = "hm_secret";

export async function POST(req: Request) {
  const cookies = req.headers.get("cookie") ?? "";
  const id = cookies.match(/hm_uid=([^;]+)/)?.[1];
  const secret = cookies.match(/hm_secret=([^;]+)/)?.[1];

  let userId = id;
  let userSecret = secret;

  if (!userId || !userSecret) {
    userId = crypto.randomUUID();
    userSecret = crypto.randomUUID();
  }

  await ensureUserRow(userId, userSecret);

  // ensure friend_code exists
  const rows = (await sql`SELECT friend_code FROM users WHERE id = ${userId} LIMIT 1;`) as { friend_code: string | null }[];
  if (!rows[0]?.friend_code) {
    const friendCode = await createUniqueFriendCode();
    await sql`UPDATE users SET friend_code = ${friendCode} WHERE id = ${userId};`;
  }

  const res = NextResponse.json({ ok: true });
  if (!id || !secret) {
    res.cookies.set(USER_ID_COOKIE, userId, { httpOnly: true, sameSite: "lax", path: "/" });
    res.cookies.set(USER_SECRET_COOKIE, userSecret, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}
