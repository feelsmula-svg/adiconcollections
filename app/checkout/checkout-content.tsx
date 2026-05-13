"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/lib/cart/cart-context";
import { formatPrice } from "@/app/lib/cart/format";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormField,
  Heading,
  Icon,
  Image,
  RadioOption,
  Row,
  Section,
  Stack,
  Text,
  TextField,
  cn,
} from "@/app/components/ui";
import { StripePayment } from "./stripe-payment";

type DeliveryMethod = "same-day" | "standard";

const DELIVERY_COST_CENTS: Record<DeliveryMethod, number> = {
  "same-day": 2499,
  standard: 799,
};

const DISCOUNT_RATE = 0.05;

export function CheckoutContent() {
  const { lines } = useCart();
  if (lines.length === 0) {
    return <EmptyCheckout />;
  }

  return <CheckoutShell />;
}

function CheckoutShell() {
  const { subtotalCents } = useCart();
  const [delivery, setDelivery] = useState<DeliveryMethod>("same-day");

  const shippingCents = DELIVERY_COST_CENTS[delivery];
  const discountCents = Math.round(subtotalCents * DISCOUNT_RATE);
  const totalCents = subtotalCents + shippingCents - discountCents;

  return (
    <Container width="default">
      <Section padding="lg">
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          <Box className="lg:col-span-7">
            <Stack gap="xl">
              <CheckoutProgress current={1} />
              <ShippingSection />
              <DeliverySection value={delivery} onChange={setDelivery} />
              <StripePayment amountCents={totalCents} />
              <TrustBadges />
            </Stack>
          </Box>

          <Box className="lg:col-span-5 mt-xl lg:mt-0 lg:sticky lg:top-md">
            <OrderSummary
              shippingCents={shippingCents}
              discountCents={discountCents}
              totalCents={totalCents}
            />
          </Box>
        </Box>
      </Section>
    </Container>
  );
}

interface ProgressProps {
  current: 1 | 2 | 3;
}

function CheckoutProgress({ current }: ProgressProps) {
  const steps = [
    { n: 1 as const, label: "Shipping" },
    { n: 2 as const, label: "Delivery" },
    { n: 3 as const, label: "Payment" },
  ];
  return (
    <Row gap="sm" align="center" wrap>
      {steps.map((step, i) => {
        const active = step.n === current;
        return (
          <Fragment key={step.n}>
            {i > 0 && <Box className="h-px w-8 bg-outline-variant" />}
            <Row
              gap="xs"
              align="center"
              className={cn(active ? "" : "opacity-60")}
            >
              <Box
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  active
                    ? "bg-primary text-on-primary font-bold"
                    : "border border-outline-variant text-on-surface-variant",
                )}
              >
                {step.n}
              </Box>
              <Text
                variant="label-caps"
                tone={active ? "primary" : "muted"}
                className={active ? "font-bold" : undefined}
              >
                {step.label}
              </Text>
            </Row>
          </Fragment>
        );
      })}
    </Row>
  );
}

function ShippingSection() {
  return (
    <Card variant="elevated" padding="lg">
      <Stack gap="md">
        <Row justify="between" align="center" wrap gap="sm">
          <Heading
            level={2}
            variant="headline-sm"
            size="headline-sm"
            tone="primary"
          >
            Shipping Information
          </Heading>
          <Text variant="label-caps" tone="primary" className="cursor-pointer">
            Login for faster checkout
          </Text>
        </Row>
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <FormField label="First name" required>
            <TextField autoComplete="given-name" placeholder="Jasmine" />
          </FormField>
          <FormField label="Last name" required>
            <TextField autoComplete="family-name" placeholder="Reed" />
          </FormField>
        </Box>
        <FormField label="Street address" required>
          <TextField
            autoComplete="address-line1"
            placeholder="123 Peachtree St NE"
          />
        </FormField>
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <FormField label="City" required>
            <TextField autoComplete="address-level2" placeholder="Atlanta" />
          </FormField>
          <FormField label="Phone number" required>
            <TextField
              type="tel"
              autoComplete="tel"
              placeholder="+1 (404) 555-0117"
            />
          </FormField>
        </Box>
      </Stack>
    </Card>
  );
}

interface DeliverySectionProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
}

function DeliverySection({ value, onChange }: DeliverySectionProps) {
  return (
    <Card variant="elevated" padding="lg">
      <Stack gap="md">
        <Heading
          level={2}
          variant="headline-sm"
          size="headline-sm"
          tone="primary"
        >
          Delivery Method
        </Heading>
        <Stack gap="md">
          <RadioOption
            name="delivery"
            value="same-day"
            checked={value === "same-day"}
            onChange={(v) => onChange(v as DeliveryMethod)}
            recommended="Recommended"
          >
            <Row justify="between" align="center" gap="sm">
              <Stack gap="xs" className="min-w-0 flex-1">
                <Text variant="body-md" className="font-bold" tone="primary">
                  Express Next-Day
                </Text>
                <Text variant="body-sm" tone="muted">
                  Order before 11 AM ET for next-business-day delivery.
                </Text>
              </Stack>
              <Text
                variant="body-md"
                tone="primary"
                className="font-bold shrink-0"
              >
                {formatPrice(DELIVERY_COST_CENTS["same-day"])}
              </Text>
            </Row>
          </RadioOption>
          <RadioOption
            name="delivery"
            value="standard"
            checked={value === "standard"}
            onChange={(v) => onChange(v as DeliveryMethod)}
          >
            <Row justify="between" align="center" gap="sm">
              <Stack gap="xs" className="min-w-0 flex-1">
                <Text variant="body-md" className="font-bold">
                  Standard (3–5 days)
                </Text>
                <Text variant="body-sm" tone="muted">
                  Available nationwide across the contiguous US.
                </Text>
              </Stack>
              <Text variant="body-md" className="font-bold shrink-0">
                {formatPrice(DELIVERY_COST_CENTS.standard)}
              </Text>
            </Row>
          </RadioOption>
        </Stack>
      </Stack>
    </Card>
  );
}

function TrustBadges() {
  const badges: Array<{ icon: string; label: string }> = [
    { icon: "verified", label: "Verified merchant" },
    { icon: "lock", label: "256-bit SSL encryption" },
    { icon: "package_2", label: "Secure packaging" },
  ];
  return (
    <Row
      gap="xl"
      justify="center"
      wrap
      className="pt-lg border-t border-outline-variant"
    >
      {badges.map((badge) => (
        <Stack key={badge.label} gap="xs" align="center" className="opacity-70">
          <Icon
            name={badge.icon}
            filled
            className="text-xl text-on-surface-variant"
          />
          <Text
            variant="label-caps"
            tone="muted"
            className="text-[10px] text-center"
          >
            {badge.label}
          </Text>
        </Stack>
      ))}
    </Row>
  );
}

interface OrderSummaryProps {
  shippingCents: number;
  discountCents: number;
  totalCents: number;
}

function OrderSummary({
  shippingCents,
  discountCents,
  totalCents,
}: OrderSummaryProps) {
  const { lines, subtotalCents } = useCart();
  return (
    <Card variant="tonal" padding="lg">
      <Stack gap="md">
        <Heading
          level={2}
          variant="headline-sm"
          size="headline-sm"
          tone="primary"
        >
          Order Summary
        </Heading>

        <Stack gap="md" className="max-h-[400px] overflow-y-auto pr-xs">
          {lines.map((line) => (
            <Row key={line.product.id} gap="md" align="start">
              <Box className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-surface-variant">
                <Image
                  src={line.product.imageSrc}
                  alt={line.product.imageAlt}
                  fill
                  sizes="64px"
                  rounded="lg"
                />
              </Box>
              <Stack gap="xs" className="flex-1 min-w-0">
                <Row justify="between" align="start" gap="sm">
                  <Text
                    variant="body-sm"
                    className="font-bold truncate leading-snug"
                  >
                    {line.product.name}
                  </Text>
                  <Text variant="body-sm" className="font-bold whitespace-nowrap">
                    {formatPrice(line.product.priceCents * line.quantity)}
                  </Text>
                </Row>
                {line.product.description && (
                  <Text variant="body-sm" tone="muted" className="text-[12px]">
                    {line.product.description}
                  </Text>
                )}
                <Text variant="body-sm" tone="muted" className="text-[12px]">
                  Qty {line.quantity}
                </Text>
              </Stack>
            </Row>
          ))}
        </Stack>

        <Divider />

        <PromoCodeRow />

        <Divider />

        <Stack gap="xs">
          <Row justify="between">
            <Text variant="body-sm" tone="muted">
              Subtotal
            </Text>
            <Text variant="body-sm">{formatPrice(subtotalCents)}</Text>
          </Row>
          <Row justify="between">
            <Text variant="body-sm" tone="muted">
              Shipping
            </Text>
            <Text variant="body-sm">{formatPrice(shippingCents)}</Text>
          </Row>
          <Row justify="between">
            <Text variant="body-sm" tone="muted" className="italic">
              New member discount (5%)
            </Text>
            <Text variant="body-sm" tone="primary" className="italic">
              −{formatPrice(discountCents)}
            </Text>
          </Row>
        </Stack>

        <Divider />

        <Row justify="between" align="center">
          <Text variant="body-lg" className="font-bold">
            Total
          </Text>
          <Text variant="body-lg" tone="primary" className="font-bold">
            {formatPrice(totalCents)}
          </Text>
        </Row>

        <Card
          variant="filled"
          padding="md"
          className="border-l-4 border-primary"
        >
          <Stack gap="xs">
            <Text variant="editorial-italic" tone="primary">
              &ldquo;Your hair is the crown you never take off. We ensure it&apos;s
              treated with the prestige it deserves.&rdquo;
            </Text>
            <Text variant="label-caps" tone="muted" className="text-[10px]">
              — AdiCon stylist team
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}

function PromoCodeRow() {
  const [code, setCode] = useState("");
  return (
    <Row gap="sm">
      <TextField
        placeholder="Promo code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-label="Promo code"
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          /* TODO: apply */
        }}
        className="shrink-0 tracking-[0.1em]"
      >
        Apply
      </Button>
    </Row>
  );
}

function EmptyCheckout() {
  const router = useRouter();
  return (
    <Container width="default">
      <Section padding="md">
        <Stack gap="md" align="center" justify="center" className="py-3xl">
          <Icon
            name="shopping_bag"
            className="text-6xl text-on-surface-variant opacity-60"
          />
          <Stack gap="xs" align="center">
            <Heading
              level={1}
              variant="headline-sm"
              size="body-lg"
              className="font-bold"
            >
              Your bag is empty
            </Heading>
            <Text variant="body-sm" tone="muted" align="center">
              Add a product before checking out.
            </Text>
          </Stack>
          <Button variant="primary" size="sm" onClick={() => router.push("/")}>
            Continue shopping
          </Button>
        </Stack>
      </Section>
    </Container>
  );
}
