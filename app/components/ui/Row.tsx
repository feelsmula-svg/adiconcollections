import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around";

const GAP: Record<Gap, string> = {
  none: "gap-0",
  xs: "gap-xs",
  sm: "gap-sm",
  md: "gap-md",
  lg: "gap-lg",
  xl: "gap-xl",
  "2xl": "gap-2xl",
  "3xl": "gap-3xl",
};

const ALIGN: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const JUSTIFY: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

interface RowProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  children?: ReactNode;
}

export function Row({
  gap = "md",
  align = "center",
  justify,
  wrap,
  className,
  children,
  ...rest
}: RowProps) {
  return (
    <div
      className={cn(
        "flex flex-row",
        wrap && "flex-wrap",
        GAP[gap],
        ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
