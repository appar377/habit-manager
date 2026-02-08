"use client";

import { useState, useMemo } from "react";
import PlanTimeline from "@/components/PlanTimeline";
import PlanList from "@/components/PlanList";
import PlanListView from "@/components/PlanListView";
import type { Habit } from "@/lib/store";
import type { Log } from "@/lib/store";

type TodoItem = {
  habitId: string;
  title: string;
  start: string;
  end: string;
  priority?: number;
};

type PlanOverrideItem = { start: string; end: string; memo?: string };

type Props = {
  todosWithTime: TodoItem[];
  todosWithoutTime: TodoItem[];
  completedIds: Set<string>;
  date: string;
  habits: Habit[];
  dateLogs: Log[];
  overridesForDate?: Record<string, PlanOverrideItem>;
};

const TABS = [
  { id: "time" as const, label: "時間指定" },
  { id: "anytime" as const, label: "時間指定なし" },
  { id: "list" as const, label: "リスト" },
];

export default function PlanTabs({
  todosWithTime,
  todosWithoutTime,
  completedIds,
  date,
  habits,
  dateLogs,
  overridesForDate = {},
}: Props) {
  const [activeTab, setActiveTab] = useState<"time" | "anytime" | "list">("time");

  const listTodos = useMemo(() => {
    const withTime = todosWithTime.map((t) => ({ ...t, hasTime: true as const }));
    const withoutTime = todosWithoutTime.map((t) => ({ ...t, hasTime: false as const }));
    return [...withTime, ...withoutTime];
  }, [todosWithTime, todosWithoutTime]);

  const logsByHabitId = useMemo(
    () => new Map(dateLogs.map((l) => [l.habitId, l])),
    [dateLogs]
  );

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="予定の種類"
        className="flex rounded-[var(--radius-xl)] border-2 border-border p-1.5 mb-4 bg-bg-subtle shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`plan-panel-${tab.id}`}
            id={`plan-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-h-[40px] rounded-[var(--radius-lg)] text-sm font-bold transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] ${
              activeTab === tab.id
                ? "bg-primary text-primary-contrast shadow-[inset_0_2px_0_rgba(0,0,0,0.15)] scale-[0.98]"
                : "text-fg-muted hover:text-foreground hover:scale-[1.02] active:scale-[0.99]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="plan-panel-time"
        role="tabpanel"
        aria-labelledby="plan-tab-time"
        hidden={activeTab !== "time"}
        className="min-w-0"
      >
        <PlanTimeline
          todos={todosWithTime}
          completedIds={completedIds}
          date={date}
          habits={habits}
          overridesForDate={overridesForDate}
        />
      </div>

      <div
        id="plan-panel-anytime"
        role="tabpanel"
        aria-labelledby="plan-tab-anytime"
        hidden={activeTab !== "anytime"}
      >
        <PlanList
          todos={todosWithoutTime}
          completedIds={completedIds}
          date={date}
        />
      </div>

      <div
        id="plan-panel-list"
        role="tabpanel"
        aria-labelledby="plan-tab-list"
        hidden={activeTab !== "list"}
        className="min-w-0"
      >
        <p className="text-xs text-fg-muted mb-3">
          チェックで完了。rep・時間はその場で入力してね（離すと保存）
        </p>
        <PlanListView
          todos={listTodos}
          completedIds={completedIds}
          date={date}
          habits={habits}
          logsByHabitId={logsByHabitId}
          overridesForDate={overridesForDate}
        />
      </div>
    </div>
  );
}
