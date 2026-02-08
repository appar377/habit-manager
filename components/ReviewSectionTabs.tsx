"use client";

import { type ReactNode, useState } from "react";

type TabId = "streak" | "rate" | "trend";

const TABS: { id: TabId; label: string }[] = [
  { id: "streak", label: "続けてる証" },
  { id: "rate", label: "達成率" },
  { id: "trend", label: "トレンド" },
];

type Props = {
  streakContent: ReactNode;
  rateContent: ReactNode;
  trendContent: ReactNode;
};

export default function ReviewSectionTabs({ streakContent, rateContent, trendContent }: Props) {
  const [active, setActive] = useState<TabId>("streak");

  const content =
    active === "streak" ? streakContent : active === "rate" ? rateContent : trendContent;

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div
        role="tablist"
        aria-label="分析の見出し"
        className="flex rounded-[var(--radius-xl)] border-2 border-border p-1 bg-bg-subtle shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`
              flex-1 min-h-[40px] rounded-[var(--radius-lg)] text-sm font-bold
              transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]
              ${active === tab.id
                ? "bg-primary text-primary-contrast shadow-[inset_0_2px_0_rgba(0,0,0,0.15)] scale-[0.98]"
                : "text-fg-muted hover:text-foreground hover:scale-[1.01] active:scale-[0.99]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-w-0 min-h-0 flex flex-col">
        {content}
      </div>
    </div>
  );
}
