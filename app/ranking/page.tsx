import { store } from "@/lib/store";
import RankingComparison from "@/components/RankingComparison";
import RivalForm from "@/components/RivalForm";
import RivalList from "@/components/RivalList";

const ACHIEVEMENT_DAYS = 7;

export default async function RankingPage() {
  const logStreak = store.getStreakDays();
  const planStreak = store.getPlanStreakDays();
  const comebackCount = store.getLogComebackCount();
  const dailyRates = store.getDailyAchievementRates(ACHIEVEMENT_DAYS);
  const totalScheduled = dailyRates.reduce((a, d) => a + d.scheduled, 0);
  const totalCompleted = dailyRates.reduce((a, d) => a + d.completed, 0);
  const achievementRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

  const myStats = {
    logStreak,
    planStreak,
    comebackCount,
    achievementRate,
  };

  const rivals = store.listRivals();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-lg font-bold text-foreground">ランキング</h1>
        <p className="text-sm text-fg-muted mt-0.5">ライバルを追加してストリーク・達成率を比較</p>
      </header>

      <RankingComparison myStats={myStats} rivals={rivals} />

      <section aria-labelledby="ranking-add-heading">
        <h2 id="ranking-add-heading" className="text-sm font-bold text-foreground mb-3">ライバルを追加</h2>
        <RivalForm />
      </section>

      {rivals.length > 0 && (
        <section aria-labelledby="ranking-list-heading">
          <h2 id="ranking-list-heading" className="text-sm font-bold text-foreground mb-3">登録中</h2>
          <RivalList rivals={rivals} />
        </section>
      )}
    </div>
  );
}
