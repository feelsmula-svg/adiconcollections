"use client";

import { useState } from "react";

import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Icon,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { CampaignForm } from "./campaign-form";
import type { Campaign } from "@/app/lib/campaigns/types";

interface CampaignsManagerProps {
  campaigns: Campaign[];
}

function formatDiscount(campaign: Campaign): string | null {
  if (!campaign.discount) return null;
  if (campaign.discount.type === "percent") return `${campaign.discount.value}% off`;
  if (campaign.discount.type === "fixed")
    return `$${(campaign.discount.value / 100).toFixed(2)} off`;
  return "Free shipping";
}

export function CampaignsManager({ campaigns }: CampaignsManagerProps) {
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);

  if (editing) {
    return (
      <CampaignForm
        mode="edit"
        initial={editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  if (creating) {
    return (
      <CampaignForm
        mode="create"
        onClose={() => setCreating(false)}
      />
    );
  }

  return (
    <Stack gap="md">
      <Row justify="between" align="center" wrap gap="sm">
        <Stack gap="none">
          <Heading level={2} variant="headline-sm">
            Campaigns
          </Heading>
          <Text variant="body-sm" tone="muted">
            Drive the header banner, customer modal popup, and promo codes
            from one place.
          </Text>
        </Stack>
        <Button
          variant="primary"
          size="sm"
          caps={false}
          className="rounded-full"
          onClick={() => setCreating(true)}
        >
          + New campaign
        </Button>
      </Row>

      {campaigns.length === 0 ? (
        <Card variant="outlined" padding="lg" rounded="2xl">
          <Stack gap="sm" align="center" className="text-center py-md">
            <Icon
              name="campaign"
              className="text-primary text-3xl"
            />
            <Heading level={3} variant="headline-sm">
              No campaigns yet
            </Heading>
            <Text variant="body-sm" tone="muted">
              Create one to replace the default header banner or to start
              accepting a promo code.
            </Text>
            <Button
              variant="primary"
              size="sm"
              caps={false}
              className="rounded-full"
              onClick={() => setCreating(true)}
            >
              Create your first campaign
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack gap="sm">
          {campaigns.map((campaign) => {
            const discountLabel = formatDiscount(campaign);
            return (
              <Card
                key={campaign.id}
                variant="outlined"
                padding="lg"
                rounded="2xl"
              >
                <Stack gap="sm">
                  <Row justify="between" align="start" gap="sm" wrap>
                    <Stack gap="none" className="min-w-0 flex-1">
                      <Row gap="xs" align="center" wrap>
                        <Text
                          variant="body-md"
                          as="span"
                          className="font-semibold truncate"
                        >
                          {campaign.name}
                        </Text>
                        <Badge
                          tone={campaign.enabled ? "primary" : "neutral"}
                          size="sm"
                        >
                          {campaign.enabled ? "Active" : "Disabled"}
                        </Badge>
                        {campaign.showInHeader ? (
                          <Badge tone="secondary" size="sm">
                            Header
                          </Badge>
                        ) : null}
                        {campaign.showModal ? (
                          <Badge tone="secondary" size="sm">
                            Modal
                          </Badge>
                        ) : null}
                        {discountLabel ? (
                          <Badge tone="tertiary" size="sm">
                            {discountLabel}
                          </Badge>
                        ) : null}
                      </Row>
                      {campaign.headerText ? (
                        <Text variant="body-sm" tone="muted">
                          “{campaign.headerText}”
                        </Text>
                      ) : null}
                      {campaign.promoCode ? (
                        <Text variant="body-sm" tone="muted">
                          Code:{" "}
                          <Text
                            as="span"
                            variant="body-sm"
                            className="font-semibold tracking-wider"
                          >
                            {campaign.promoCode}
                          </Text>
                        </Text>
                      ) : null}
                    </Stack>
                    <Button
                      variant="ghost"
                      size="sm"
                      caps={false}
                      onClick={() => setEditing(campaign)}
                    >
                      Edit
                    </Button>
                  </Row>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
