import KPICard from "@/components/KPICard";
import SimpleLineChart from "@/components/SimpleLineChart";
import { buildReviewSummary } from "@/lib/review-summary";
import type { Habit } from "@/lib/store";
import { store } from "@/lib/store";
import { getTrend } from "@/lib/utils";

/** 直近7日 vs その前7日の合計でトレンドを算出（評価はしない） */
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

export default async function ReviewPage() {
  const volumeSeries14 = store.series("volume", 14);
  const durationSeries14 = store.series("durationMin", 14);
  const volume = summarize(volumeSeries14);
  const duration = summarize(durationSeries14);

  const habits = store.listHabits();
  const habitLines = habitSummaryLines(habits, 2);

  const summaryLines = buildReviewSummary({
    volumeTrend: volume.trend,
    durationTrend: duration.trend,
    habitLines,
  });

  const volumeSeries7 = store.series("volume", 7);

  return (
    <div>
      {/* 自動文章サマリ（観測・1〜2行＋習慣別0〜2行） */}
      <section className="mb-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 px-4 py-3">
        <p className="text-xs text-neutral-500 mb-2">直近7日 vs 前週</p>
        {summaryLines.map((line, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {line}
          </p>
        ))}
      </section>

      <div className="grid grid-cols-2 gap-3 mb-6">
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
        <h2 className="text-xs font-medium text-neutral-500 mb-2">Volume（日別・破線は平均）</h2>
        <SimpleLineChart data={volumeSeries7} height={140} showAverage />
      </section>
    </div>
  );
}
