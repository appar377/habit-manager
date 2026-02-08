"use client";

type Props = {
  /** 立ち上がった回数（ストリーク途切れ後の再開回数） */
  count: number;
};

/** 分析用：七転び八起きのカード。何回転んでも立ち上がった回数が自分になる、という励まし。 */
export default function ComebackCard({ count }: Props) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border-2 border-border bg-primary-soft p-4 shadow-[var(--shadow-card)]"
      role="status"
      aria-label={`七転び八起き 立ち上がり${count}回`}
    >
      <p className="text-xs font-medium text-fg-muted mb-1">七転び八起き</p>
      <p className="text-2xl font-bold text-primary tabular-nums flex items-center gap-1">
        <span aria-hidden>🌱</span>
        立ち上がり {count} 回
      </p>
      <p className="text-[11px] text-fg-subtle mt-1">
        ストリークが途切れても、また記録を再開した回数。何度転んでも立ち上がればいい。
      </p>
    </div>
  );
}
