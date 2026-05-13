"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "./cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  bare?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, bare = false, className, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        bare
          ? "bg-transparent border-none focus:ring-0 px-0 py-0"
          : "bg-surface-container border border-outline-variant rounded-md px-md py-sm focus:outline-none focus:border-primary",
        "font-label-caps text-label-caps cursor-pointer appearance-none pr-lg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});
