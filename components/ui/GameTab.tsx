"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type Props = {
  href: string;
  isSelected: boolean;
  children: ReactNode;
  ariaLabel?: string;
};

/** ゲーム風のタブ：選択時は押し込まれた感じ、未選択はホバーで浮く */
export default function GameTab({ href, isSelected, children, ariaLabel }: Props) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isSelected}
      aria-label={ariaLabel}
      className={`
        min-h-[40px] min-w-[48px] flex items-center justify-center gap-1.5 rounded-[var(--radius-lg)]
        text-sm font-bold transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]
        select-none
        ${isSelected
          ? "bg-primary text-primary-contrast shadow-[inset_0_2px_0_rgba(0,0,0,0.15)] scale-[0.98]"
          : "text-fg-muted hover:text-foreground hover:bg-bg-muted hover:scale-[1.02] active:scale-[0.99]"
        }
      `}
    >
      {children}
    </Link>
  );
}
