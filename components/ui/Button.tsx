"use client";

import { type ComponentProps } from "react";
import Pressable from "./Pressable";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "streak";

type Props = ComponentProps<typeof Pressable> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-contrast font-semibold shadow-[var(--shadow-button)] hover:brightness-110 hover:shadow-[var(--shadow-glow)] active:shadow-none active:translate-y-0.5 disabled:opacity-50 disabled:hover:brightness-100 disabled:hover:shadow-[var(--shadow-button)]",
  secondary:
    "border-2 border-border-strong bg-bg-muted text-foreground font-medium hover:bg-bg-subtle active:bg-bg-subtle disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground font-medium hover:bg-bg-subtle active:bg-bg-subtle disabled:opacity-50",
  danger:
    "border-2 border-danger bg-danger-soft text-danger font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-50",
  streak:
    "bg-streak text-white font-semibold shadow-[var(--shadow-button)] hover:brightness-110 hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] active:shadow-none active:translate-y-0.5 disabled:opacity-50",
};

/** ゲームっぽいボタン。primary は緑・丸み強め。 */
export default function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <Pressable
      className={`min-h-[var(--touch-min-h)] rounded-[var(--radius-pill)] px-6 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
