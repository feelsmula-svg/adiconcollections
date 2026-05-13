import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type TextVariant =
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "label-caps"
  | "editorial-italic";

type Size =
  | "display-xl"
  | "display-lg"
  | "headline-md"
  | "headline-sm"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "label-caps"
  | "editorial-italic";

type Tone =
  | "default"
  | "muted"
  | "inverse"
  | "primary"
  | "on-primary"
  | "secondary"
  | "tertiary"
  | "error";

type Align = "start" | "center" | "end";

const FONT: Record<TextVariant, string> = {
  "body-lg": "font-body-lg",
  "body-md": "font-body-md",
  "body-sm": "font-body-sm",
  "label-caps": "font-label-caps uppercase",
  "editorial-italic": "font-editorial-italic italic",
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
  "editorial-italic": "text-editorial-italic",
};

const TONE: Record<Tone, string> = {
  default: "text-on-surface",
  muted: "text-on-surface-variant",
  inverse: "text-inverse-on-surface",
  primary: "text-primary",
  "on-primary": "text-on-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  error: "text-error",
};

const ALIGN: Record<Align, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  size?: Size;
  tone?: Tone;
  align?: Align;
  as?: "p" | "span" | "div" | "label";
  children?: ReactNode;
}

export function Text({
  variant = "body-md",
  size,
  tone = "default",
  align,
  as: Tag = "p",
  className,
  children,
  ...rest
}: TextProps) {
  const sizeClass = size ? SIZE[size] : SIZE[variant];
  return (
    <Tag
      className={cn(
        FONT[variant],
        sizeClass,
        TONE[tone],
        align && ALIGN[align],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
