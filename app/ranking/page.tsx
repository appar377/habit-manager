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
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-foreground">ランキング</h1>
        <p className="text-sm text-fg-muted mt-0.5">
          自分と比べたい相手を追加して、記録ストリーク・達成ストリーク・立ち上がり回数・達成率を比較できます。
        </p>
      </div>

      <RankingComparison myStats={myStats} rivals={rivals} />

      <section>
        <h2 className="text-xs font-semibold text-fg-muted mb-2">ライバルを追加</h2>
        <RivalForm />
      </section>

      {rivals.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-fg-muted mb-2">登録中のライバル</h2>
          <RivalList rivals={rivals} />
        </section>
      )}
    </div>
  );
}
