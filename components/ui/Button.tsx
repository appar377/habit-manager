"use client";

import { type ComponentProps } from "react";
import Pressable from "./Pressable";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ComponentProps<typeof Pressable> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-contrast font-[number:var(--font-medium)] hover:opacity-90 disabled:opacity-50",
  secondary:
    "border border-border-strong bg-background text-foreground hover:bg-bg-subtle disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground hover:bg-bg-subtle disabled:opacity-50",
  danger:
    "border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50",
};

/** ボタン。デザイントークンに準拠。variant で見た目を切り替え。 */
export default function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <Pressable
      className={`min-h-[var(--touch-min-h)] rounded-lg px-4 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
