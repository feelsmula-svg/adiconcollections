"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "./cn";
import { Stack } from "./Stack";
import { Text } from "./Text";

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const describedBy = hint || error ? hintId : undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        invalid: error ? true : undefined,
      })
    : children;

  return (
    <Stack gap="xs" className={cn(className)}>
      <label
        htmlFor={id}
        className="font-label-caps uppercase tracking-[0.08em] text-[11px] text-on-surface-variant"
      >
        {label}
        {required && (
          <span aria-hidden className="text-error">
            {" "}
            *
          </span>
        )}
      </label>
      {control}
      {(hint || error) && (
        <Text
          id={hintId}
          variant="body-sm"
          tone={error ? "error" : "muted"}
          className="text-[11px]"
        >
          {error || hint}
        </Text>
      )}
    </Stack>
  );
}
