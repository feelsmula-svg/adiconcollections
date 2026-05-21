import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Tone = "light" | "dark";
type Size = "sm" | "md" | "lg";

const TONE: Record<Tone, string> = {
  light:
    "border border-white/30 text-white hover:bg-white/10",
  dark: "border border-outline-variant text-on-surface hover:bg-surface-container",
};

const SIZE: Record<Size, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

interface SocialIconLinkProps
  extends Omit<LinkProps, "className">,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "color"> {
  tone?: Tone;
  size?: Size;
  label: string;
  children: ReactNode;
}

export function SocialIconLink({
  tone = "dark",
  size = "md",
  label,
  className,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
  ...rest
}: SocialIconLinkProps) {
  return (
    <NextLink
      aria-label={label}
      title={label}
      target={target}
      rel={rel}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors",
        SIZE[size],
        TONE[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
