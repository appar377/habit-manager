import { cookies } from "next/headers";
import { ensureSchema, createUniqueFriendCode } from "@/lib/community-db";
import { usersModel } from "@/lib/models/users";
import { ensureUserStatsRow } from "@/lib/models/user-stats";

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
  const existing = await usersModel.findById(id);
  if (!existing) {
    const friendCode = await createUniqueFriendCode();
    await usersModel.insert({
      id,
      display_name: displayName,
      friend_code: friendCode,
      secret,
    });
    await ensureUserStatsRow(id);
  }
}

export async function getUserRow(id: string) {
  await ensureSchema();
  return usersModel.findById(id);
}
