"use client";

import { useId } from "react";
import { cn } from "./cn";

interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  className,
}: CheckboxProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-sm cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-outline-variant accent-primary cursor-pointer disabled:cursor-not-allowed"
      />
      {label && (
        <span className="text-body-md text-on-surface-variant select-none">
          {label}
        </span>
      )}
    </label>
  );
}
