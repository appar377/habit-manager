"use client";

import { forwardRef, type ComponentProps } from "react";

type Props = Omit<ComponentProps<"input">, "className"> & {
  className?: string;
};

/** テキスト入力。デザイントークン（高さ・余白・角丸・枠色）に準拠。 */
const Input = forwardRef<HTMLInputElement, Props>(
  ({ className = "", ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full min-h-[var(--touch-min-h)] px-[var(--input-px)] rounded-lg border border-border bg-background text-foreground text-[length:var(--text-base)] outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${className}`}
        {...rest}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
