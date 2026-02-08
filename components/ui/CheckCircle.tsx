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

/** 予定のTODO用チェック。完了時は緑で「クリア」感。 */
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
      className={`shrink-0 w-10 h-10 rounded-[var(--radius-pill)] border-2 flex items-center justify-center text-lg font-bold select-none transition-colors ${
        checked
          ? "border-primary bg-primary text-primary-contrast shadow-[var(--shadow-button)]"
          : "border-border-strong bg-bg-muted text-fg-subtle hover:border-fg-subtle"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {checked && (
        <motion.span
          className="text-primary-contrast"
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
