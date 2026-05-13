import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ invalid, className, type = "text", ...rest }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full bg-surface-container text-body-md px-md py-sm rounded-lg",
          "border border-outline-variant",
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
