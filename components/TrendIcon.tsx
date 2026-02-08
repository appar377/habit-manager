/** トレンドを ↑ ↓ → で表示。良し悪しは評価しない（色は方向のみ） */
type Trend = "up" | "down" | "same";

const size = 20;

export default function TrendIcon({ trend, className = "" }: { trend: Trend; className?: string }) {
  const base = "inline-flex items-center justify-center rounded-full";
  const color =
    trend === "same"
      ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
      : "bg-neutral-200 dark:bg-neutral-700 text-foreground";

  if (trend === "up") {
    return (
      <span
        className={`${base} ${color} ${className}`}
        role="img"
        aria-label="前週比 増加"
        title="前週比 増加"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span
        className={`${base} ${color} ${className}`}
        role="img"
        aria-label="前週比 減少"
        title="前週比 減少"
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={`${base} ${color} ${className}`}
      role="img"
      aria-label="前週比 変わらず"
      title="前週比 変わらず"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 12h14" />
      </svg>
    </span>
  );
}

export type { Trend };
