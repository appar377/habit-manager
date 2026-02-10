"use client";

import { useEffect, useState } from "react";
import RankingComparison from "./RankingComparison";
import { getCommunityAuth, subscribeCommunityAuth } from "@/lib/community-client";
import Button from "./ui/Button";
import Link from "next/link";

type Payload = {
  myStats: {
    logStreak: number;
    planStreak: number;
    comebackCount: number;
    achievementRate: number;
  };
  rivals: {
    id: string;
    name: string;
    logStreak: number;
    planStreak: number;
    comebackCount: number;
    achievementRate: number;
  }[];
};

export default function CommunityLeaderboard() {
  const [auth, setAuth] = useState(() => getCommunityAuth());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCommunityAuth(() => setAuth(getCommunityAuth()));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    void fetch("/api/community/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: auth.userId, secret: auth.secret }),
    })
      .catch(() => null)
      .then(() =>
        fetch("/api/community/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: auth.userId, secret: auth.secret }),
        })
      )
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setData({ myStats: json.myStats, rivals: json.rivals }))
      .catch(() => setError("読み込みに失敗しました。"))
      .finally(() => setLoading(false));
  }, [auth]);

  if (!auth) {
    return (
      <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-subtle py-10 px-4 text-center">
        <p className="text-sm text-fg-muted mb-1">コミュニティ参加が必要です</p>
        <p className="text-xs text-fg-subtle mb-4">設定からコミュニティに参加できます</p>
        <Link href="/settings">
          <Button variant="primary" className="min-h-[36px] px-4 text-xs">
            設定を開く
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="h-24 rounded-[var(--radius-xl)] bg-bg-subtle animate-pulse" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-subtle py-6 px-4 text-center">
        <p className="text-sm text-fg-muted">{error ?? "読み込みに失敗しました"}</p>
      </div>
    );
  }

  return <RankingComparison myStats={data.myStats} rivals={data.rivals} />;
}
