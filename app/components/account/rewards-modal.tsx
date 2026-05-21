"use client";

import { useState } from "react";

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
import { useHydrated } from "@/app/lib/state/hydration";
import { useRewardsStore } from "@/app/lib/state/rewards-store";

interface Tier {
  label: string;
  points: number;
  blurb: string;
}

const TIERS: Tier[] = [
  {
    label: "$10 store credit",
    points: 100,
    blurb: "Apply to any AdiCon order.",
  },
  {
    label: "Free domestic shipping",
    points: 250,
    blurb: "Next order, no minimum.",
  },
  {
    label: "$25 gift card",
    points: 450,
    blurb: "Use it yourself or gift it.",
  },
  {
    label: "Stylist consultation",
    points: 600,
    blurb: "30-minute video session.",
  },
];

interface RewardsModalProps {
  open: boolean;
  onClose: () => void;
}

export function RewardsModal({ open, onClose }: RewardsModalProps) {
  const hydrated = useHydrated();
  const balance = useRewardsStore((state) => state.balance);
  const redeemed = useRewardsStore((state) => state.redeemed);
  const redeem = useRewardsStore((state) => state.redeem);
  const [feedback, setFeedback] = useState<string | null>(null);

  const safeBalance = hydrated ? balance : 0;

  const handleRedeem = (tier: Tier) => {
    const reward = redeem(tier.label, tier.points);
    if (reward) {
      setFeedback(
        `Redeemed ${tier.label} — your code ${reward.code} is on its way to your inbox.`,
      );
    }
  };

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
            Redeem your points
          </Heading>
          <Text variant="body-sm" tone="muted">
            Pick a reward and we&apos;ll email the code right away.
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
              {safeBalance.toLocaleString()}
            </Heading>
            <Text
              variant="body-sm"
              tone="on-primary"
              as="span"
              className="opacity-80"
            >
              points available
            </Text>
          </Stack>
          <Box className="w-12 h-12 rounded-full bg-on-primary/15 flex items-center justify-center shrink-0">
            <Icon name="loyalty" filled className="text-on-primary text-2xl" />
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 overflow-y-auto px-lg pb-md">
        <Stack gap="sm">
          {feedback ? (
            <Box className="rounded-xl border border-primary/30 bg-primary-fixed/40 p-md">
              <Row gap="sm" align="start">
                <Icon
                  name="check_circle"
                  filled
                  className="text-primary text-xl shrink-0"
                />
                <Text variant="body-sm" tone="primary">
                  {feedback}
                </Text>
              </Row>
            </Box>
          ) : null}
          {TIERS.map((tier) => {
            const affordable = safeBalance >= tier.points;
            return (
              <Box
                key={tier.label}
                className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md"
              >
                <Row gap="md" align="center" wrap>
                  <Stack gap="none" className="flex-1 min-w-[180px]">
                    <Text variant="body-md" className="font-semibold">
                      {tier.label}
                    </Text>
                    <Text variant="body-sm" tone="muted">
                      {tier.blurb}
                    </Text>
                  </Stack>
                  <Badge
                    tone={affordable ? "primary" : "neutral"}
                    size="sm"
                  >
                    {tier.points} pts
                  </Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    caps={false}
                    className="rounded-full"
                    disabled={!affordable}
                    onClick={() => handleRedeem(tier)}
                  >
                    {affordable ? "Redeem" : "Need more"}
                  </Button>
                </Row>
              </Box>
            );
          })}

          {redeemed.length > 0 ? (
            <Stack gap="sm" className="pt-md">
              <Text
                variant="label-caps"
                tone="muted"
                as="span"
                className="tracking-[0.18em]"
              >
                Recently redeemed
              </Text>
              {redeemed.slice(0, 3).map((entry) => (
                <Row
                  key={entry.id}
                  justify="between"
                  align="center"
                  gap="sm"
                  className="rounded-xl bg-surface-container-low p-md"
                >
                  <Stack gap="none">
                    <Text variant="body-sm" className="font-semibold">
                      {entry.label}
                    </Text>
                    <Text variant="body-sm" tone="muted">
                      Code {entry.code}
                    </Text>
                  </Stack>
                  <Text variant="body-sm" tone="muted">
                    -{entry.points} pts
                  </Text>
                </Row>
              ))}
            </Stack>
          ) : null}
        </Stack>
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
