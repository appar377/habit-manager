import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type UserFriendRow = {
  user_id: string;
  friend_id: string;
  created_at: string;
};

export const userFriendsModel = new BaseModel<UserFriendRow>("user_friends", [
  "user_id",
  "friend_id",
  "created_at",
], "user_id");

export async function addFriend(userId: string, friendId: string) {
  await sql.query(
    "INSERT INTO user_friends (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
    [userId, friendId]
  );
}

export async function listFriendIds(userId: string) {
  const res = await sql.query("SELECT friend_id FROM user_friends WHERE user_id = $1;", [userId]);
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return (rows ?? []).map((r: any) => r.friend_id as string);
}
