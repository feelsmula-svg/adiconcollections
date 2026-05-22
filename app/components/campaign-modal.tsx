"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
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
import type { Campaign } from "@/app/lib/campaigns/types";

interface CampaignModalProps {
  campaigns: Campaign[];
}

const STORAGE_KEY = "adicon.campaign.dismissed.v1";
const SHOW_DELAY_MS = 1200;

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(ids).slice(-50)),
    );
  } catch {
    // ignore quota errors
  }
}

function formatDiscountBadge(campaign: Campaign): string | null {
  if (!campaign.discount) return null;
  if (campaign.discount.type === "percent") {
    return `${campaign.discount.value}% off`;
  }
  if (campaign.discount.type === "fixed") {
    return `$${(campaign.discount.value / 100).toFixed(2)} off`;
  }
  return "Free shipping";
}

export function CampaignModal({ campaigns }: CampaignModalProps) {
  const router = useRouter();
  const [active, setActive] = useState<Campaign | null>(null);

  useEffect(() => {
    if (campaigns.length === 0) return;
    const dismissed = readDismissed();
    const next = campaigns.find((c) => !dismissed.has(c.id));
    if (!next) return;
    // Small delay so we don't shove the modal in someone's face on first paint.
    const timer = setTimeout(() => {
      setActive(next);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [campaigns]);

  const dismiss = () => {
    if (!active) return;
    const ids = readDismissed();
    ids.add(active.id);
    writeDismissed(ids);
    setActive(null);
  };

  if (!active) return null;

  const discountLabel = formatDiscountBadge(active);
  const promoCode = active.promoCode;

  return (
    <Modal
      open
      onClose={dismiss}
      width="md"
      ariaLabel={active.modalTitle ?? "Campaign"}
    >
      <Box className="relative">
        <Box className="absolute top-sm right-sm z-10">
          <IconButton
            icon="close"
            label="Close announcement"
            size="sm"
            variant="plain"
            onClick={dismiss}
          />
        </Box>

        <Box className="bg-gradient-to-br from-primary-fixed to-tertiary-fixed px-lg pt-xl pb-md">
          <Stack gap="sm" align="center" className="text-center">
            <Box className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center">
              <Icon name="campaign" filled className="text-2xl" />
            </Box>
            <Heading level={2} variant="headline-md" align="center">
              {active.modalTitle}
            </Heading>
            {discountLabel ? (
              <Box className="px-md py-xs rounded-full bg-on-primary text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
                {discountLabel}
              </Box>
            ) : null}
          </Stack>
        </Box>

        <Stack gap="md" className="px-lg pt-md pb-lg">
          {active.modalBody ? (
            <Text variant="body-md" align="center" className="whitespace-pre-wrap">
              {active.modalBody}
            </Text>
          ) : null}

          {promoCode ? (
            <Box className="rounded-xl border-2 border-dashed border-primary/40 bg-surface-container-low p-md">
              <Stack gap="xs" align="center">
                <Text
                  variant="label-caps"
                  tone="muted"
                  as="span"
                  className="tracking-[0.18em]"
                >
                  Use code
                </Text>
                <Text
                  variant="body-lg"
                  size="headline-sm"
                  as="span"
                  className="font-display-xl tracking-[0.24em]"
                >
                  {promoCode}
                </Text>
                <Text variant="body-sm" tone="muted" align="center">
                  Enter at checkout to apply the discount.
                </Text>
              </Stack>
            </Box>
          ) : null}

          <Row gap="sm" justify="center" wrap>
            {active.ctaLabel && active.ctaHref ? (
              <Button
                variant="primary"
                size="md"
                caps={false}
                className="rounded-full"
                onClick={() => {
                  dismiss();
                  router.push(active.ctaHref ?? "/");
                }}
              >
                {active.ctaLabel}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="md"
              caps={false}
              onClick={dismiss}
            >
              Not now
            </Button>
          </Row>
        </Stack>
      </Box>
    </Modal>
  );
}
