"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Habit } from "@/lib/store";
import GameTab from "./ui/GameTab";

type Props = {
  habits: Habit[];
};

export type ReviewRange = "week" | "month" | "all";

const RANGE_TABS: { id: ReviewRange; label: string }[] = [
  { id: "week", label: "週" },
  { id: "month", label: "月" },
  { id: "all", label: "全体" },
];

function buildReviewHref(range: ReviewRange, habitId: string | null): string {
  const base = `/review?range=${range}`;
  return habitId ? `${base}&habit=${habitId}` : base;
}

export default function ReviewViewSwitcher({ habits }: Props) {
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") as ReviewRange) || "week";
  const habitId = searchParams.get("habit") || "";

  const validRange = RANGE_TABS.some((t) => t.id === range) ? range : "week";
  const selectedHabitId = habitId && habits.some((h) => h.id === habitId) ? habitId : null;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="期間"
        className="flex rounded-[var(--radius-xl)] border-2 border-border p-1.5 bg-bg-subtle w-fit shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {RANGE_TABS.map((tab) => (
          <GameTab
            key={tab.id}
            href={buildReviewHref(tab.id, selectedHabitId)}
            isSelected={validRange === tab.id}
            ariaLabel={`${tab.label}間`}
          >
            {tab.label}
          </GameTab>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">対象</span>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildReviewHref(validRange, null)}
            className={`
              inline-flex items-center px-3 py-2 rounded-[var(--radius-pill)] text-sm font-semibold
              transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]
              min-h-[40px]
              ${!selectedHabitId
                ? "bg-primary text-primary-contrast shadow-[inset_0_2px_0_rgba(0,0,0,0.15)]"
                : "bg-bg-subtle text-fg-muted border-2 border-border hover:text-foreground hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98]"
              }
            `}
          >
            全体の習慣
          </Link>
          {habits.map((h) => (
            <Link
              key={h.id}
              href={buildReviewHref(validRange, h.id)}
              className={`
                inline-flex items-center px-3 py-2 rounded-[var(--radius-pill)] text-sm font-semibold
                transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]
                min-h-[40px]
                ${selectedHabitId === h.id
                  ? "bg-primary text-primary-contrast shadow-[inset_0_2px_0_rgba(0,0,0,0.15)]"
                  : "bg-bg-subtle text-fg-muted border-2 border-border hover:text-foreground hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                }
              `}
            >
              {h.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
