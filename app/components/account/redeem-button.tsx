"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/app/components/ui";
import { RewardsModal } from "./rewards-modal";

interface RedeemButtonProps {
  variant?: "primary" | "inverse" | "ghost" | "outline";
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

export function RedeemButton({
  variant = "inverse",
  fullWidth,
  className,
  children = "Redeem now",
}: RedeemButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size="sm"
        fullWidth={fullWidth}
        caps={false}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <RewardsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
