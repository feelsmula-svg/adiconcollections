import { Box, Card, Skeleton, Stack } from "@/app/components/ui";

export default function Loading() {
  return (
    <Box className="max-w-[1280px] mx-auto w-full px-md py-lg md:px-2xl md:py-2xl">
      <Stack gap="xl" className="md:gap-2xl">
        <Stack gap="sm">
          <Skeleton className="h-3 w-28" rounded="full" />
          <Skeleton className="h-8 w-64 max-w-[80vw]" rounded="lg" />
        </Stack>
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="sm">
                <Skeleton className="h-4 w-32" rounded="full" />
                <Skeleton className="h-3 w-full" rounded="full" />
                <Skeleton className="h-3 w-2/3" rounded="full" />
              </Stack>
            </Card>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
