"use client";

import { motion } from "framer-motion";
import AnimatedCard from "./ui/AnimatedCard";

type Props = {
  /** 0〜1 */
  rate: number;
  label: string;
  completed: number;
  scheduled: number;
  /** サブラベル（例: "直近7日"） */
  subLabel?: string;
};

/** 達成率を大きく表示するカード（ゲーム風）。 */
export default function AchievementRateCard({
  rate,
  label,
  completed,
  scheduled,
  subLabel,
}: Props) {
  const pct = Math.round(rate * 100);
  const isFull = rate >= 1;

  return (
    <AnimatedCard hoverLift className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      {subLabel && (
        <p className="text-xs font-medium text-fg-muted mb-1">{subLabel}</p>
      )}
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <motion.span
          className={`text-3xl font-bold tabular-nums ${
            isFull ? "text-primary" : "text-foreground"
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {pct}%
        </motion.span>
        <span className="text-sm text-fg-muted">
          {completed}/{scheduled} 完了
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-bg-subtle overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isFull ? "bg-primary" : "bg-accent"}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.1 }}
        />
      </div>
    </AnimatedCard>
  );
}
