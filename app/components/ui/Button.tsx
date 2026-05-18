import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "inverse"
  | "destructive";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container",
  secondary:
    "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container",
  outline:
    "border border-outline text-on-surface hover:bg-surface-container",
  ghost: "text-on-surface hover:bg-surface-container",
  inverse: "bg-white text-black hover:bg-primary-fixed",
  destructive: "bg-error text-on-error hover:bg-error-container",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-md py-xs text-body-sm",
  md: "px-lg py-sm text-body-md",
  lg: "px-xl py-md text-body-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  caps?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  caps = true,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
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
    </button>
  );
}
