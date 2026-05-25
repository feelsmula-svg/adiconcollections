"use client";

import { Box, cn } from "@/app/components/ui";
import { useSession } from "@/app/lib/hooks/use-session";
import { CartTriggerButton } from "./cart/cart-trigger-button";

export function StickyActions() {
  const { user, status } = useSession();
  // The bottom tab nav (only mounted for authed non-admin users on `<md`)
  // owns the bottom edge of the viewport, so raise the floating cart button
  // above it on mobile when that nav is present.
  const raiseForTabNav =
    status === "authed" && !!user && user.role !== "admin";

  return (
    <Box
      className={cn(
        "fixed right-lg z-50",
        raiseForTabNav ? "bottom-[88px] md:bottom-lg" : "bottom-lg",
      )}
    >
      <CartTriggerButton
        size="lg"
        variant="filled"
        className="shadow-lg hover:scale-110 transition-transform"
      />
    </Box>
  );
}
