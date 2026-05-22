"use client";

import {
  Badge,
  Box,
  Button,
  Heading,
  Icon,
  IconButton,
  Modal,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import type { RewardsTier } from "@/app/lib/settings/rewards/types";

interface RewardsModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  tiers: RewardsTier[];
  pointsPerDollar: number;
}

export function RewardsModal({
  open,
  onClose,
  balance,
  tiers,
  pointsPerDollar,
}: RewardsModalProps) {
  const earnRate =
    pointsPerDollar === 1
      ? "1 point for every dollar"
      : `${pointsPerDollar} points for every dollar`;

  return (
    <Modal open={open} onClose={onClose} width="lg" ariaLabel="AdiCon Rewards">
      <Box className="px-lg pt-lg pb-md flex items-start justify-between gap-md">
        <Stack gap="xs" className="flex-1 min-w-0">
          <Text
            variant="label-caps"
            tone="primary"
            as="span"
            className="tracking-[0.2em]"
          >
            AdiCon Rewards
          </Text>
          <Heading level={2} variant="headline-sm">
            Your rewards balance
          </Heading>
          <Text variant="body-sm" tone="muted">
            You earn {earnRate} you spend. Reach a tier and we&apos;ll email
            your reward code at checkout.
          </Text>
        </Stack>
        <IconButton
          icon="close"
          label="Close"
          size="sm"
          variant="plain"
          onClick={onClose}
        />
      </Box>

      <Box className="px-lg pb-md">
        <Box className="rounded-2xl bg-primary text-on-primary p-lg flex items-center justify-between gap-md">
          <Stack gap="none">
            <Text
              variant="label-caps"
              tone="on-primary"
              as="span"
              className="opacity-70 tracking-[0.18em]"
            >
              Current Balance
            </Text>
            <Heading
              level={3}
              variant="display-lg"
              tone="on-primary"
              size="headline-md"
              className="leading-none"
            >
              {balance.toLocaleString()}
            </Heading>
            <Text
              variant="body-sm"
              tone="on-primary"
              as="span"
              className="opacity-80"
            >
              {balance === 1 ? "point available" : "points available"}
            </Text>
          </Stack>
          <Box className="w-12 h-12 rounded-full bg-on-primary/15 flex items-center justify-center shrink-0">
            <Icon name="loyalty" filled className="text-on-primary text-2xl" />
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 overflow-y-auto px-lg pb-md">
        {tiers.length === 0 ? (
          <Box className="rounded-xl border border-dashed border-outline-variant p-lg">
            <Stack gap="sm" align="center" className="text-center">
              <Icon name="redeem" className="text-primary text-3xl" />
              <Text variant="body-md" className="font-semibold">
                Rewards are coming soon
              </Text>
              <Text variant="body-sm" tone="muted">
                We&apos;re setting up the reward tiers — check back shortly.
              </Text>
            </Stack>
          </Box>
        ) : (
          <Stack gap="sm">
            {tiers.map((tier) => {
              const affordable = balance >= tier.points;
              return (
                <Box
                  key={tier.id}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md"
                >
                  <Row gap="md" align="center" wrap>
                    <Stack gap="none" className="flex-1 min-w-[180px]">
                      <Text variant="body-md" className="font-semibold">
                        {tier.label}
                      </Text>
                      {tier.blurb ? (
                        <Text variant="body-sm" tone="muted">
                          {tier.blurb}
                        </Text>
                      ) : null}
                    </Stack>
                    <Badge
                      tone={affordable ? "primary" : "neutral"}
                      size="sm"
                    >
                      {tier.points} pts
                    </Badge>
                  </Row>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Box className="px-lg py-md border-t border-outline-variant bg-surface-container-low">
        <Row gap="sm" justify="end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            caps={false}
            onClick={onClose}
          >
            Done
          </Button>
        </Row>
      </Box>
    </Modal>
  );
}
