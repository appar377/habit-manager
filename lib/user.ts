import { cookies } from "next/headers";
import { ensureSchema, createUniqueFriendCode } from "@/lib/community-db";
import { usersModel, findUserByIdAndSecret, findUserByEmail } from "@/lib/models/users";
import { ensureUserStatsRow } from "@/lib/models/user-stats";
import { hashPassword, verifyPassword } from "@/lib/auth";

export const USER_ID_COOKIE = "hm_uid";
export const USER_SECRET_COOKIE = "hm_secret";

export async function getUserFromCookies(): Promise<{ id: string; secret: string } | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(USER_ID_COOKIE)?.value;
  const secret = cookieStore.get(USER_SECRET_COOKIE)?.value;
  if (!id || !secret) return null;
  return { id, secret };
}

/**
 * ログイン済みユーザーを返す。Cookie の id+secret が DB と一致する場合のみ。
 * 未ログイン・無効なセッションの場合は user_cookie_missing を throw。
 */
export async function getOrCreateUser(displayName?: string) {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("user_cookie_missing");
  }
  await ensureSchema();
  const row = await findUserByIdAndSecret(user.id, user.secret);
  if (!row) {
    throw new Error("user_cookie_missing");
  }
  return { id: row.id, secret: row.secret };
}

/**
 * サインアップ: メール・パスワードで新規ユーザーを作成する。
 * ログイン状態にするには呼び出し元で Cookie を設定すること。
 */
export async function createUserForSignup(params: {
  email: string;
  password: string;
  displayName: string;
}): Promise<{ id: string; secret: string }> {
  await ensureSchema();
  const email = params.email.trim().toLowerCase();
  if (!email) throw new Error("email_required");
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("email_taken");
  const passwordHash = await hashPassword(params.password);
  const id = crypto.randomUUID();
  const secret = crypto.randomUUID();
  const friendCode = await createUniqueFriendCode();
  await usersModel.insert({
    id,
    display_name: params.displayName.trim() || "ユーザー",
    friend_code: friendCode,
    secret,
    email,
    password_hash: passwordHash,
  });
  await ensureUserStatsRow(id);
  return { id, secret };
}

/**
 * ログイン: メール・パスワードを検証し、一致すればユーザーの id と secret を返す。
 * 呼び出し元で Cookie を設定すること。
 */
export async function verifyLogin(email: string, password: string): Promise<{ id: string; secret: string }> {
  await ensureSchema();
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm) throw new Error("email_required");
  const row = await findUserByEmail(emailNorm);
  if (!row || !row.password_hash) throw new Error("invalid_credentials");
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) throw new Error("invalid_credentials");
  return { id: row.id, secret: row.secret };
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
      email: null,
      password_hash: null,
    });
    await ensureUserStatsRow(id);
  }
}

export async function getUserRow(id: string) {
  await ensureSchema();
  return usersModel.findById(id);
}
