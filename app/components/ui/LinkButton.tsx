import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "inverse";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container",
  secondary:
    "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container",
  outline:
    "border border-outline text-on-surface hover:bg-surface-container",
  ghost: "text-on-surface hover:bg-surface-container",
  inverse: "bg-white text-black hover:bg-primary-fixed",
};

const SIZE: Record<Size, string> = {
  sm: "px-md py-xs text-body-sm",
  md: "px-lg py-sm text-body-md",
  lg: "px-xl py-md text-body-lg",
};

interface LinkButtonProps
  extends Omit<LinkProps, "className">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "color"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  caps?: boolean;
  children?: ReactNode;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  caps = true,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <NextLink
      className={cn(
        "inline-flex items-center justify-center transition-colors duration-300",
        caps
          ? "font-label-caps uppercase tracking-[0.2em]"
          : "font-body-md tracking-normal",
        fullWidth && "w-full",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
