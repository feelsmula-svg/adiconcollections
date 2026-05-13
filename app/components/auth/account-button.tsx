"use client";

import { useState } from "react";
import { IconButton } from "@/app/components/ui";
import { AuthModal } from "./auth-modal";

type Size = "sm" | "md" | "lg";

interface AccountButtonProps {
  size?: Size;
  className?: string;
}

export function AccountButton({ size = "sm", className }: AccountButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        icon="person"
        label="Sign in or create an account"
        size={size}
        variant="plain"
        className={className}
        onClick={() => setOpen(true)}
      />
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
