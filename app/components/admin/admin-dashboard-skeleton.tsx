import { Box, Card, Row, Skeleton, Stack } from "@/app/components/ui";

function KpiCardSkeleton() {
  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack gap="sm">
        <Row align="center" justify="between">
          <Skeleton className="w-10 h-10" rounded="full" />
          <Skeleton className="h-4 w-12" rounded="full" />
        </Row>
        <Skeleton className="h-3 w-24" rounded="full" />
        <Skeleton className="h-7 w-28" rounded="lg" />
      </Stack>
    </Card>
  );
}

function ListRowSkeleton() {
  return (
    <Row gap="sm" align="center">
      <Skeleton className="w-12 h-12" rounded="lg" />
      <Stack gap="xs" className="flex-1">
        <Skeleton className="h-3 w-2/3" rounded="full" />
        <Skeleton className="h-3 w-1/3" rounded="full" />
      </Stack>
    </Row>
  );
}

/** Skeleton that mirrors the admin dashboard (`app/admin/page.tsx`). */
export function AdminDashboardSkeleton() {
  return (
    <>
      {/* Action buttons */}
      <Row gap="sm" justify="end" className="flex-wrap">
        <Skeleton className="h-9 w-36" rounded="full" />
        <Skeleton className="h-9 w-28" rounded="full" />
      </Row>

      {/* KPI cards */}
      <Box className="grid grid-cols-2 xl:grid-cols-4 gap-sm sm:gap-md lg:gap-lg">
        {Array.from({ length: 4 }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </Box>

      {/* Analytics + inventory */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <Card variant="outlined" padding="lg" rounded="2xl" className="lg:col-span-2">
          <Stack gap="lg">
            <Row align="center" justify="between" className="flex-wrap gap-md">
              <Skeleton className="h-5 w-40" rounded="lg" />
              <Skeleton className="h-6 w-28" rounded="full" />
            </Row>
            <Skeleton className="h-[260px] w-full" rounded="xl" />
            <Skeleton className="h-3 w-3/4" rounded="full" />
          </Stack>
        </Card>

        <Card variant="tonal" padding="lg" rounded="2xl">
          <Stack gap="md">
            <Skeleton className="h-5 w-40" rounded="lg" />
            <Skeleton className="h-20 w-full" rounded="lg" />
            <Skeleton className="h-20 w-full" rounded="lg" />
            <Skeleton className="h-9 w-full" rounded="full" />
          </Stack>
        </Card>
      </Box>

      {/* Recent orders + top products */}
      <Box className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        <Card variant="outlined" padding="lg" rounded="2xl" className="xl:col-span-2">
          <Stack gap="md">
            <Skeleton className="h-5 w-44" rounded="lg" />
            <Stack gap="sm">
              {Array.from({ length: 5 }, (_, i) => (
                <ListRowSkeleton key={i} />
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card variant="outlined" padding="lg" rounded="2xl">
          <Stack gap="md">
            <Skeleton className="h-5 w-36" rounded="lg" />
            <Stack gap="sm">
              {Array.from({ length: 4 }, (_, i) => (
                <ListRowSkeleton key={i} />
              ))}
            </Stack>
          </Stack>
        </Card>
      </Box>
    </>
  );
}
