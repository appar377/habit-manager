"use client";

import { motion } from "framer-motion";
import { BOUNCE_SPRING } from "@/lib/motion";

type Props = {
  /** 連続日数。未指定なら「今日も続けよう」のみ */
  count?: number;
  className?: string;
};

/** ゲーム風「連続○日」バッジ。習慣の継続を視覚的に励ます。 */
export default function StreakBadge({ count, className = "" }: Props) {
  const hasStreak = count != null && count > 0;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={BOUNCE_SPRING}
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-streak-soft text-streak px-3 py-1.5 text-sm font-semibold shadow-[var(--shadow-card)] ${className}`}
      role="status"
      aria-label={count != null ? `連続${count}日` : "今日も続けよう"}
    >
      <motion.span
        aria-hidden
        animate={hasStreak ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
      >
        🔥
      </motion.span>
      {hasStreak ? (
        <span>連続{count}日</span>
      ) : (
        <span>今日も続けよう</span>
      )}
    </motion.div>
  );
}
