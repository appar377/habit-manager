"use client";

import { forwardRef, type ComponentProps } from "react";
import { motion } from "framer-motion";
import { TAP_SCALE, TAP_SPRING } from "@/lib/motion";

type PressableProps = Omit<ComponentProps<typeof motion.button>, "whileTap" | "transition"> & {
  /** 押下時のスケールを無効にする */
  noScale?: boolean;
};

/**
 * 全UIで統一するボタンのマイクロアニメーション。
 * 押下時: 軽く縮む + スプリングで戻る。触感のみで過剰な演出はしない。
 */
const Pressable = forwardRef<HTMLButtonElement, PressableProps>(
  ({ noScale, className = "", children, type = "button", ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={noScale ? undefined : { scale: TAP_SCALE }}
        transition={TAP_SPRING}
        className={`touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Pressable.displayName = "Pressable";

export default Pressable;
