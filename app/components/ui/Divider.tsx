import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type Orientation = "horizontal" | "vertical";

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
}

export function Divider({
  orientation = "horizontal",
  className,
  ...rest
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-outline-variant",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className,
      )}
      {...rest}
    />
  );
}
