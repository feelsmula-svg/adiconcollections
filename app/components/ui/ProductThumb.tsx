import { cn } from "./cn";
import { Image } from "./Image";

type ThumbSize = "sm" | "md" | "lg" | "xl";

interface SizeSpec {
  box: string;
  px: number;
}

const SIZE: Record<ThumbSize, SizeSpec> = {
  sm: { box: "w-[56px] h-[56px]", px: 56 },
  md: { box: "w-[64px] h-[64px]", px: 64 },
  lg: { box: "w-[120px] h-[120px]", px: 120 },
  xl: { box: "w-[160px] h-[160px]", px: 160 },
};

type Rounded = "lg" | "xl" | "2xl";

const ROUNDED: Record<Rounded, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

interface ProductThumbProps {
  src: string;
  alt: string;
  size?: ThumbSize;
  rounded?: Rounded;
  shrink?: boolean;
  className?: string;
}

export function ProductThumb({
  src,
  alt,
  size = "sm",
  rounded = "lg",
  shrink = true,
  className,
}: ProductThumbProps) {
  const spec = SIZE[size];
  return (
    <div
      className={cn(
        spec.box,
        ROUNDED[rounded],
        "overflow-hidden bg-surface-container",
        shrink && "shrink-0",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={spec.px}
        height={spec.px}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
