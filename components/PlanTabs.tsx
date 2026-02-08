"use client";

import { useState } from "react";
import PlanTimeline from "@/components/PlanTimeline";
import PlanList from "@/components/PlanList";

type TodoItem = {
  habitId: string;
  title: string;
  start: string;
  end: string;
  priority?: number;
};

type Props = {
  todosWithTime: TodoItem[];
  todosWithoutTime: TodoItem[];
  completedIds: Set<string>;
  date: string;
};

const TABS = [
  { id: "time" as const, label: "時間指定" },
  { id: "anytime" as const, label: "時間指定なし" },
];

export default function PlanTabs({
  todosWithTime,
  todosWithoutTime,
  completedIds,
  date,
}: Props) {
  const [activeTab, setActiveTab] = useState<"time" | "anytime">("time");

  return (
    <div className="min-w-0">
      <div
        role="tablist"
        aria-label="予定の種類"
        className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 mb-4 bg-neutral-100/50 dark:bg-neutral-800/50"
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
            className={`flex-1 min-h-[40px] rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-neutral-500 hover:text-foreground"
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
    </div>
  );
}
