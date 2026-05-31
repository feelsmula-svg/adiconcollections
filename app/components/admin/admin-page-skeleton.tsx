import type { ReactNode } from "react";

import { Box, Row, Skeleton, Stack } from "@/app/components/ui";

/**
 * Mirrors `AdminPage` (sticky top bar + padded content column) for route-level
 * loading states. The sidebar comes from the persistent `AdminFrame`, so this
 * renders only inside the content area. Pass the page-shaped skeleton as
 * children.
 */
export function AdminPageSkeleton({ children }: { children: ReactNode }) {
  return (
    <>
      <Box className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-outline-variant px-md sm:px-lg md:px-xl lg:px-2xl py-md">
        <Row align="center" justify="between" gap="md">
          <Stack gap="xs">
            <Skeleton className="h-5 w-40" rounded="lg" />
            <Skeleton className="h-3 w-56 max-w-[60vw]" rounded="full" />
          </Stack>
          <Skeleton className="w-9 h-9" rounded="full" />
        </Row>
      </Box>
      <Box className="flex-grow px-md py-md sm:px-lg sm:py-lg md:px-xl md:py-xl lg:px-2xl">
        <Stack gap="lg" className="md:gap-xl">
          {children}
        </Stack>
      </Box>
    </>
  );
}
