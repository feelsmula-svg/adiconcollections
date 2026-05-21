import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/app/components/admin/admin-shell";
import { OrderManagementPanel } from "@/app/components/admin/order-management-panel";
import {
  Badge,
  Box,
  Card,
  Divider,
  Heading,
  LinkButton,
  ProductThumb,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  formatCurrency,
  formatOrderDate,
  formatOrderTimestamp,
} from "@/app/lib/orders/format";
import { getSessionUser } from "@/app/lib/auth/server";
import { getOrderRepository } from "@/app/lib/orders/order-repository";
import { SHIPPING_CARRIER_LABELS } from "@/app/lib/orders/types";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/account");
  }

  const { id } = await params;
  const repo = await getOrderRepository();
  const order = await repo.findById(id);
  if (!order) notFound();

  return (
    <AdminShell
      user={user}
      active="orders"
      title={order.reference}
      subtitle={`Placed ${formatOrderDate(order.placedAt)} · ${order.customerName} (${order.customerEmail})`}
    >
      <Row align="center" justify="between" className="flex-wrap gap-md">
        <LinkButton
          href="/admin/orders"
          variant="ghost"
          size="sm"
          caps={false}
        >
          ← Back to orders
        </LinkButton>
        <Badge tone={ORDER_STATUS_TONE[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </Row>

      <Row gap="lg" className="flex-wrap items-start">
        <Box className="flex-1 min-w-[320px]">
          <Stack gap="lg">
            <Card variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="md">
                <Heading level={2} variant="headline-sm">
                  Items
                </Heading>
                {order.items.map((item) => (
                  <Row
                    key={item.id}
                    gap="md"
                    align="center"
                    className="flex-wrap"
                  >
                    <ProductThumb
                      src={item.imageUrl}
                      alt={item.name}
                      size="md"
                    />
                    <Stack gap="none" className="flex-1 min-w-[160px]">
                      <Text
                        variant="label-caps"
                        tone="muted"
                        as="span"
                      >
                        {item.collection}
                      </Text>
                      <Text
                        variant="body-md"
                        as="span"
                        className="font-semibold"
                      >
                        {item.name}
                      </Text>
                      <Text variant="body-sm" tone="muted" as="span">
                        {item.attributes}
                      </Text>
                    </Stack>
                    <Stack gap="none" className="text-right">
                      <Text variant="body-sm" tone="muted" as="span">
                        Qty {item.quantity}
                      </Text>
                      <Text
                        variant="body-md"
                        as="span"
                        className="font-semibold"
                      >
                        {formatCurrency(item.price)}
                      </Text>
                    </Stack>
                  </Row>
                ))}
                <Divider />
                <Stack gap="xs">
                  <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(order.totals.subtotal)}
                  />
                  <SummaryRow
                    label="Shipping"
                    value={formatCurrency(order.totals.shipping)}
                  />
                  <SummaryRow
                    label="Tax"
                    value={formatCurrency(order.totals.tax)}
                  />
                  <SummaryRow
                    label="Total"
                    value={formatCurrency(order.totals.total)}
                    emphasize
                  />
                </Stack>
              </Stack>
            </Card>

            <OrderManagementPanel order={order} />
          </Stack>
        </Box>

        <Box className="w-full lg:w-[320px] shrink-0">
          <Stack gap="lg">
            <Card variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="sm">
                <Text variant="label-caps" tone="muted" as="span">
                  Ship to
                </Text>
                <Text variant="body-md" as="span" className="font-semibold">
                  {order.shippingAddress.name}
                </Text>
                <Text variant="body-sm" tone="muted">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2
                    ? `, ${order.shippingAddress.line2}`
                    : ""}
                </Text>
                <Text variant="body-sm" tone="muted">
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postal}
                </Text>
                <Text variant="body-sm" tone="muted">
                  {order.shippingAddress.country}
                </Text>
              </Stack>
            </Card>

            <Card variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="sm">
                <Text variant="label-caps" tone="muted" as="span">
                  Payment
                </Text>
                <Text variant="body-md" as="span" className="font-semibold">
                  {order.payment.brand} ····{order.payment.last4}
                </Text>
                <Text variant="body-sm" tone="muted">
                  Expires {order.payment.expiry}
                </Text>
              </Stack>
            </Card>

            <Card variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="sm">
                <Text variant="label-caps" tone="muted" as="span">
                  Shipping
                </Text>
                <Text variant="body-md" as="span" className="font-semibold">
                  {order.carrier
                    ? SHIPPING_CARRIER_LABELS[order.carrier]
                    : "No carrier set"}
                </Text>
                <Text variant="body-sm" tone="muted">
                  {order.trackingNumber
                    ? `Tracking #: ${order.trackingNumber}`
                    : "No tracking number yet"}
                </Text>
                {order.expectedDelivery ? (
                  <Text variant="body-sm" tone="muted">
                    Expected: {order.expectedDelivery}
                  </Text>
                ) : null}
                <Text variant="body-sm" tone="muted">
                  {order.requiresSignature
                    ? "Signature required on delivery"
                    : "No signature required"}
                </Text>
              </Stack>
            </Card>

            <Card variant="outlined" padding="lg" rounded="2xl">
              <Stack gap="md">
                <Heading level={2} variant="headline-sm">
                  Current tracking
                </Heading>
                <Stack gap="sm">
                  {order.tracking.map((step) => (
                    <Row key={step.key} gap="sm" align="start">
                      <Box
                        className={`mt-[6px] w-[8px] h-[8px] rounded-full shrink-0 ${
                          step.status === "complete"
                            ? "bg-primary"
                            : step.status === "current"
                              ? "bg-secondary"
                              : "bg-outline-variant"
                        }`}
                      />
                      <Stack gap="none" className="flex-1">
                        <Text variant="body-md" as="span">
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
          </Stack>
        </Box>
      </Row>
    </AdminShell>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function SummaryRow({ label, value, emphasize }: SummaryRowProps) {
  return (
    <Row justify="between" align="center">
      <Text variant="body-sm" tone="muted" as="span">
        {label}
      </Text>
      <Text
        variant="body-md"
        as="span"
        className={emphasize ? "font-semibold" : ""}
      >
        {value}
      </Text>
    </Row>
  );
}
