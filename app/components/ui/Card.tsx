import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "elevated" | "outlined" | "tonal" | "filled";
type Padding = "none" | "sm" | "md" | "lg" | "xl";
type Rounded = "lg" | "xl" | "2xl";

const VARIANT: Record<Variant, string> = {
  elevated: "bg-surface-container-low border border-outline-variant shadow-sm",
  outlined: "bg-surface border border-outline-variant",
  tonal: "bg-surface-container",
  filled: "bg-surface-container-high",
};

const PADDING: Record<Padding, string> = {
  none: "p-0",
  sm: "p-sm",
  md: "p-md",
  lg: "p-lg",
  xl: "p-xl",
};

const ROUNDED: Record<Rounded, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  rounded?: Rounded;
  children?: ReactNode;
}

export function Card({
  variant = "elevated",
  padding = "lg",
  rounded = "xl",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(VARIANT[variant], PADDING[padding], ROUNDED[rounded], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
