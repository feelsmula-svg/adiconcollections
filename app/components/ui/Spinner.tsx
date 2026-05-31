import { cn } from "./cn";

type Size = "sm" | "md" | "lg";
type Tone = "primary" | "on-primary" | "muted";

const SIZE: Record<Size, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

// The ring is drawn from a single coloured edge over transparent sides, so the
// spin reads as a sweeping arc. Colours come from theme tokens only.
const TONE: Record<Tone, string> = {
  primary: "border-primary/25 border-t-primary",
  "on-primary": "border-on-primary/30 border-t-on-primary",
  muted: "border-outline-variant border-t-on-surface-variant",
};

interface SpinnerProps {
  size?: Size;
  tone?: Tone;
  /** Accessible label announced to screen readers. */
  label?: string;
  className?: string;
}

export function Spinner({
  size = "md",
  tone = "primary",
  label = "Loading",
  className,
}: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-flex", className)}>
      <span
        aria-hidden
        className={cn(
          "inline-block rounded-full animate-spin",
          SIZE[size],
          TONE[tone],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
