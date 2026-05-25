import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type Align = "start" | "center" | "end" | "stretch";
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
};

const JUSTIFY: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  children?: ReactNode;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = "md", align, justify, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col",
        GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
