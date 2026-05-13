"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full bg-surface-container text-body-md px-md py-sm rounded-lg",
          "border border-outline-variant resize-y",
          "focus:outline-none focus:border-primary",
          "placeholder:text-on-surface-variant placeholder:opacity-70",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          invalid && "border-error focus:border-error",
          className,
        )}
        {...rest}
      />
    );
  },
);
