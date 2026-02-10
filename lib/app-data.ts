import { getOrCreateUser } from "@/lib/user";
import { listHabits, listLogs } from "@/lib/db-store";
import { buildStoreFromData } from "@/lib/store-factory";

export async function getStoreForUser() {
  try {
    const user = await getOrCreateUser();
    const habits = await listHabits(user.id, true);
    const logs = await listLogs(user.id);
    const store = buildStoreFromData(habits, logs);
    return { user, store };
  } catch {
    const store = buildStoreFromData([], []);
    return { user: { id: "bootstrap", secret: "bootstrap" }, store };
  }
}

export async function getStoreForUserId(userId: string) {
  const habits = await listHabits(userId, true);
  const logs = await listLogs(userId);
  const store = buildStoreFromData(habits, logs);
  return { store };
}
