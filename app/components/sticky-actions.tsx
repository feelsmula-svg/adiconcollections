import { Box } from "@/app/components/ui";
import { CartTriggerButton } from "./cart/cart-trigger-button";

export function StickyActions() {
  return (
    <Box className="fixed bottom-lg right-lg z-50">
      <CartTriggerButton
        size="lg"
        variant="filled"
        className="shadow-lg hover:scale-110 transition-transform"
      />
    </Box>
  );
}
