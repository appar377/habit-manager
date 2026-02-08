"use client";

import { forwardRef, type ComponentProps } from "react";

type Props = Omit<ComponentProps<"select">, "className"> & {
  className?: string;
};

/** セレクトボックス。デザイントークンに準拠。 */
const Select = forwardRef<HTMLSelectElement, Props>(
  ({ className = "", children, ...rest }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full min-h-[var(--touch-min-h)] px-[var(--input-px)] rounded-lg border border-border bg-background text-foreground text-[length:var(--text-base)] outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M2.5%204.5L6%208l3.5-3.5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${className}`}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
export default Select;
