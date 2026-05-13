import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Tone = "primary" | "secondary" | "tertiary" | "neutral" | "error";
type Size = "sm" | "md";

const TONE: Record<Tone, string> = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary text-on-tertiary",
  neutral: "bg-surface-container-high text-on-surface",
  error: "bg-error-container text-on-error-container",
};

const SIZE: Record<Size, string> = {
  sm: "px-xs h-[18px] min-w-[18px] text-[10px]",
  md: "px-sm h-[22px] min-w-[22px] text-label-caps",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  children?: ReactNode;
}

export function Badge({
  tone = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-label-caps uppercase tracking-[0.08em] leading-none",
        TONE[tone],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
