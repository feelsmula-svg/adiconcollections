import {
  Box,
  Container,
  Section,
  Skeleton,
  Stack,
} from "@/app/components/ui";

export default function Loading() {
  return (
    <Section padding="md">
      <Container width="default">
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Gallery */}
          <Stack gap="sm" className="lg:col-span-7">
            <Skeleton className="aspect-square w-full" rounded="2xl" />
            <Box className="grid grid-cols-4 gap-sm">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </Box>
          </Stack>
          {/* Info column */}
          <Stack gap="md" className="lg:col-span-5">
            <Skeleton className="h-3 w-24" rounded="full" />
            <Skeleton className="h-9 w-4/5" rounded="lg" />
            <Skeleton className="h-5 w-28" rounded="full" />
            <Stack gap="sm" className="pt-sm">
              <Skeleton className="h-3 w-full" rounded="full" />
              <Skeleton className="h-3 w-11/12" rounded="full" />
              <Skeleton className="h-3 w-3/4" rounded="full" />
            </Stack>
            <Box className="grid grid-cols-3 gap-sm pt-sm">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </Box>
            <Skeleton className="h-12 w-full pt-sm" rounded="full" />
          </Stack>
        </Box>
      </Container>
    </Section>
  );
}
