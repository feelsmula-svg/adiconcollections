"use client";

import { cn } from "./cn";
import { Icon } from "./Icon";

type Size = "sm" | "md";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

const SIZE: Record<
  Size,
  { btn: string; icon: string; pad: string; valueText: string }
> = {
  sm: {
    btn: "w-6 h-6",
    icon: "text-sm",
    pad: "p-[3px]",
    valueText: "text-body-sm",
  },
  md: {
    btn: "w-7 h-7",
    icon: "text-base",
    pad: "p-xs",
    valueText: "text-body-md",
  },
};

const BUTTON_STYLE =
  "inline-flex items-center justify-center rounded-full bg-surface text-on-surface " +
  "hover:bg-primary hover:text-on-primary " +
  "active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-on-surface " +
  "transition-all duration-150";

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  label = "Quantity",
  size = "md",
  fullWidth = false,
  className,
}: QuantityStepperProps) {
  const { btn, icon, pad, valueText } = SIZE[size];
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-xs rounded-full border border-outline-variant bg-surface-container-low",
        pad,
        fullWidth && "w-full justify-between",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={dec}
        disabled={value <= min}
        className={cn(BUTTON_STYLE, btn)}
      >
        <Icon name="remove" className={icon} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "font-bold text-center select-none",
          valueText,
          fullWidth ? "flex-1" : "min-w-[28px]",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={value >= max}
        className={cn(BUTTON_STYLE, btn)}
      >
        <Icon name="add" className={icon} />
      </button>
    </div>
  );
}
