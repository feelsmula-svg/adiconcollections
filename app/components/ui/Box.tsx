import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cn(className)} {...rest}>
      {children}
    </div>
  );
});
