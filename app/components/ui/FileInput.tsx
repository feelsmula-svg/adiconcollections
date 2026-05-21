"use client";

import { useId, type ChangeEvent, type ReactNode } from "react";

import { cn } from "./cn";

interface FileInputProps {
  accept?: string;
  disabled?: boolean;
  onFileSelected: (file: File | null) => void;
  children?: ReactNode;
  className?: string;
}

export function FileInput({
  accept,
  disabled,
  onFileSelected,
  children,
  className,
}: FileInputProps) {
  const id = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
    // Reset so re-selecting the same file fires onChange again.
    event.target.value = "";
  }

  return (
    <>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />
      <label
        htmlFor={id}
        aria-disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-xs px-md py-sm rounded-lg cursor-pointer select-none",
          "bg-secondary-container text-on-secondary-container border border-outline-variant",
          "hover:bg-surface-container-high transition-colors",
          "focus-within:ring-2 focus-within:ring-primary",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className,
        )}
      >
        {children ?? "Choose file"}
      </label>
    </>
  );
}
