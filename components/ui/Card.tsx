"use client";

import { type ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  /** パディングを詰める */
  compact?: boolean;
};

/** カード（枠＋背景）。デザイントークン（角丸・枠・余白）に準拠。 */
export default function Card({
  className = "",
  compact,
  children,
  ...rest
}: Props) {
  return (
    <div
      className={`rounded-xl border border-border bg-bg-muted p-[var(--space-4)] ${compact ? "p-[var(--space-3)]" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
