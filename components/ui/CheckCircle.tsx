"use client";

import { motion } from "framer-motion";
import Pressable from "./Pressable";
import { TAP_SPRING } from "@/lib/motion";

type Props = {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  "aria-label": string;
  "aria-pressed": boolean;
  title?: string;
};

/**
 * 予定のTODO用チェック円。押下時の縮み＋スプリングで統一触感。
 * チェックマークは状態に応じて表示（Done演出は別レイヤーで行う）。
 */
export default function CheckCircle({
  checked,
  onToggle,
  disabled,
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
  title,
}: Props) {
  return (
    <Pressable
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      title={title}
      className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm select-none ${
        checked
          ? "border-foreground bg-foreground/10"
          : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {checked && (
        <motion.span
          className="text-foreground font-medium"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={TAP_SPRING}
        >
          ✓
        </motion.span>
      )}
    </Pressable>
  );
}
