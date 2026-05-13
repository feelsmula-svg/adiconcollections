import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Box({ className, children, ...rest }: BoxProps) {
  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  );
}
