import AchievementRateCard from "@/components/AchievementRateCard";
import CheatDayProgress from "@/components/CheatDayProgress";
import ComebackCard from "@/components/ComebackCard";
import DailyRateBar from "@/components/DailyRateBar";
import HabitAchievementRow from "@/components/HabitAchievementRow";
import KPICard from "@/components/KPICard";
import SimpleLineChart from "@/components/SimpleLineChart";
import StreakCards from "@/components/StreakCards";
import { buildReviewSummary } from "@/lib/review-summary";
import type { Habit } from "@/lib/store";
import { store } from "@/lib/store";
import { getTrend } from "@/lib/utils";

/** 直近7日 vs その前7日の合計でトレンドを算出 */
function summarize(series: { date: string; value: number }[]) {
  const last7 = series.slice(-7);
  const prev7 = series.slice(0, 7);
  const thisSum = last7.reduce((a, d) => a + d.value, 0);
  const lastSum = prev7.reduce((a, d) => a + d.value, 0);
  return { thisSum, lastSum, trend: getTrend(thisSum, lastSum) };
}

/** 習慣別トレンド（直近7日 vs 前週）。上位2件を直近7日合計で選ぶ。 */
function habitSummaryLines(habits: Habit[], maxLines = 2): { name: string; trend: "up" | "down" | "same" }[] {
  const withTrend: { name: string; trend: "up" | "down" | "same"; thisSum: number }[] = habits.map(
    (h) => {
      const metric = h.type === "exercise" ? "volume" : "durationMin";
      const series14 = store.seriesByHabit(h.id, metric, 14);
      const s = summarize(series14);
      return { name: h.name, trend: s.trend, thisSum: s.thisSum };
    }
  );
  const sorted = withTrend
    .filter((x) => x.thisSum > 0)
    .sort((a, b) => b.thisSum - a.thisSum)
    .slice(0, maxLines);
  return sorted.map(({ name, trend }) => ({ name, trend }));
}

const ACHIEVEMENT_DAYS = 7;

export default async function ReviewPage() {
  const today = new Date().toISOString().slice(0, 10);
  const todaySummary = store.getDayPlanSummary(today);
  const dailyRates = store.getDailyAchievementRates(ACHIEVEMENT_DAYS);
  const avgRate =
    dailyRates.length > 0
      ? dailyRates.reduce((a, d) => a + d.rate, 0) / dailyRates.length
      : 0;
  const totalScheduled = dailyRates.reduce((a, d) => a + d.scheduled, 0);
  const totalCompleted = dailyRates.reduce((a, d) => a + d.completed, 0);
  const overallRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

  const logStreak = store.getStreakDays();
  const planStreak = store.getPlanStreakDays();
  const logComebackCount = store.getLogComebackCount();
  const cheatDayStatus = store.getCheatDayStatus();
  const cheatDayConfig = store.cheatDayConfig;
  const dailyRatesInCycle =
    cheatDayConfig && cheatDayStatus
      ? [...store.getDailyAchievementRates(cheatDayConfig.cycleDays)].reverse()
      : [];

  const habits = store.listHabits();
  const scheduledHabits = habits.filter((h) => h.scheduleEnabled);
  const habitRates = scheduledHabits.map((h) => ({
    habit: h,
    ...store.getHabitAchievementRate(h.id, 14),
  }));

  const volumeSeries14 = store.series("volume", 14);
  const durationSeries14 = store.series("durationMin", 14);
  const volume = summarize(volumeSeries14);
  const duration = summarize(durationSeries14);
  const habitLines = habitSummaryLines(habits, 2);
  const summaryLines = buildReviewSummary({
    volumeTrend: volume.trend,
    durationTrend: duration.trend,
    habitLines,
  });
  const volumeSeries7 = store.series("volume", 7);

  return (
    <div className="space-y-6">
      {/* ストリーク・七転び八起き */}
      <section>
        <h2 className="text-xs font-semibold text-fg-muted mb-2">連続記録</h2>
        <div className="space-y-3">
          <StreakCards logStreak={logStreak} planStreak={planStreak} />
          <ComebackCard count={logComebackCount} />
        </div>
      </section>

      {cheatDayStatus && (
        <CheatDayProgress
          status={cheatDayStatus}
          dailyRatesInCycle={dailyRatesInCycle}
        />
      )}

      {/* 全体の達成率（直近7日） */}
      <section>
        <h2 className="text-xs font-semibold text-fg-muted mb-2">達成率</h2>
        <div className="space-y-3">
          <AchievementRateCard
            rate={overallRate}
            label="直近7日 全体"
            completed={totalCompleted}
            scheduled={totalScheduled}
            subLabel="予定した習慣のうち完了した割合"
          />
          <div>
            <p className="text-xs font-medium text-fg-muted mb-2">日別（左が古い）</p>
            <DailyRateBar days={[...dailyRates].reverse()} />
          </div>
          <AchievementRateCard
            rate={todaySummary.rate}
            label="今日"
            completed={todaySummary.completed}
            scheduled={todaySummary.scheduled}
          />
        </div>
      </section>

      {/* 習慣ごとの達成率 */}
      {scheduledHabits.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-fg-muted mb-2">習慣ごと（直近14日）</h2>
          <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-4">
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
        </section>
      )}

      {/* 自動文章サマリ */}
      <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted px-4 py-3 shadow-[var(--shadow-card)]">
        <p className="text-xs text-fg-muted mb-2">直近7日 vs 前週</p>
        {summaryLines.map((line, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {line}
          </p>
        ))}
      </section>

      {/* Volume / Duration */}
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

      <section>
        <h2 className="text-xs font-semibold text-fg-muted mb-2">Volume（日別・破線は平均）</h2>
        <SimpleLineChart data={volumeSeries7} height={140} showAverage />
      </section>
    </div>
  );
}
