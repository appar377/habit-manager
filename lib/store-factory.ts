import { store as baseStore } from "@/lib/store";
import type { Habit, Log } from "@/lib/store";

export function buildStoreFromData(habits: Habit[], logs: Log[]) {
  return {
    ...baseStore,
    habits,
    logs,
  };
}
