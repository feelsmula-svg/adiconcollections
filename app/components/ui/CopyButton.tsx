"use client";

import { useState } from "react";
import { IconButton } from "./IconButton";

type Variant = "plain" | "tonal" | "filled" | "outline";
type Size = "sm" | "md" | "lg";

interface CopyButtonProps {
  /** The text written to the clipboard when pressed. */
  value: string;
  /** Accessible label describing what is copied (e.g. "Copy promo code"). */
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  disabled?: boolean;
  /** How long the confirmation checkmark stays visible, in ms. */
  resetMs?: number;
}

export function CopyButton({
  value,
  label,
  variant = "plain",
  size = "sm",
  className,
  disabled,
  resetMs = 1500,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {
      // Clipboard access was blocked — leave the icon unchanged.
    }
  };

  return (
    <IconButton
      icon={copied ? "check" : "content_copy"}
      label={copied ? "Copied" : label}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      onClick={handleCopy}
    />
  );
}
