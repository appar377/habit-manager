"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Habit } from "@/lib/store";
import HabitForm from "./HabitForm";
import HabitCard from "./HabitCard";
import Pressable from "./ui/Pressable";

type Trend = "up" | "down" | "same";

type Props = {
  habitsWithTrend: { habit: Habit; trend: Trend }[];
  includeArchived: boolean;
};

export default function HabitsList({ habitsWithTrend, includeArchived }: Props) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={includeArchived ? "/habits" : "/habits?archived=1"}
          className="text-sm text-neutral-500 underline"
        >
          {includeArchived ? "アーカイブを隠す" : "アーカイブを表示"}
        </Link>
        <Pressable
          onClick={() => setShowCreateForm(true)}
          className="min-h-[44px] px-4 rounded-lg border border-neutral-200 dark:border-neutral-600 font-medium"
        >
          新規追加
        </Pressable>
      </div>

      {showCreateForm && (
        <HabitForm
          initial={undefined}
          onSuccess={() => {
            setShowCreateForm(false);
            refresh();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <ul className="space-y-3 list-none p-0 m-0">
        {habitsWithTrend.map(({ habit, trend }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            trend={trend}
            onArchive={refresh}
            onUpdate={refresh}
          />
        ))}
      </ul>
      {habitsWithTrend.length === 0 && (
        <p className="text-sm text-neutral-500 py-6 text-center">
          {includeArchived ? "習慣がありません" : "習慣がありません。新規追加で作成できます。"}
        </p>
      )}
    </div>
  );
}
