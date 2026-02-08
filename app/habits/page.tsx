import HabitsList from "@/components/HabitsList";
import { store } from "@/lib/store";

type PageProps = { searchParams: Promise<{ archived?: string }> };

export default async function HabitsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const includeArchived = params.archived === "1";
  const habits = store.listHabits(includeArchived);

  const habitsWithTrend = habits.map((habit) => ({
    habit,
    trend: store.habitTrend(habit.id, habit) as "up" | "down" | "same",
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-bold text-foreground">習慣</h1>
        <p className="text-sm text-fg-muted mt-0.5">一覧・追加・編集。スケジュールONで予定に表示</p>
      </header>

      <HabitsList habitsWithTrend={habitsWithTrend} includeArchived={includeArchived} />
    </div>
  );
}
