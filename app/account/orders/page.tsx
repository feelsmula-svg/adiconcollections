import { Fragment } from "react";

import { AccountShell } from "@/app/components/account/account-shell";
import { OrdersList } from "@/app/components/account/orders-list";
import { RedeemButton } from "@/app/components/account/redeem-button";
import {
  Badge,
  Box,
  Card,
  Heading,
  Icon,
  Image,
  LinkButton,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import {
  formatOrderDate,
  getActiveShipment,
  listOrderRecords,
  listOrders,
  type OrderStatus,
} from "@/app/lib/account/orders";
import { getRewardsSummary } from "@/app/lib/account/rewards";
import {
  ORDER_STATUS_INDEX,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/app/lib/orders/format";
import { recentCustomerPrompts } from "@/app/lib/orders/system-prompts";
import { SystemPromptFeed } from "@/app/components/orders/system-prompt-feed";

export const dynamic = "force-dynamic";

const PROGRESS_STEPS: { key: string; label: string }[] = [
  { key: "ordered", label: "Ordered" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default async function OrderHistoryPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [orders, shipment, orderRecords, rewards] = await Promise.all([
    listOrders(),
    getActiveShipment(),
    listOrderRecords(),
    getRewardsSummary(),
  ]);
  const recentUpdates = recentCustomerPrompts(orderRecords, 6);

  return (
    <AccountShell user={user} active="orders">
      <Stack gap="xs">
        <Text
          variant="label-caps"
          tone="primary"
          as="span"
          className="tracking-[0.2em]"
        >
          Member Activity
        </Text>
        <Heading
          level={1}
          variant="display-lg"
          size="headline-md"
          className="md:text-headline-md lg:text-display-lg"
        >
          Order History
        </Heading>
        <Box className="max-w-[560px]">
          <Text variant="body-md" tone="muted">
            Review past purchases, track active shipments, and reorder the
            bundles you love.
          </Text>
        </Box>
      </Stack>

      <Box
        className={`grid grid-cols-1 gap-md ${
          rewards.visibleToUser ? "md:grid-cols-5" : "md:grid-cols-1"
        }`}
      >
        <Card
          variant="outlined"
          padding="none"
          rounded="2xl"
          className={`${rewards.visibleToUser ? "md:col-span-3" : ""} overflow-hidden relative`}
        >
          <Box className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-tertiary" />
          {shipment ? (
            <Stack gap="none">
              <Row
                gap="md"
                align="center"
                justify="between"
                className="px-lg pt-lg pb-md"
              >
                <Row gap="sm" align="center">
                  <Text
                    variant="label-caps"
                    tone="muted"
                    as="span"
                    className="tracking-[0.18em]"
                  >
                    Active Shipment
                  </Text>
                  <Badge tone={ORDER_STATUS_TONE[shipment.status]} size="sm">
                    {ORDER_STATUS_LABEL[shipment.status]}
                  </Badge>
                </Row>
                <Text variant="body-sm" tone="muted" as="span">
                  {shipment.reference}
                </Text>
              </Row>
              <Row gap="md" align="center" className="px-lg">
                {shipment.imageUrl ? (
                  <Box className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
                    <Image
                      src={shipment.imageUrl}
                      alt={shipment.productName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Box>
                ) : (
                  <Box className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                    <Icon
                      name="inventory_2"
                      className="text-on-surface-variant text-2xl"
                    />
                  </Box>
                )}
                <Stack gap="xs" className="flex-1 min-w-0">
                  <Heading
                    level={2}
                    variant="headline-sm"
                    size="body-lg"
                    className="md:text-headline-sm"
                  >
                    {shipment.productName}
                  </Heading>
                  <Text variant="body-sm" tone="muted">
                    {shipment.expectedDelivery ? (
                      <>
                        Expected{" "}
                        <Text
                          as="span"
                          variant="body-sm"
                          className="font-semibold"
                        >
                          {formatOrderDate(shipment.expectedDelivery)}
                        </Text>
                      </>
                    ) : (
                      "Awaiting delivery estimate"
                    )}
                  </Text>
                </Stack>
              </Row>
              <Box className="px-lg pt-lg">
                <ProgressTimeline status={shipment.status} />
              </Box>
              <Row gap="sm" wrap className="px-lg py-lg">
                <LinkButton
                  href={`/account/orders/${shipment.id}`}
                  variant="primary"
                  size="sm"
                  caps={false}
                  className="rounded-full"
                >
                  Track shipment
                </LinkButton>
                <LinkButton
                  href="/contact"
                  variant="ghost"
                  size="sm"
                  caps={false}
                  className="rounded-full"
                >
                  Contact concierge →
                </LinkButton>
              </Row>
            </Stack>
          ) : (
            <Stack gap="md" className="px-lg py-2xl" align="center">
              <Box className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                <Icon
                  name="local_shipping"
                  className="text-on-surface-variant text-2xl"
                />
              </Box>
              <Stack gap="xs" align="center" className="text-center">
                <Heading level={2} variant="headline-sm" size="body-lg">
                  No active shipments
                </Heading>
                <Box className="max-w-[320px]">
                  <Text variant="body-sm" tone="muted">
                    When you place an order it will appear here so you can
                    track it from purchase to delivery.
                  </Text>
                </Box>
              </Stack>
              <LinkButton
                href="/shop"
                variant="primary"
                size="sm"
                caps={false}
                className="rounded-full"
              >
                Browse the collection
              </LinkButton>
            </Stack>
          )}
        </Card>

        {rewards.visibleToUser ? (
        <Box className="md:col-span-2 rounded-2xl bg-primary text-on-primary p-lg flex flex-col justify-between gap-md">
          <Stack gap="sm">
            <Row justify="between" align="center">
              <Box className="w-9 h-9 rounded-full bg-on-primary/15 flex items-center justify-center">
                <Icon
                  name="loyalty"
                  filled
                  className="text-on-primary text-lg"
                />
              </Box>
              <Text
                variant="label-caps"
                tone="on-primary"
                as="span"
                className="opacity-70 tracking-[0.18em]"
              >
                Rewards
              </Text>
            </Row>
            <Stack gap="none">
              <Heading
                level={3}
                variant="display-lg"
                tone="on-primary"
                size="headline-md"
                className="md:text-headline-md lg:text-display-lg leading-none"
              >
                {rewards.balance.toLocaleString()}
              </Heading>
              <Text
                variant="body-sm"
                tone="on-primary"
                as="span"
                className="opacity-80"
              >
                {rewards.balance === 1
                  ? "point to redeem"
                  : "points to redeem"}
              </Text>
            </Stack>
          </Stack>
          <RedeemButton
            balance={rewards.balance}
            tiers={rewards.settings.tiers}
            pointsPerDollar={rewards.settings.pointsPerDollar}
            variant="inverse"
            fullWidth
            className="rounded-full"
          />
        </Box>
        ) : null}
      </Box>

      {orders.length === 0 ? (
        <Card variant="outlined" padding="none" rounded="2xl">
          <Box className="p-2xl">
            <Stack gap="sm" align="center">
              <Icon name="receipt_long" className="text-primary text-3xl" />
              <Heading level={3} variant="headline-sm">
                No orders yet
              </Heading>
              <Text variant="body-md" tone="muted" align="center">
                Your future purchases will appear here.
              </Text>
              <LinkButton href="/" variant="primary" size="sm">
                Start shopping
              </LinkButton>
            </Stack>
          </Box>
        </Card>
      ) : (
        <OrdersList orders={orders} />
      )}

      <SystemPromptFeed
        title="Recent updates"
        emptyMessage="Nothing new right now — we'll post here whenever we update an order."
        prompts={recentUpdates}
        showOrderReference
        hrefBuilder={(prompt) => `/account/orders/${prompt.orderId}`}
      />

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <Box className="rounded-2xl bg-surface-container p-lg">
          <Stack gap="sm">
            <Icon
              name="format_quote"
              filled
              className="text-tertiary text-2xl"
            />
            <Text variant="body-md" className="italic">
              &ldquo;The Silk Infusion oil transformed my curls in just one
              week. Highly recommend the bundle.&rdquo;
            </Text>
            <Text variant="body-sm" tone="muted">
              — Elena M., Verified Stylist
            </Text>
          </Stack>
        </Box>

        <Card variant="outlined" padding="lg" rounded="2xl">
          <Row gap="md" align="start">
            <Box className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <Icon
                name="support_agent"
                filled
                className="text-on-primary-container text-xl"
              />
            </Box>
            <Stack gap="xs" className="flex-1">
              <Heading level={3} variant="headline-sm" size="body-lg">
                Need help with an order?
              </Heading>
              <Text variant="body-sm" tone="muted">
                Our concierge team is available 24/7 for shipping inquiries or
                product advice.
              </Text>
              <Box className="pt-xs">
                <LinkButton
                  href="/contact"
                  variant="ghost"
                  size="sm"
                  caps={false}
                  className="rounded-full px-0"
                >
                  Contact support →
                </LinkButton>
              </Box>
            </Stack>
          </Row>
        </Card>
      </Box>
    </AccountShell>
  );
}

interface ProgressTimelineProps {
  status: OrderStatus;
}

function ProgressTimeline({ status }: ProgressTimelineProps) {
  const currentIdx = ORDER_STATUS_INDEX[status];
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <Row gap="sm" align="center" className="text-error">
        <Icon name="cancel" filled className="text-error text-lg" />
        <Text variant="body-sm" as="span" tone="error">
          Order cancelled
        </Text>
      </Row>
    );
  }

  return (
    <Stack gap="xs" aria-label="Order progress">
      <Row gap="xs" align="center" className="w-full">
        {PROGRESS_STEPS.map((step, i) => {
          const reached = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <Fragment key={step.key}>
              <Box
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  reached ? "bg-primary" : "bg-outline-variant"
                } ${current ? "ring-4 ring-primary/15" : ""}`}
              />
              {i < PROGRESS_STEPS.length - 1 && (
                <Box
                  className={`h-px flex-1 ${
                    i < currentIdx ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </Row>
      <Row gap="xs" align="start" justify="between" className="w-full">
        {PROGRESS_STEPS.map((step, i) => (
          <Text
            key={step.key}
            variant="label-caps"
            as="span"
            className={`text-[10px] tracking-[0.12em] ${
              i <= currentIdx
                ? "text-on-surface"
                : "text-on-surface-variant opacity-60"
            }`}
          >
            {step.label}
          </Text>
        ))}
      </Row>
    </Stack>
  );
}

