"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/app/components/ui";
import type { RewardsTier } from "@/app/lib/settings/rewards/types";
import { RewardsModal } from "./rewards-modal";

interface RedeemButtonProps {
  balance: number;
  tiers: RewardsTier[];
  pointsPerDollar: number;
  variant?: "primary" | "inverse" | "ghost" | "outline";
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

export function RedeemButton({
  balance,
  tiers,
  pointsPerDollar,
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
      <RewardsModal
        open={open}
        onClose={() => setOpen(false)}
        balance={balance}
        tiers={tiers}
        pointsPerDollar={pointsPerDollar}
      />
    </>
  );
}
