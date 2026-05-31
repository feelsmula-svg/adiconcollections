import { Box, Card, Row, Skeleton, Stack } from "@/app/components/ui";

interface AdminListSkeletonProps {
  /** Number of placeholder rows. */
  rows?: number;
  /** Show a row of filter-chip placeholders above the list. */
  filters?: boolean;
}

/**
 * Skeleton for admin list/table pages (orders, products, customers, inventory,
 * messages): an optional filter rail above a card of repeating rows.
 */
export function AdminListSkeleton({
  rows = 8,
  filters = true,
}: AdminListSkeletonProps) {
  return (
    <>
      {filters ? (
        <Row gap="xs" className="flex-wrap">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-20" rounded="full" />
          ))}
        </Row>
      ) : null}

      <Card variant="outlined" padding="none" rounded="2xl">
        <Stack gap="none">
          <Box className="px-lg py-md border-b border-outline-variant">
            <Skeleton className="h-4 w-32" rounded="full" />
          </Box>
          {Array.from({ length: rows }, (_, i) => (
            <Box
              key={i}
              className="px-lg py-md border-b border-outline-variant last:border-0"
            >
              <Row gap="md" align="center">
                <Skeleton className="w-10 h-10 shrink-0" rounded="lg" />
                <Skeleton className="h-3 flex-1 max-w-[220px]" rounded="full" />
                <Skeleton className="h-3 w-24 hidden sm:block" rounded="full" />
                <Skeleton className="h-3 w-16 hidden md:block" rounded="full" />
                <Skeleton className="h-6 w-16 shrink-0" rounded="full" />
              </Row>
            </Box>
          ))}
        </Stack>
      </Card>
    </>
  );
}
