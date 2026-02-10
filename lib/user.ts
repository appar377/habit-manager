import { cookies } from "next/headers";
import { ensureSchema, createUniqueFriendCode } from "@/lib/community-db";
import { sql } from "@/lib/db";

const USER_ID_COOKIE = "hm_uid";
const USER_SECRET_COOKIE = "hm_secret";

export async function getUserFromCookies(): Promise<{ id: string; secret: string } | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(USER_ID_COOKIE)?.value;
  const secret = cookieStore.get(USER_SECRET_COOKIE)?.value;
  if (!id || !secret) return null;
  return { id, secret };
}

export async function getOrCreateUser(displayName = "ユーザー") {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("user_cookie_missing");
  }
  await ensureUserRow(user.id, user.secret, displayName);
  return user;
}

export async function ensureUserRow(id: string, secret: string, displayName = "ユーザー") {
  await ensureSchema();
  const rows = (await sql`SELECT id FROM users WHERE id = ${id} LIMIT 1;`) as { id: string }[];
  if (rows.length === 0) {
    const friendCode = await createUniqueFriendCode();
    await sql`
      INSERT INTO users (id, display_name, friend_code, secret)
      VALUES (${id}, ${displayName}, ${friendCode}, ${secret});
    `;
    await sql`
      INSERT INTO user_stats (user_id)
      VALUES (${id})
      ON CONFLICT (user_id) DO NOTHING;
    `;
  }
}

export async function getUserRow(id: string) {
  await ensureSchema();
  const rows = await sql`
    SELECT id, display_name, friend_code, secret FROM users WHERE id = ${id} LIMIT 1;
  `;
  return rows[0] as { id: string; display_name: string; friend_code: string; secret: string } | undefined;
}
