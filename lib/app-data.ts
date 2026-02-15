import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/user";
import { listHabits, listLogs } from "@/lib/db-store";
import { buildStoreFromData } from "@/lib/store-factory";
import { listCalendarEventsByDate } from "@/lib/calendar-db";

export async function getStoreForUser() {
  try {
    const user = await getOrCreateUser();
    const habits = await listHabits(user.id, true);
    const logs = await listLogs(user.id);
    const store = buildStoreFromData(habits, logs);
    return { user, store };
  } catch (e) {
    if (e instanceof Error && e.message === "user_cookie_missing") {
      redirect("/login");
    }
    throw e;
  }
}

export async function getStoreForUserId(userId: string) {
  const habits = await listHabits(userId, true);
  const logs = await listLogs(userId);
  const store = buildStoreFromData(habits, logs);
  return { store };
}

export async function getCalendarEventsForDate(date: string) {
  try {
    const user = await getOrCreateUser();
    return await listCalendarEventsByDate(user.id, date);
  } catch {
    return [];
  }
}
