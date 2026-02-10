"use client";

import { useState } from "react";
import type { Rival } from "@/lib/store";
import RivalForm from "./RivalForm";
import RivalList from "./RivalList";

type TabId = "list" | "add";

const TABS: { id: TabId; label: string }[] = [
  { id: "list", label: "フレンド一覧" },
  { id: "add", label: "追加" },
];

type Props = {
  rivals: Rival[];
};

export default function FriendTabs({ rivals }: Props) {
  const [active, setActive] = useState<TabId>(rivals.length > 0 ? "list" : "add");

  return (
    <section className="space-y-4">
      <div
        role="tablist"
        aria-label="フレンド"
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

      <div role="tabpanel" className="min-w-0 min-h-0">
        {active === "add" ? (
          <RivalForm />
        ) : rivals.length > 0 ? (
          <RivalList rivals={rivals} />
        ) : (
          <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-border bg-bg-subtle py-10 px-4 text-center">
            <p className="text-sm text-fg-muted mb-1">フレンドがいません</p>
            <p className="text-xs text-fg-subtle mb-4">「追加」タブから登録できます</p>
          </div>
        )}
      </div>
    </section>
  );
}
