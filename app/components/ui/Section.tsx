import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Padding = "none" | "sm" | "md" | "lg" | "section";

const PADDING: Record<Padding, string> = {
  none: "py-0",
  sm: "py-lg",
  md: "py-xl",
  lg: "py-2xl",
  section: "py-section",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  padding?: Padding;
  children?: ReactNode;
}

export function Section({
  padding = "section",
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={cn(PADDING[padding], className)} {...rest}>
      {children}
    </section>
  );
}
