"use client";

import { useId, type ReactNode } from "react";
import { cn } from "./cn";
import { Badge } from "./Badge";

interface RadioOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  recommended?: string;
  className?: string;
  children: ReactNode;
}

export function RadioOption({
  name,
  value,
  checked,
  onChange,
  recommended,
  className,
  children,
}: RadioOptionProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex items-center gap-md p-md rounded-lg cursor-pointer transition-colors",
        checked
          ? "border-2 border-primary bg-surface-container-low"
          : "border border-outline-variant hover:border-primary/60",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-5 w-5 accent-primary cursor-pointer"
      />
      <div className="flex-1 min-w-0">{children}</div>
      {recommended && (
        <span className="absolute -top-2 left-md">
          <Badge tone="tertiary" size="sm">
            {recommended}
          </Badge>
        </span>
      )}
    </label>
  );
}
