import PlanTabs from "@/components/PlanTabs";
import PlanPageHeader from "@/components/PlanPageHeader";
import PlanWeekView from "@/components/PlanWeekView";
import PlanMonthView from "@/components/PlanMonthView";
import StreakCalendar from "@/components/StreakCalendar";
import CheatDayOnboarding from "@/components/CheatDayOnboarding";
import CheatDayStatus from "@/components/CheatDayStatus";
import NotificationScheduler from "@/components/NotificationScheduler";
import PlanExternalEvents from "@/components/PlanExternalEvents";
import { getStoreForUser, getCalendarEventsForDate } from "@/lib/app-data";
import { todayStr, parseDate, sortHabitsByRecentUsage, getWeekDates, getMonthCells } from "@/lib/utils";

/** 予定は常に最新の習慣・ログを表示するためキャッシュしない */
export const dynamic = "force-dynamic";

type PlanPageProps = { searchParams?: Promise<{ date?: string; view?: string }> | { date?: string; view?: string } };

function resolveDate(params: { date?: string }): string {
  const raw = params?.date;
  if (typeof raw !== "string" || !raw.trim()) return todayStr();
  const d = parseDate(raw.trim());
  if (!d) return todayStr();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function resolveView(params: { view?: string }): "day" | "week" | "month" {
  const v = params?.view;
  if (v === "week" || v === "month") return v;
  return "day";
}

export default async function PlanPage(props: PlanPageProps) {
  const params = await Promise.resolve(props.searchParams ?? {}).then((p) => (p ?? {}));
  const { store } = await getStoreForUser();
  const date = resolveDate(params);
  const calendarEvents = await getCalendarEventsForDate(date);
  const view = resolveView(params);
  const today = todayStr();

  const [y, m] = date.split("-").map(Number);
  const weekDates = getWeekDates(date);
  const weekSummaries = weekDates.map((d) => ({ date: d, ...store.getDayPlanSummary(d) }));
  const monthCells = getMonthCells(y, m);
  const monthSummaries = monthCells.filter((d): d is string => d !== null).map((d) => ({ date: d, ...store.getDayPlanSummary(d) }));

  const todosWithTime = store.getTodayTodosWithTime(date);
  const todosWithoutTime = store.getTodayTodosWithoutTime(date);
  const dateLogs = store.listLogs(date);
  const completedIds = new Set(dateLogs.map((l) => l.habitId));
  const habits = sortHabitsByRecentUsage(store.listHabits(), store.listLogs());
  const overridesForDate = store.planOverrides[date] ?? {};
  const streak = store.getStreakDays();
  const comebackCount = store.getLogComebackCount();
  const activityCalendarDays = store.getActivityForLastDays(42);
  const cheatDayConfig = store.cheatDayConfig;
  const cheatDayStatus = store.getCheatDayStatus();
  const cheatDayPresets = store.getCheatDayPresets();

  return (
    <div className="min-w-0 flex flex-col gap-5">
      <PlanPageHeader
        date={date}
        today={today}
        streak={streak}
        comebackCount={comebackCount}
        view={view}
      />

      <StreakCalendar days={activityCalendarDays} today={today} mode="both" compact />

      {view === "day" && (
        <>
          {date === today && (cheatDayConfig === null ? (
            <CheatDayOnboarding presets={cheatDayPresets ?? []} />
          ) : cheatDayStatus ? (
            <CheatDayStatus status={cheatDayStatus} />
          ) : null)}

          <section>
            <h2 className="sr-only">{date === today ? "今日のTODO" : `${date} のTODO`}</h2>
            <p className="text-xs text-fg-muted mb-3">チェックで完了＝記録になります</p>
            {todosWithTime.length > 0 && (
              <div className="mb-3 rounded-[var(--radius-lg)] border border-border bg-bg-subtle px-3">
                <NotificationScheduler date={date} todosWithTime={todosWithTime} />
              </div>
            )}
            <PlanExternalEvents events={calendarEvents} />
            <PlanTabs
              todosWithTime={todosWithTime}
              todosWithoutTime={todosWithoutTime}
              completedIds={completedIds}
              date={date}
              habits={habits}
              dateLogs={dateLogs}
              overridesForDate={overridesForDate}
            />
          </section>
        </>
      )}

      {view === "week" && (
        <PlanWeekView weekDates={weekDates} summaries={weekSummaries} today={today} />
      )}

      {view === "month" && (
        <PlanMonthView
          year={y}
          month={m}
          selectedDate={date}
          today={today}
          cells={monthCells}
          summaries={monthSummaries}
        />
      )}
    </div>
  );
}
