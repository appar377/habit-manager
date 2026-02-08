"use client";

type Props = {
  /** 立ち上がった回数（ストリーク途切れ後の再開回数） */
  count: number;
  className?: string;
};

/** 七転び八起き：何回転んでも立ち上がった回数が自分になる、という励まし表示。 */
export default function ComebackBadge({ count, className = "" }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-primary-soft text-primary px-3 py-1.5 text-sm font-semibold ${className}`}
      role="status"
      aria-label={`立ち上がり${count}回`}
    >
      <span aria-hidden>🌱</span>
      <span>立ち上がり {count}回</span>
    </div>
  );
}
