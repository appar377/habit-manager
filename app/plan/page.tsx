import PlanTabs from "@/components/PlanTabs";
import { store } from "@/lib/store";
import { todayStr } from "@/lib/utils";

export default async function PlanPage() {
  const today = todayStr();
  const todosWithTime = store.getTodayTodosWithTime(today);
  const todosWithoutTime = store.getTodayTodosWithoutTime(today);
  const todayLogs = store.listLogs(today);
  const completedIds = new Set(todayLogs.map((l) => l.habitId));

  return (
    <div className="min-w-0">
      <h1 className="text-lg font-semibold text-neutral-500 mb-1">予定</h1>
      <p className="text-sm text-neutral-500 mb-4">{today}</p>

      <section className="mb-6">
        <h2 className="text-xs font-medium text-neutral-500 mb-2">今日のTODO</h2>
        <p className="text-xs text-neutral-400 mb-3">
          習慣のスケジュールから自動生成。時間指定ありはTimelineで、なしはリストで表示します。
        </p>
        <PlanTabs
          todosWithTime={todosWithTime}
          todosWithoutTime={todosWithoutTime}
          completedIds={completedIds}
          date={today}
        />
      </section>
    </div>
  );
}
