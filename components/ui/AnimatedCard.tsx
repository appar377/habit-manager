"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { CARD_ENTER } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** ホバー時に少し浮く */
  hoverLift?: boolean;
};

/** カードの登場アニメーション + 任意でホバー浮き。 */
export default function AnimatedCard({ children, className = "", hoverLift }: Props) {
  return (
    <motion.div
      {...CARD_ENTER}
      whileHover={hoverLift ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}
