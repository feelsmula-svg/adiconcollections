import { Card, Spinner, Stack } from "@/app/components/ui";

/**
 * Localized loading state for a table/section wrapped in `<Suspense>`: a single
 * spinner where the table sits, so a tab/filter switch spins just this area
 * instead of replacing the whole page with a skeleton.
 */
export function AdminTableLoading() {
  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <Stack
        gap="md"
        align="center"
        justify="center"
        className="min-h-[280px]"
      >
        <Spinner size="lg" />
      </Stack>
    </Card>
  );
}
