import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "./cn";

type Rounded = "none" | "lg" | "xl" | "2xl" | "full";

const ROUNDED: Record<Rounded, string> = {
  none: "",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

type Fit = "cover" | "contain";

const FIT: Record<Fit, string> = {
  cover: "object-cover",
  contain: "object-contain",
};

interface ImageProps extends NextImageProps {
  rounded?: Rounded;
  fit?: Fit;
}

export function Image({
  rounded = "none",
  fit = "cover",
  className,
  alt,
  ...rest
}: ImageProps) {
  return (
    <NextImage
      alt={alt}
      className={cn(FIT[fit], ROUNDED[rounded], className)}
      {...rest}
    />
  );
}
