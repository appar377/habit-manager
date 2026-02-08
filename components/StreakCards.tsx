"use client";

import { motion } from "framer-motion";
import AnimatedCard from "./ui/AnimatedCard";
import { STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/motion";

type Props = {
  /** ログ記録の連続日数（何かしら記録した日） */
  logStreak: number;
  /** 予定100%達成の連続日数 */
  planStreak: number;
};

/** 2種類のストリークを並べて表示。 */
export default function StreakCards({ logStreak, planStreak }: Props) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      variants={STAGGER_CONTAINER}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={STAGGER_ITEM}>
        <AnimatedCard hoverLift className="rounded-[var(--radius-xl)] border-2 border-border bg-streak-soft p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
          <p className="text-xs font-medium text-fg-muted mb-1">記録ストリーク</p>
          <motion.p
            className="text-2xl font-bold text-streak tabular-nums flex items-center gap-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span aria-hidden className="animate-float inline-block">🔥</span>
            {logStreak} 日
          </motion.p>
          <p className="text-[11px] text-fg-subtle mt-0.5">毎日ログを記録</p>
        </AnimatedCard>
      </motion.div>
      <motion.div variants={STAGGER_ITEM}>
        <AnimatedCard hoverLift className="rounded-[var(--radius-xl)] border-2 border-border bg-primary-soft p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
          <p className="text-xs font-medium text-fg-muted mb-1">達成ストリーク</p>
          <motion.p
            className="text-2xl font-bold text-primary tabular-nums flex items-center gap-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.05 }}
          >
            <span aria-hidden>✓</span>
            {planStreak} 日
          </motion.p>
          <p className="text-[11px] text-fg-subtle mt-0.5">予定をすべて完了</p>
        </AnimatedCard>
      </motion.div>
    </motion.div>
  );
}
