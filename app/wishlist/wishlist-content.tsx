"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Row,
  Section,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";

export function WishlistContent() {
  const router = useRouter();
  return (
    <Container width="default">
      <Section padding="md">
        <Stack gap="xl" className="w-full">
          <Box className="w-full">
            <Row gap="sm" align="center" wrap className="mb-md">
              <TextLink
                href="/"
                variant="muted"
                className="text-label-caps font-label-caps uppercase"
              >
                Home
              </TextLink>
              <Icon
                name="chevron_right"
                className="text-sm text-outline-variant"
              />
              <Text variant="label-caps" tone="primary">
                Wish List
              </Text>
            </Row>
            <Box className="max-w-[42rem]">
              <Heading
                level={1}
                variant="display-xl"
                size="headline-md"
                className="leading-tight mb-sm"
              >
                Your wish list
              </Heading>
              <Text variant="body-md" tone="muted">
                Save pieces from the collection to revisit later. We&apos;ll keep
                them here for whenever you&apos;re ready.
              </Text>
            </Box>
          </Box>

          <Stack
            gap="md"
            align="center"
            justify="center"
            className="py-3xl text-center"
          >
            <Icon
              name="favorite"
              className="text-5xl text-on-surface-variant opacity-60"
            />
            <Heading
              level={2}
              variant="headline-sm"
              size="body-lg"
              className="font-bold"
            >
              Your wish list is empty
            </Heading>
            <Text variant="body-sm" tone="muted">
              Tap the heart on any piece to save it here.
            </Text>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/shop")}
            >
              Browse the collection
            </Button>
          </Stack>
        </Stack>
      </Section>
    </Container>
  );
}
