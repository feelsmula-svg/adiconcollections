"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./cn";

interface RangeSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  function RangeSlider({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="range"
        className={cn(
          "w-full accent-primary cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
        {...rest}
      />
    );
  },
);
