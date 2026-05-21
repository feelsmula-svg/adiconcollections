import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

interface ChipRailProps extends HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
  /**
   * Keep horizontal scrolling at every breakpoint instead of wrapping at `sm:`
   * and above. Use for content that should always stay on a single track —
   * e.g. a scrollable strip of alert cards on the dashboard.
   */
  alwaysScroll?: boolean;
  children?: ReactNode;
}

/**
 * Horizontal chip / filter / card rail.
 *
 * Default: a single-line, horizontally scrollable track on mobile that becomes
 * a normal flex-wrap row at `sm:` and above. Children are `shrink-0`, so each
 * item sits at its natural width and the user swipes through them instead of
 * seeing them wrap into a stack.
 *
 * Pass `alwaysScroll` to keep the scroll behavior at every breakpoint (no
 * `sm:` flex-wrap fallback).
 *
 * The browser scrollbar is hidden visually; touch / trackpad swipe still works.
 */
export function ChipRail({
  ariaLabel,
  alwaysScroll,
  className,
  children,
  ...rest
}: ChipRailProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex items-stretch gap-sm overflow-x-auto",
        !alwaysScroll && "sm:overflow-visible sm:flex-wrap",
        "[&>*]:shrink-0",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
