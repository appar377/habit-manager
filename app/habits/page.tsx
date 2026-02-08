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
    <div>
      <h1 className="text-lg font-semibold text-neutral-500 mb-1">習慣</h1>
      <p className="text-sm text-neutral-500 mb-4">
        習慣の一覧・追加・編集。アーカイブした習慣は Capture には出ません。
      </p>
      <HabitsList habitsWithTrend={habitsWithTrend} includeArchived={includeArchived} />
    </div>
  );
}
