import type { HTMLAttributes } from "react";
import { cn } from "./cn";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  filled?: boolean;
  label?: string;
}

export function Icon({
  name,
  filled,
  label,
  className,
  ...rest
}: IconProps) {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true };

  return (
    <span
      {...a11y}
      className={cn(
        "material-symbols-outlined",
        filled && "filled",
        className,
      )}
      {...rest}
    >
      {name}
    </span>
  );
}
