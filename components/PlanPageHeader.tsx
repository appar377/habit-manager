"use client";

import StreakBadge from "./StreakBadge";
import ComebackBadge from "./ComebackBadge";
import PlanDateSwitcher from "./PlanDateSwitcher";
import GameTab from "./ui/GameTab";

export type PlanView = "day" | "week" | "month";

type Props = {
  date: string;
  today: string;
  streak: number;
  comebackCount: number;
  view: PlanView;
};

const VIEW_TABS: { id: PlanView; label: string; icon: "day" | "week" | "month" }[] = [
  { id: "day", label: "日", icon: "day" },
  { id: "week", label: "週", icon: "week" },
  { id: "month", label: "月", icon: "month" },
];

function planHref(date: string, view: PlanView): string {
  const base = `/plan?date=${date}`;
  return view === "day" ? base : `${base}&view=${view}`;
}

function ViewIcon({ type }: { type: "day" | "week" | "month" }) {
  const c = "currentColor";
  if (type === "day")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 2v4M16 2v4" />
      </svg>
    );
  if (type === "week")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18M8 14h0M12 14h0M16 14h0" />
        <path d="M8 2v4M16 2v4" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M7 14h0M11 14h0M15 14h0M19 14h0M7 18h0M11 18h0M15 18h0" />
      <path d="M8 2v4M16 2v4" />
    </svg>
  );
}

export default function PlanPageHeader({ date, today, streak, comebackCount, view }: Props) {
  return (
    <header className="flex flex-col gap-4 shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-bold text-foreground">予定</h1>
        <span className="text-fg-subtle">·</span>
        <StreakBadge count={streak} />
        <ComebackBadge count={comebackCount} />
      </div>

      <div
        role="tablist"
        aria-label="表示"
        className="flex rounded-[var(--radius-xl)] border-2 border-border p-1.5 bg-bg-subtle w-fit shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {VIEW_TABS.map((tab) => (
          <GameTab
            key={tab.id}
            href={planHref(date, tab.id)}
            isSelected={view === tab.id}
            ariaLabel={tab.label === "日" ? "日表示" : tab.label === "週" ? "週表示" : "月表示"}
          >
            <ViewIcon type={tab.icon} />
            <span>{tab.label}</span>
          </GameTab>
        ))}
      </div>

      <PlanDateSwitcher date={date} today={today} view={view} />
    </header>
  );
}
