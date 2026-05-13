import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";
import { Icon } from "./Icon";

type Variant = "plain" | "tonal" | "filled" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  plain: "text-on-surface hover:bg-surface-variant",
  tonal:
    "bg-surface-container-highest text-on-surface hover:bg-surface-container-high",
  filled: "bg-primary text-on-primary hover:brightness-110",
  outline:
    "border border-outline-variant text-on-surface hover:bg-surface-container",
};

const SIZE: Record<Size, { btn: string; icon: string }> = {
  sm: { btn: "w-8 h-8", icon: "text-lg" },
  md: { btn: "w-10 h-10", icon: "text-xl" },
  lg: { btn: "w-12 h-12", icon: "text-2xl" },
};

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: string;
  label: string;
  variant?: Variant;
  size?: Size;
  filled?: boolean;
}

export function IconButton({
  icon,
  label,
  variant = "plain",
  size = "md",
  filled,
  type = "button",
  className,
  ...rest
}: IconButtonProps) {
  const { btn, icon: iconCls } = SIZE[size];
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        btn,
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} filled={filled} className={iconCls} />
    </button>
  );
}
