"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit } from "@/lib/store";
import HabitForm from "./HabitForm";
import HabitCard from "./HabitCard";
import Button from "./ui/Button";
import Input from "./ui/Input";

type Trend = "up" | "down" | "same";

type Props = {
  habitsWithTrend: { habit: Habit; trend: Trend }[];
};

export default function HabitsList({ habitsWithTrend }: Props) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "exercise" | "study">("all");
  const [scheduleOnly, setScheduleOnly] = useState(false);

  function refresh() {
    router.refresh();
  }

  const habits = habitsWithTrend.filter((h) => !h.habit.archived);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return habits.filter(({ habit }) => {
      if (typeFilter !== "all" && habit.type !== typeFilter) return false;
      if (scheduleOnly && !habit.scheduleEnabled) return false;
      if (q && !habit.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [habits, query, typeFilter, scheduleOnly]);

  return (
    <div className="space-y-6">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[180px]">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="習慣を検索"
          />
        </div>
        {!showCreateForm && (
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              新規追加
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-fg-muted">フィルタ</span>
        <Button
          variant={typeFilter === "all" ? "primary" : "secondary"}
          className="min-h-[32px] px-3 text-xs"
          onClick={() => setTypeFilter("all")}
        >
          全て
        </Button>
        <Button
          variant={typeFilter === "exercise" ? "primary" : "secondary"}
          className="min-h-[32px] px-3 text-xs"
          onClick={() => setTypeFilter("exercise")}
        >
          運動
        </Button>
        <Button
          variant={typeFilter === "study" ? "primary" : "secondary"}
          className="min-h-[32px] px-3 text-xs"
          onClick={() => setTypeFilter("study")}
        >
          学習
        </Button>
        <Button
          variant={scheduleOnly ? "primary" : "secondary"}
          className="min-h-[32px] px-3 text-xs"
          onClick={() => setScheduleOnly((v) => !v)}
        >
          予定のみ
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
          一覧 {filtered.length > 0 && `（${filtered.length}件）`}
        </h2>
        {filtered.length > 0 ? (
          <ul className="space-y-3 list-none p-0 m-0" role="list">
            {filtered.map(({ habit, trend }) => (
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
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                新規追加
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
