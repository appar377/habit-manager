"use client";

import { motion } from "framer-motion";
import AnimatedCard from "./ui/AnimatedCard";

type Props = {
  /** 立ち上がった回数（ストリーク途切れ後の再開回数） */
  count: number;
};

/** 分析用：七転び八起きのカード。何回転んでも立ち上がった回数が自分になる、という励まし。 */
export default function ComebackCard({ count }: Props) {
  return (
    <AnimatedCard hoverLift className="rounded-[var(--radius-xl)] border-2 border-border bg-primary-soft p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <div role="status" aria-label={`七転び八起き 立ち上がり${count}回`}>
        <p className="text-xs font-medium text-fg-muted mb-1">七転び八起き</p>
        <motion.p
          className="text-2xl font-bold text-primary tabular-nums flex items-center gap-1"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span aria-hidden className="inline-block animate-float">🌱</span>
          立ち上がり {count} 回
        </motion.p>
        <p className="text-[11px] text-fg-subtle mt-1">
          ストリークが途切れても、また記録を再開した回数。何度転んでも立ち上がればいい。
        </p>
      </div>
    </AnimatedCard>
  );
}
