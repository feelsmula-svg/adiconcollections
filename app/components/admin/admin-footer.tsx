import { Box, Row, Text, TextLink } from "@/app/components/ui";

export function AdminFooter() {
  return (
    <Box
      role="contentinfo"
      className="mt-auto border-t border-outline-variant bg-surface-container-highest px-lg py-md sm:px-xl lg:px-2xl"
    >
      <Row align="center" justify="between" className="flex-wrap gap-md">
        <Text variant="body-sm" tone="muted">
          © {new Date().getFullYear()} Adicon Collections · Internal Admin Console.
        </Text>
        <Row gap="lg">
          <TextLink href="/admin/settings">Settings</TextLink>
          <TextLink href="/contact">Help</TextLink>
        </Row>
      </Row>
    </Box>
  );
}
