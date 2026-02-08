import LogForm from "@/components/LogForm";
import LogList from "@/components/LogList";
import { store } from "@/lib/store";
import { todayStr, sortHabitsByRecentUsage } from "@/lib/utils";

/** 1画面1アクション・スクロール最小：今日のログは直近3件のみ表示 */
const CAPTURE_RECENT_LOGS = 3;

export default async function CapturePage() {
  const today = todayStr();
  const allLogs = store.listLogs();
  const habits = sortHabitsByRecentUsage(store.listHabits(), allLogs);
  const todayLogs = store.listLogs(today);
  const recentLogs = todayLogs.slice(0, CAPTURE_RECENT_LOGS);
  const defaultHabitId = habits[0]?.id ?? "";

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100dvh-8rem)] md:min-h-0">
      <p className="text-sm text-neutral-500 shrink-0">{today}</p>

      <div className="flex flex-col flex-1 min-h-0">
        <LogForm habits={habits} defaultHabitId={defaultHabitId} />
      </div>

      <section className="shrink-0 mt-2">
        <h2 className="text-xs font-medium text-neutral-400 mb-2">
          今日のログ{todayLogs.length > CAPTURE_RECENT_LOGS ? `（直近${CAPTURE_RECENT_LOGS}件）` : ""}
        </h2>
        <LogList logs={recentLogs} habits={habits} />
      </section>
    </div>
  );
}
