import { Box, IconButton, Row } from "@/app/components/ui";
import { CartTriggerButton } from "./cart/cart-trigger-button";

export function StickyActions() {
  return (
    <Box className="fixed bottom-lg right-lg z-50">
      <Row gap="sm" align="center" className="flex-col-reverse">
        <IconButton
          icon="chat_bubble"
          label="Open chat"
          variant="tonal"
          size="lg"
          className="shadow-lg hover:scale-110 transition-transform bg-surface text-primary"
        />
        <CartTriggerButton
          size="lg"
          variant="filled"
          className="shadow-lg hover:scale-110 transition-transform"
        />
      </Row>
    </Box>
  );
}
