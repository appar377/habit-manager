import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/community-db";
import { findUserByIdAndSecret, findUserByFriendCode } from "@/lib/models/users";
import { addFriend, listFriendIds } from "@/lib/models/user-friends";
import { userStatsModel } from "@/lib/models/user-stats";

export type FriendSummary = {
  id: string;
  name: string;
  logStreak: number;
  planStreak: number;
  comebackCount: number;
  achievementRate: number;
};

async function mapStats(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, any>();
  const placeholders = userIds.map((_, index) => `$${index + 1}`).join(", ");
  const res = await sql.query(
    `SELECT user_id, log_streak, plan_streak, comeback_count, achievement_rate
     FROM user_stats
     WHERE user_id IN (${placeholders});`,
    userIds
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return new Map((rows ?? []).map((row: any) => [row.user_id, row]));
}

export async function validateUser(userId: string, secret: string) {
  await ensureSchema();
  const user = await findUserByIdAndSecret(userId, secret);
  return Boolean(user);
}

export async function getUserProfile(userId: string, secret: string) {
  await ensureSchema();
  return findUserByIdAndSecret(userId, secret);
}

export async function addFriendByCode(userId: string, friendCode: string) {
  await ensureSchema();
  const friend = await findUserByFriendCode(friendCode);
  if (!friend) return { ok: false as const, error: "not_found" as const };
  if (friend.id === userId) return { ok: false as const, error: "self_add" as const };
  await addFriend(userId, friend.id);
  await addFriend(friend.id, userId);
  return { ok: true as const, friendId: friend.id };
}

export async function listFriendsWithStats(userId: string): Promise<FriendSummary[]> {
  await ensureSchema();
  const friendIds = await listFriendIds(userId);
  if (friendIds.length === 0) return [];
  const placeholders = friendIds.map((_: string, index: number) => `$${index + 1}`).join(", ");
  const res = await sql.query(
    `SELECT id, display_name
     FROM users
     WHERE id IN (${placeholders})
     ORDER BY display_name ASC;`,
    friendIds
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  const statsMap = await mapStats(friendIds);
  return (rows ?? []).map((row: any) => {
    const stats = statsMap.get(row.id);
    return {
      id: row.id,
      name: row.display_name,
      logStreak: Number(stats?.log_streak ?? 0),
      planStreak: Number(stats?.plan_streak ?? 0),
      comebackCount: Number(stats?.comeback_count ?? 0),
      achievementRate: Number(stats?.achievement_rate ?? 0),
    };
  });
}

export async function getSelfStats(userId: string) {
  await ensureSchema();
  return userStatsModel.findById(userId);
}
