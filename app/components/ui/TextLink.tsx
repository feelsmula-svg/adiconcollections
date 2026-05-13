import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "default" | "muted" | "primary" | "bare";

const VARIANT: Record<Variant, string> = {
  default: "text-primary hover:opacity-80",
  muted: "text-on-surface-variant hover:text-primary",
  primary: "text-primary font-bold",
  bare: "",
};

interface TextLinkProps
  extends Omit<LinkProps, "className">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "color"> {
  variant?: Variant;
  className?: string;
  children?: ReactNode;
}

export function TextLink({
  variant = "default",
  className,
  children,
  ...rest
}: TextLinkProps) {
  return (
    <NextLink
      className={cn("transition-colors", VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
