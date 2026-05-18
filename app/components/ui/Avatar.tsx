import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type AvatarSize = "sm" | "md" | "lg";
type AvatarTone = "primary" | "secondary" | "neutral";

const SIZE: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
};

const TONE: Record<AvatarTone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  neutral: "bg-surface-container-highest text-on-surface",
};

interface AvatarProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  initials: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  label: string;
}

export const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(function Avatar(
  {
    initials,
    size = "sm",
    tone = "primary",
    label,
    type = "button",
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-label-caps uppercase tracking-[0.1em] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
        SIZE[size],
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {initials}
    </button>
  );
});
