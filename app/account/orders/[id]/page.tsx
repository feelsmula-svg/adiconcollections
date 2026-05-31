import { Fragment } from "react";
import { notFound } from "next/navigation";

import { AccountShell } from "@/app/components/account/account-shell";
import {
  DownloadInvoiceButton,
  RefreshStatusButton,
} from "@/app/components/account/order-detail-actions";
import {
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
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
  formatCurrency,
  formatOrderDate,
  formatOrderTimestamp,
  getOrderById,
  type OrderItem,
  type OrderStatus,
  type TrackingStep,
} from "@/app/lib/account/orders";
import {
  DELIVERY_METHOD_LABEL,
  type OrderDeliveryMethod,
} from "@/app/lib/orders/types";
import { customerPromptsFor } from "@/app/lib/orders/system-prompts";
import { SystemPromptFeed } from "@/app/components/orders/system-prompt-feed";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "Processing",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<
  OrderStatus,
  "primary" | "secondary" | "neutral" | "error" | "tertiary"
> = {
  processing: "secondary",
  "in-transit": "secondary",
  delivered: "neutral",
  cancelled: "error",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <AccountShell user={user} active="orders">
      <Stack gap="md">
        <LinkButton
          href="/account/orders"
          variant="ghost"
          size="sm"
          caps={false}
          className="self-start rounded-full px-0 -ml-xs"
        >
          <Icon name="arrow_back" className="text-lg" />
          <Text as="span" variant="body-sm">
            All orders
          </Text>
        </LinkButton>

        <Row justify="between" align="end" wrap gap="md">
          <Stack gap="xs">
            <Row gap="sm" align="center" wrap>
              <Text
                variant="label-caps"
                tone="primary"
                as="span"
                className="tracking-[0.2em]"
              >
                Order Details
              </Text>
              <Badge tone={STATUS_TONE[order.status]} size="sm">
                {STATUS_LABEL[order.status]}
              </Badge>
            </Row>
            <Heading
              level={1}
              variant="display-lg"
              size="headline-md"
              className="md:text-headline-md lg:text-display-lg"
            >
              {order.productName}
            </Heading>
            <Row gap="xs" align="center">
              <Text variant="body-sm" tone="muted">
                {order.reference} · Placed {formatOrderDate(order.placedAt)}
              </Text>
              <CopyButton
                value={order.reference}
                label={`Copy order ID ${order.reference}`}
                size="sm"
                variant="plain"
              />
            </Row>
          </Stack>
          <DownloadInvoiceButton order={order} />
        </Row>
      </Stack>

      <TrackingPanel tracking={order.tracking} />

      <SystemPromptFeed
        title="Order updates"
        emptyMessage="No updates yet. We'll post here every time something happens with your order."
        prompts={customerPromptsFor(order)}
      />

      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        <Stack gap="lg" className="lg:col-span-2">
          <Stack gap="md">
            <Row justify="between" align="center">
              <Heading level={2} variant="headline-sm" size="body-lg">
                Items in this order
              </Heading>
              <Text variant="body-sm" tone="muted">
                {order.items.length} item
                {order.items.length === 1 ? "" : "s"}
              </Text>
            </Row>
            <Stack gap="sm">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </Stack>
          </Stack>

          <Box className="rounded-2xl bg-surface-container border-l-4 border-primary p-lg">
            <Stack gap="sm">
              <Heading level={3} variant="headline-sm" size="body-lg">
                Need styling help?
              </Heading>
              <Text
                variant="editorial-italic"
                className="text-on-tertiary-fixed-variant"
              >
                Our concierge stylists are available to ensure your AdiCon
                pieces look flawless.
              </Text>
              <Box className="pt-xs">
                <LinkButton
                  href="/contact"
                  variant="ghost"
                  size="sm"
                  caps={false}
                  className="rounded-full px-0"
                >
                  Schedule a complimentary consultation →
                </LinkButton>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Stack gap="md">
          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="md">
              <Text
                variant="label-caps"
                tone="muted"
                as="span"
                className="tracking-[0.18em]"
              >
                Delivery
              </Text>
              <Stack gap="xs">
                <Row gap="sm" align="center">
                  <Icon
                    name="local_shipping"
                    filled
                    className="text-primary text-lg"
                  />
                  <Text variant="body-md" className="font-semibold">
                    {order.deliveryMethod
                      ? DELIVERY_METHOD_LABEL[
                          order.deliveryMethod as OrderDeliveryMethod
                        ]
                      : "Standard"}
                  </Text>
                </Row>
                <Text variant="body-sm" tone="muted">
                  Expected{" "}
                  <Text
                    as="span"
                    variant="body-sm"
                    className="font-semibold text-on-surface"
                  >
                    {order.expectedDelivery
                      ? formatOrderDate(order.expectedDelivery)
                      : "—"}
                  </Text>
                </Text>
              </Stack>
            </Stack>
          </Card>

          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="md">
              <Text
                variant="label-caps"
                tone="muted"
                as="span"
                className="tracking-[0.18em]"
              >
                Shipping Address
              </Text>
              <Stack gap="xs">
                <Text variant="body-md" className="font-semibold">
                  {order.shippingAddress.name}
                </Text>
                <Text variant="body-md" tone="muted">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2
                    ? `, ${order.shippingAddress.line2}`
                    : ""}
                </Text>
                <Text variant="body-md" tone="muted">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postal}
                </Text>
                <Text variant="body-md" tone="muted">
                  {order.shippingAddress.country}
                </Text>
              </Stack>
            </Stack>
          </Card>

          <Card variant="outlined" padding="lg" rounded="2xl">
            <Stack gap="md">
              <Text
                variant="label-caps"
                tone="muted"
                as="span"
                className="tracking-[0.18em]"
              >
                Payment Method
              </Text>
              <Row gap="md" align="center">
                <Box className="w-12 h-8 rounded bg-on-surface flex items-center justify-center shrink-0">
                  <Text
                    as="span"
                    variant="label-caps"
                    tone="inverse"
                  >
                    {order.payment.brand.toUpperCase()}
                  </Text>
                </Box>
                <Stack gap="none">
                  <Text variant="body-md" className="font-semibold">
                    {order.payment.brand} ending in {order.payment.last4}
                  </Text>
                  <Text variant="body-sm" tone="muted">
                    Expires {order.payment.expiry}
                  </Text>
                </Stack>
              </Row>
            </Stack>
          </Card>

          <Card
            variant="filled"
            padding="lg"
            rounded="2xl"
            className="bg-surface-container-high"
          >
            <Stack gap="md">
              <Text
                variant="label-caps"
                tone="muted"
                as="span"
                className="tracking-[0.18em]"
              >
                Order Summary
              </Text>
              <Stack gap="sm">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(order.totals.subtotal)}
                />
                <SummaryRow
                  label="Shipping"
                  value={
                    order.totals.shipping === 0
                      ? "Free"
                      : formatCurrency(order.totals.shipping)
                  }
                  highlight={order.totals.shipping === 0}
                />
                <SummaryRow
                  label="Tax"
                  value={formatCurrency(order.totals.tax)}
                />
                <Box className="border-t border-outline-variant pt-md">
                  <Row justify="between" align="center">
                    <Text
                      variant="body-md"
                      tone="primary"
                      as="span"
                      className="font-semibold"
                    >
                      Total
                    </Text>
                    <Heading
                      level={3}
                      variant="headline-sm"
                      tone="primary"
                      size="headline-sm"
                    >
                      {formatCurrency(order.totals.total)}
                    </Heading>
                  </Row>
                </Box>
              </Stack>
            </Stack>
          </Card>

          {order.requiresSignature ? (
            <Box className="rounded-xl border border-primary/30 bg-primary-fixed/30 p-md">
              <Row gap="sm" align="start">
                <Icon
                  name="signature"
                  className="text-primary text-xl shrink-0"
                />
                <Text variant="body-sm" tone="primary">
                  A signature is required upon delivery to ensure your luxury
                  order arrives safely.
                </Text>
              </Row>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </AccountShell>
  );
}

interface OrderItemRowProps {
  item: OrderItem;
}

function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <Card variant="outlined" padding="md" rounded="2xl">
      <Row gap="md" align="start">
        <Box className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </Box>
        <Stack gap="xs" className="flex-1 min-w-0">
          <Text
            variant="label-caps"
            tone="primary"
            as="span"
            className="tracking-[0.18em]"
          >
            {item.collection}
          </Text>
          <Heading level={3} variant="headline-sm" size="body-lg">
            {item.name}
          </Heading>
          <Text variant="body-sm" tone="muted">
            {item.attributes}
          </Text>
          <Row justify="between" align="center" className="pt-xs">
            <Text variant="body-sm" tone="muted">
              Qty {item.quantity}
            </Text>
            <Text variant="body-md" className="font-semibold" as="span">
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </Row>
        </Stack>
      </Row>
    </Card>
  );
}

interface TrackingPanelProps {
  tracking: TrackingStep[];
}

function TrackingPanel({ tracking }: TrackingPanelProps) {
  return (
    <Card variant="outlined" padding="lg" rounded="2xl" className="md:p-xl">
      <Stack gap="lg">
        <Row justify="between" align="center" wrap gap="sm">
          <Heading level={2} variant="headline-sm" size="body-lg">
            Track your order
          </Heading>
          <RefreshStatusButton />
        </Row>

        <Box className="hidden md:block">
          <Row gap="none" align="center" className="w-full">
            {tracking.map((step, i) => {
              const isLast = i === tracking.length - 1;
              const lineActive =
                step.status === "complete" &&
                tracking[i + 1]?.status !== "upcoming";
              return (
                <Fragment key={step.key}>
                  <Stack gap="xs" align="center" className="shrink-0">
                    <TrackingDot status={step.status} />
                    <Stack gap="none" align="center" className="text-center">
                      <Text
                        variant="label-caps"
                        as="span"
                        className={
                          step.status === "upcoming"
                            ? "text-on-surface-variant opacity-60 tracking-[0.12em]"
                            : "text-on-surface tracking-[0.12em]"
                        }
                      >
                        {step.label}
                      </Text>
                      {step.timestamp ? (
                        <Text
                          variant="body-sm"
                          tone="muted"
                          as="span"
                          className="text-[10px]"
                        >
                          {formatOrderTimestamp(step.timestamp)}
                        </Text>
                      ) : null}
                    </Stack>
                  </Stack>
                  {!isLast ? (
                    <Box
                      className={`flex-1 h-px ${
                        lineActive ? "bg-primary" : "bg-outline-variant"
                      } -translate-y-[18px]`}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </Row>
        </Box>

        <Stack gap="md" className="md:hidden">
          {tracking.map((step, i) => (
            <Row gap="md" align="start" key={step.key}>
              <Stack gap="none" align="center" className="shrink-0">
                <TrackingDot status={step.status} />
                {i < tracking.length - 1 ? (
                  <Box
                    className={`w-px flex-1 min-h-[24px] mt-xs ${
                      step.status === "complete"
                        ? "bg-primary"
                        : "bg-outline-variant"
                    }`}
                  />
                ) : null}
              </Stack>
              <Stack gap="none" className="flex-1 pb-md">
                <Text
                  variant="body-md"
                  as="span"
                  className={
                    step.status === "upcoming"
                      ? "text-on-surface-variant opacity-70"
                      : "text-on-surface font-semibold"
                  }
                >
                  {step.label}
                </Text>
                {step.timestamp ? (
                  <Text variant="body-sm" tone="muted" as="span">
                    {formatOrderTimestamp(step.timestamp)}
                  </Text>
                ) : null}
              </Stack>
            </Row>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

function TrackingDot({ status }: { status: TrackingStep["status"] }) {
  if (status === "complete") {
    return (
      <Box className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
        <Icon name="check" className="text-on-primary text-base" />
      </Box>
    );
  }
  if (status === "current") {
    return (
      <Box className="w-6 h-6 rounded-full border-2 border-primary bg-surface flex items-center justify-center ring-4 ring-primary/15">
        <Box className="w-2 h-2 rounded-full bg-primary" />
      </Box>
    );
  }
  return (
    <Box className="w-6 h-6 rounded-full border-2 border-outline-variant bg-surface" />
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <Row justify="between" align="center">
      <Text variant="body-md" tone="muted" as="span">
        {label}
      </Text>
      <Text
        variant="body-md"
        as="span"
        className={highlight ? "text-secondary font-semibold" : ""}
      >
        {value}
      </Text>
    </Row>
  );
}
