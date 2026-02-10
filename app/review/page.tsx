import { Suspense } from "react";
import AchievementRateCard from "@/components/AchievementRateCard";
import CheatDayProgress from "@/components/CheatDayProgress";
import ComebackCard from "@/components/ComebackCard";
import DailyRateBar from "@/components/DailyRateBar";
import HabitAchievementRow from "@/components/HabitAchievementRow";
import KPICard from "@/components/KPICard";
import ReviewSectionTabs from "@/components/ReviewSectionTabs";
import ReviewViewSwitcher, { type ReviewRange } from "@/components/ReviewViewSwitcher";
import SimpleLineChart from "@/components/SimpleLineChart";
import StreakCalendar from "@/components/StreakCalendar";
import StreakCards from "@/components/StreakCards";
import { buildReviewSummary } from "@/lib/review-summary";
import type { Habit } from "@/lib/store";
import { getStoreForUser } from "@/lib/app-data";
import { getTrend } from "@/lib/utils";

const RANGE_DAYS: Record<ReviewRange, number> = { week: 7, month: 30, all: 90 };

/** 直近 half 日 vs その前 half 日の合計でトレンドを算出 */
function summarize(series: { date: string; value: number }[], half: number) {
  const mid = Math.floor(half) || 1;
  const last = series.slice(-mid);
  const prev = series.slice(0, mid);
  const thisSum = last.reduce((a, d) => a + d.value, 0);
  const lastSum = prev.reduce((a, d) => a + d.value, 0);
  return { thisSum, lastSum, trend: getTrend(thisSum, lastSum) };
}

/** 習慣別トレンド（後半 vs 前半）。上位2件を後半合計で選ぶ。 */
function habitSummaryLines(
  store: { seriesByHabit: (habitId: string, metric: "volume" | "durationMin", days: number) => { date: string; value: number }[] },
  habits: Habit[],
  days: number,
  maxLines = 2
): { name: string; trend: "up" | "down" | "same" }[] {
  const half = Math.max(1, Math.floor(days / 2));
  const withTrend: { name: string; trend: "up" | "down" | "same"; thisSum: number }[] = habits.map(
    (h) => {
      const metric = h.type === "exercise" ? "volume" : "durationMin";
      const seriesData = store.seriesByHabit(h.id, metric, days);
      const s = summarize(seriesData, half);
      return { name: h.name, trend: s.trend, thisSum: s.thisSum };
    }
  );
  const sorted = withTrend
    .filter((x) => x.thisSum > 0)
    .sort((a, b) => b.thisSum - a.thisSum)
    .slice(0, maxLines);
  return sorted.map(({ name, trend }) => ({ name, trend }));
}

type ReviewPageProps = {
  searchParams?: Promise<{ range?: string; habit?: string }> | { range?: string; habit?: string };
};

function resolveRange(params: { range?: string }): ReviewRange {
  const r = params?.range;
  return r === "month" || r === "all" ? r : "week";
}

export default async function ReviewPage(props: ReviewPageProps) {
  const params = await Promise.resolve(props.searchParams ?? {}).then((p) => (p ?? {}));
  const { store } = await getStoreForUser();
  const range = resolveRange(params);
  const habitId = params.habit && params.habit.trim() ? params.habit.trim() : null;
  const days = RANGE_DAYS[range];
  const half = Math.max(1, Math.floor(days / 2));

  const habits = store.listHabits();
  const habit = habitId ? store.getHabit(habitId) : null;
  const singleHabit = habit && habits.some((h) => h.id === habitId) ? habit : null;

  const today = new Date().toISOString().slice(0, 10);
  const todaySummary = store.getDayPlanSummary(today);
  const logStreak = store.getStreakDays();
  const planStreak = store.getPlanStreakDays();
  const logComebackCount = store.getLogComebackCount();
  const activityCalendarDays = store.getActivityForLastDays(42);
  const cheatDayStatus = store.getCheatDayStatus();
  const cheatDayConfig = store.cheatDayConfig;
  const cheatDayHistory = store.listCheatDaysUsed();
  const dailyRatesInCycle =
    cheatDayConfig && cheatDayStatus
      ? [...store.getDailyAchievementRates(cheatDayConfig.cycleDays)].reverse()
      : [];

  const dailyRates = store.getDailyAchievementRates(days);
  const totalScheduled = dailyRates.reduce((a, d) => a + d.scheduled, 0);
  const totalCompleted = dailyRates.reduce((a, d) => a + d.completed, 0);
  const overallRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

  const scheduledHabits = habits.filter((h) => h.scheduleEnabled);
  const habitRates = scheduledHabits.map((h) => ({
    habit: h,
    ...store.getHabitAchievementRate(h.id, days),
  }));

  const rangeLabel = range === "week" ? "直近7日" : range === "month" ? "直近30日" : "直近90日";

  if (singleHabit) {
    const metric = singleHabit.type === "exercise" ? "volume" : "durationMin";
    const habitSeries = store.seriesByHabit(singleHabit.id, metric, days);
    const habitSum = summarize(habitSeries, half);
    const habitAchievement = store.getHabitAchievementRate(singleHabit.id, days);
    const todayHabit = store.getHabitAchievementRate(singleHabit.id, 1);
    const unit = singleHabit.type === "exercise" ? "rep" : "分";
    const metricLabel = singleHabit.type === "exercise" ? "ボリューム" : "時間";
    const activityCalendarDaysSingle = store.getActivityForLastDays(42);

    const singleStreakContent = (
      <section aria-labelledby="review-streak-heading" className="space-y-4">
        <StreakCards logStreak={logStreak} planStreak={planStreak} />
        <StreakCalendar days={activityCalendarDaysSingle} today={today} mode="both" />
        <ComebackCard count={logComebackCount} />
        {cheatDayStatus && (
          <CheatDayProgress
            status={cheatDayStatus}
            dailyRatesInCycle={dailyRatesInCycle}
            history={cheatDayHistory}
          />
        )}
      </section>
    );

    const singleRateContent = (
      <section aria-labelledby="review-rate-heading" className="space-y-4">
        <AchievementRateCard
          rate={habitAchievement.rate}
          label={rangeLabel}
          completed={habitAchievement.completedDays}
          scheduled={habitAchievement.scheduledDays}
        />
        <AchievementRateCard
          rate={todayHabit.rate}
          label="今日"
          completed={todayHabit.completedDays}
          scheduled={todayHabit.scheduledDays}
        />
      </section>
    );

    const singleTrendContent = (
      <section aria-labelledby="review-trend-heading" className="space-y-4">
        <KPICard
          label={metricLabel}
          value={habitSum.thisSum}
          trend={habitSum.trend}
          unit={unit}
          lastValue={habitSum.lastSum}
        />
        <SimpleLineChart
          data={habitSeries}
          height={140}
          showAverage
          xLabel="日付"
          yLabel={metricLabel}
          yUnit={unit}
        />
      </section>
    );

    return (
      <div className="flex flex-col gap-5 min-h-0">
        <Suspense fallback={<div className="h-20 rounded-[var(--radius-xl)] bg-bg-subtle animate-pulse" />}>
          <ReviewViewSwitcher habits={habits} />
        </Suspense>
        <ReviewSectionTabs
          streakContent={singleStreakContent}
          rateContent={singleRateContent}
          trendContent={singleTrendContent}
        />
      </div>
    );
  }

  const volumeSeries = store.series("volume", days);
  const durationSeries = store.series("durationMin", days);
  const volume = summarize(volumeSeries, half);
  const duration = summarize(durationSeries, half);
  const habitLines = habitSummaryLines(store, habits, days, 2);
  const summaryLines = buildReviewSummary({
    volumeTrend: volume.trend,
    durationTrend: duration.trend,
    habitLines,
  });

  const streakContent = (
    <section aria-labelledby="review-streak-heading" className="space-y-4">
      <StreakCards logStreak={logStreak} planStreak={planStreak} />
      <StreakCalendar days={activityCalendarDays} today={today} mode="both" />
      <ComebackCard count={logComebackCount} />
      {cheatDayStatus && (
        <CheatDayProgress
          status={cheatDayStatus}
          dailyRatesInCycle={dailyRatesInCycle}
          history={cheatDayHistory}
        />
      )}
    </section>
  );

  const rateContent = (
    <section aria-labelledby="review-rate-heading" className="space-y-4">
      <AchievementRateCard
        rate={overallRate}
        label={rangeLabel}
        completed={totalCompleted}
        scheduled={totalScheduled}
      />
      <div className="min-w-0">
        <p className="text-xs text-fg-muted mb-1.5">日別</p>
        <DailyRateBar days={[...dailyRates].reverse()} />
      </div>
      <AchievementRateCard
        rate={todaySummary.rate}
        label="今日"
        completed={todaySummary.completed}
        scheduled={todaySummary.scheduled}
      />
      {scheduledHabits.length > 0 && habitRates.filter((r) => r.scheduledDays > 0).length > 0 && (
        <div className="rounded-[var(--radius-xl)] border border-border bg-bg-muted p-4 space-y-3">
          <p className="text-xs font-medium text-fg-muted">習慣ごと（{days}日）</p>
          {habitRates
            .filter((r) => r.scheduledDays > 0)
            .sort((a, b) => b.rate - a.rate)
            .map((r) => (
              <HabitAchievementRow
                key={r.habit.id}
                name={r.habit.name}
                completedDays={r.completedDays}
                scheduledDays={r.scheduledDays}
                rate={r.rate}
              />
            ))}
        </div>
      )}
    </section>
  );

  const trendContent = (
    <section aria-labelledby="review-trend-heading" className="space-y-4">
      <div className="rounded-[var(--radius-xl)] border border-border bg-bg-muted px-4 py-3">
        {summaryLines.map((line, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {line}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          label="Volume"
          value={volume.thisSum}
          trend={volume.trend}
          unit="rep"
          lastValue={volume.lastSum}
        />
        <KPICard
          label="Duration"
          value={duration.thisSum}
          trend={duration.trend}
          unit="分"
          lastValue={duration.lastSum}
        />
      </div>
      <SimpleLineChart
        data={volumeSeries}
        height={140}
        showAverage
        xLabel="日付"
        yLabel="ボリューム"
        yUnit="rep"
      />
    </section>
  );

  return (
    <div className="flex flex-col gap-5 min-h-0">
      <Suspense fallback={<div className="h-20 rounded-[var(--radius-xl)] bg-bg-subtle animate-pulse" />}>
        <ReviewViewSwitcher habits={habits} />
      </Suspense>
      <ReviewSectionTabs
        streakContent={streakContent}
        rateContent={rateContent}
        trendContent={trendContent}
      />
    </div>
  );
}
