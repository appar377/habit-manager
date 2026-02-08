"use client";

type Props = {
  /** 連続日数。未指定なら「今日も続けよう」のみ */
  count?: number;
  className?: string;
};

/** ゲーム風「連続○日」バッジ。習慣の継続を視覚的に励ます。 */
export default function StreakBadge({ count, className = "" }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-streak-soft text-streak px-3 py-1.5 text-sm font-semibold ${className}`}
      role="status"
      aria-label={count != null ? `連続${count}日` : "今日も続けよう"}
    >
      <span aria-hidden>🔥</span>
      {count != null && count > 0 ? (
        <span>連続{count}日</span>
      ) : (
        <span>今日も続けよう</span>
      )}
    </div>
  );
}
