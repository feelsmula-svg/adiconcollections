import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./cn";

type Variant = "display-xl" | "display-lg" | "headline-md" | "headline-sm";

type Size =
  | "display-xl"
  | "display-lg"
  | "headline-md"
  | "headline-sm"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "label-caps";

type Tone =
  | "default"
  | "muted"
  | "inverse"
  | "primary"
  | "on-primary"
  | "secondary"
  | "tertiary";

type Align = "start" | "center" | "end";
type Level = 1 | 2 | 3 | 4 | 5 | 6;

const FONT: Record<Variant, string> = {
  "display-xl": "font-display-xl",
  "display-lg": "font-display-lg",
  "headline-md": "font-headline-md",
  "headline-sm": "font-headline-sm",
};

const SIZE: Record<Size, string> = {
  "display-xl": "text-display-xl",
  "display-lg": "text-display-lg",
  "headline-md": "text-headline-md",
  "headline-sm": "text-headline-sm",
  "body-lg": "text-body-lg",
  "body-md": "text-body-md",
  "body-sm": "text-body-sm",
  "label-caps": "text-label-caps",
};

const TONE: Record<Tone, string> = {
  default: "text-on-surface",
  muted: "text-on-surface-variant",
  inverse: "text-inverse-on-surface",
  primary: "text-primary",
  "on-primary": "text-on-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
};

const ALIGN: Record<Align, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: Level;
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  align?: Align;
  children?: ReactNode;
}

export function Heading({
  level = 2,
  variant = "headline-md",
  size,
  tone = "default",
  align,
  className,
  children,
  ...rest
}: HeadingProps) {
  const sizeClass = size ? SIZE[size] : SIZE[variant];
  return createElement(
    `h${level}`,
    {
      className: cn(
        FONT[variant],
        sizeClass,
        TONE[tone],
        align && ALIGN[align],
        className,
      ),
      ...rest,
    },
    children,
  );
}
