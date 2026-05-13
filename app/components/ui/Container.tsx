import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Width = "narrow" | "default" | "wide" | "full";

const WIDTH: Record<Width, string> = {
  narrow: "max-w-[720px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
  full: "max-w-none",
};

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
  children?: ReactNode;
}

export function Container({
  width = "wide",
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-lg", WIDTH[width], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
