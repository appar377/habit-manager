import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type UserRow = {
  id: string;
  display_name: string;
  friend_code: string;
  secret: string;
  email: string | null;
  password_hash: string | null;
  created_at: string;
};

export const usersModel = new BaseModel<UserRow>("users", [
  "id",
  "display_name",
  "friend_code",
  "secret",
  "email",
  "password_hash",
  "created_at",
]);

export async function findUserByIdAndSecret(id: string, secret: string) {
  const res = await sql.query(
    "SELECT id, display_name, friend_code, secret, email, password_hash, created_at FROM users WHERE id = $1 AND secret = $2 LIMIT 1;",
    [id, secret]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows?.[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const res = await sql.query(
    "SELECT id, display_name, friend_code, secret, email, password_hash, created_at FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1;",
    [email]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows?.[0] ?? null;
}

export async function findUserByFriendCode(friendCode: string) {
  return usersModel.findOne({ friend_code: friendCode } as Partial<UserRow>);
}

export async function updateUserDisplayName(id: string, displayName: string) {
  await usersModel.updateById(id, { display_name: displayName });
}

export async function getFriendCodeById(id: string) {
  const row = await usersModel.findById(id);
  return row?.friend_code ?? null;
}

export async function updateFriendCode(id: string, friendCode: string) {
  await usersModel.updateById(id, { friend_code: friendCode });
}
