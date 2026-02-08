"use client";

type Props = {
  /** ログ記録の連続日数（何かしら記録した日） */
  logStreak: number;
  /** 予定100%達成の連続日数 */
  planStreak: number;
};

/** 2種類のストリークを並べて表示。 */
export default function StreakCards({ logStreak, planStreak }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-[var(--radius-xl)] border-2 border-border bg-streak-soft p-4 shadow-[var(--shadow-card)]">
        <p className="text-xs font-medium text-fg-muted mb-1">記録ストリーク</p>
        <p className="text-2xl font-bold text-streak tabular-nums flex items-center gap-1">
          <span aria-hidden>🔥</span>
          {logStreak} 日
        </p>
        <p className="text-[11px] text-fg-subtle mt-0.5">毎日ログを記録</p>
      </div>
      <div className="rounded-[var(--radius-xl)] border-2 border-border bg-primary-soft p-4 shadow-[var(--shadow-card)]">
        <p className="text-xs font-medium text-fg-muted mb-1">達成ストリーク</p>
        <p className="text-2xl font-bold text-primary tabular-nums flex items-center gap-1">
          <span aria-hidden>✓</span>
          {planStreak} 日
        </p>
        <p className="text-[11px] text-fg-subtle mt-0.5">予定をすべて完了</p>
      </div>
    </div>
  );
}
