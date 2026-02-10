import CommunityLeaderboard from "@/components/CommunityLeaderboard";

export default async function RankingPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-lg font-bold text-foreground">コミュニティ</h1>
        <p className="text-sm text-fg-muted mt-0.5">フレンドと進捗をシェアして、週ごとの伸びを競う</p>
      </header>

      <CommunityLeaderboard />

      <div className="rounded-[var(--radius-xl)] border border-border bg-bg-subtle p-4 text-center text-sm text-fg-muted">
        フレンド管理は「設定」から行えます。
      </div>
    </div>
  );
}
