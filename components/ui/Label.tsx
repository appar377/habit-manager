"use client";

import { type ComponentProps } from "react";

type Props = ComponentProps<"label"> & {
  /** 必須マークを表示するか */
  required?: boolean;
};

/** フォームラベル。デザイントークン（余白・色・フォント）に準拠。 */
export default function Label({ className = "", required, children, ...rest }: Props) {
  return (
    <label
      className={`block text-xs font-medium text-fg-muted mb-1 ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-red-500 dark:text-red-400 ml-0.5" aria-hidden>*</span>}
    </label>
  );
}
