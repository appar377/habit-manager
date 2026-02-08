"use client";

import { type ComponentProps } from "react";

type Props = ComponentProps<"div"> & {
  compact?: boolean;
  /** ホバー時に少し浮く（クリック可能なカード用） */
  interactive?: boolean;
};

/** カード。ゲーム風の角丸＋ソフトシャドウ。 */
export default function Card({
  className = "",
  compact,
  interactive,
  children,
  ...rest
}: Props) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] ${compact ? "p-3" : ""} ${interactive ? "transition-all hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 active:translate-y-0" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
