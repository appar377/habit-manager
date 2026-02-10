"use client";

import { useEffect, useState } from "react";
import type { Rival } from "@/lib/store";
import Button from "./ui/Button";
import {
  getCommunityAuth,
  subscribeCommunityAuth,
} from "@/lib/community-client";

type TabId = "list" | "add";

const TABS: { id: TabId; label: string }[] = [
  { id: "list", label: "フレンド一覧" },
  { id: "add", label: "追加" },
];

type FriendItem = Rival;

export default function CommunityFriendTabs() {
  const [active, setActive] = useState<TabId>("list");
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState(() => getCommunityAuth());

  useEffect(() => {
    const unsub = subscribeCommunityAuth(() => setAuth(getCommunityAuth()));
    return () => unsub();
  }, []);

  async function fetchFriends() {
    if (!auth) return;
    setLoading(true);
    const res = await fetch("/api/community/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: auth.userId, secret: auth.secret }),
    });
    if (res.ok) {
      const data = await res.json();
      setFriends(data.friends || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (auth) {
      void fetchFriends();
    } else {
      setFriends([]);
    }
  }, [auth]);

  if (!auth) {
    return (
      <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-subtle py-10 px-4 text-center">
        <p className="text-sm text-fg-muted mb-1">コミュニティ参加が必要です</p>
        <p className="text-xs text-fg-subtle">上の「コミュニティ」から参加してください</p>
      </div>
    );
  }

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
        {active === "list" ? (
          friends.length > 0 ? (
            <ul className="space-y-3">
              {friends.map((r) => (
                <li
                  key={r.id}
                  className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-3 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-fg-muted mt-0.5">
                        記録{r.logStreak ?? 0}日 · 達成{r.planStreak ?? 0}日 · 立ち上がり{r.comebackCount ?? 0}回 · 達成率{Math.round((r.achievementRate ?? 0) * 100)}%
                      </p>
                    </div>
                    <Button variant="ghost" className="min-h-[32px] px-2 text-xs" onClick={fetchFriends}>
                      更新
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[var(--radius-xl)] border-2 border-dashed border-border bg-bg-subtle py-10 px-4 text-center">
              <p className="text-sm text-fg-muted mb-1">フレンドがいません</p>
              <p className="text-xs text-fg-subtle">「追加」タブから登録できます</p>
            </div>
          )
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-border bg-bg-muted p-4 text-sm text-fg-muted">
            上のコミュニティカードからフレンドコードを追加してください。
          </div>
        )}
      </div>

      {loading && <p className="text-xs text-fg-muted">更新中…</p>}
    </section>
  );
}
