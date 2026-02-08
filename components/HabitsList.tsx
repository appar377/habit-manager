"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit } from "@/lib/store";
import HabitForm from "./HabitForm";
import HabitCard from "./HabitCard";
import Button from "./ui/Button";

type Trend = "up" | "down" | "same";

type Props = {
  habitsWithTrend: { habit: Habit; trend: Trend }[];
};

export default function HabitsList({ habitsWithTrend }: Props) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  function refresh() {
    router.refresh();
  }

  const habits = habitsWithTrend.filter((h) => !h.habit.archived);

  return (
    <div className="space-y-6">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
        >
          新規追加
        </Button>
      </div>

      {/* 新規作成フォーム */}
      {showCreateForm && (
        <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-semibold text-foreground mb-3">新しい習慣を追加</h2>
          <HabitForm
            initial={undefined}
            onSuccess={() => {
              setShowCreateForm(false);
              refresh();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </section>
      )}

      {/* 習慣一覧 */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-2">
          一覧 {habits.length > 0 && `（${habits.length}件）`}
        </h2>
        {habits.length > 0 ? (
          <ul className="space-y-3 list-none p-0 m-0" role="list">
            {habits.map(({ habit, trend }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                trend={trend}
                onUpdate={refresh}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-border bg-bg-subtle py-10 px-4 text-center">
            <p className="text-sm text-fg-muted mb-1">習慣がありません</p>
            <p className="text-xs text-fg-subtle mb-4">「新規追加」で最初の習慣を作成しましょう</p>
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              新規追加
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
