"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  useCartSubtotalCents,
  useCartTaxCents,
} from "@/app/lib/state/cart-store";
import {
  useCheckoutStore,
  useIsCheckoutValid,
  type ShippingFields,
} from "@/app/lib/state/checkout-store";
import { useHydrated } from "@/app/lib/state/hydration";
import { formatPrice } from "@/app/lib/cart/format";
import {
  DELIVERY_COST_CENTS,
  type DeliveryMethod,
} from "@/app/lib/cart/constants";
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

export function CheckoutContent() {
  const hydrated = useHydrated();
  const lines = useCartStore((state) => state.lines);
  if (hydrated && lines.length === 0) {
    return <EmptyCheckout />;
  }
  if (!hydrated) {
    return null;
  }

  return <CheckoutShell />;
}

function CheckoutShell() {
  const subtotalCents = useCartSubtotalCents();
  const taxCents = useCartTaxCents();
  const delivery = useCheckoutStore((state) => state.delivery);
  const isValid = useIsCheckoutValid();

  const shippingCents = DELIVERY_COST_CENTS[delivery];
  const totalCents = subtotalCents + taxCents + shippingCents;

  return (
    <Container width="default">
      <Section padding="lg">
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          <Box className="lg:col-span-7">
            <Stack gap="xl">
              <CheckoutProgress current={1} />
              <ShippingSection />
              <DeliverySection />
              <StripePayment amountCents={totalCents} disabled={!isValid} />
              <TrustBadges />
            </Stack>
          </Box>

          <Box className="lg:col-span-5 mt-xl lg:mt-0 lg:sticky lg:top-md">
            <OrderSummary
              subtotalCents={subtotalCents}
              taxCents={taxCents}
              shippingCents={shippingCents}
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

interface ShippingFieldProps {
  field: keyof ShippingFields;
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}

function ShippingFieldInput({
  field,
  label,
  required,
  type = "text",
  autoComplete,
  placeholder,
}: ShippingFieldProps) {
  const value = useCheckoutStore((state) => state[field]);
  const setField = useCheckoutStore((state) => state.setField);

  return (
    <FormField label={label} required={required}>
      <TextField
        type={type}
        value={value}
        onChange={(e) => setField(field, e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
    </FormField>
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
        <ShippingFieldInput
          field="email"
          label="Email"
          required
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <ShippingFieldInput
            field="firstName"
            label="First name"
            required
            autoComplete="given-name"
            placeholder="Jasmine"
          />
          <ShippingFieldInput
            field="lastName"
            label="Last name"
            required
            autoComplete="family-name"
            placeholder="Reed"
          />
        </Box>
        <ShippingFieldInput
          field="address"
          label="Street address"
          required
          autoComplete="address-line1"
          placeholder="123 Peachtree St NE"
        />
        <Box className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <ShippingFieldInput
            field="city"
            label="City"
            required
            autoComplete="address-level2"
            placeholder="Atlanta"
          />
          <ShippingFieldInput
            field="stateRegion"
            label="State"
            required
            autoComplete="address-level1"
            placeholder="GA"
          />
          <ShippingFieldInput
            field="zip"
            label="ZIP"
            required
            autoComplete="postal-code"
            placeholder="30303"
          />
        </Box>
        <ShippingFieldInput
          field="phone"
          label="Phone number"
          required
          type="tel"
          autoComplete="tel"
          placeholder="+1 (404) 555-0117"
        />
      </Stack>
    </Card>
  );
}

function DeliverySection() {
  const delivery = useCheckoutStore((state) => state.delivery);
  const setDelivery = useCheckoutStore((state) => state.setDelivery);

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
            checked={delivery === "same-day"}
            onChange={(v) => setDelivery(v as DeliveryMethod)}
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
            checked={delivery === "standard"}
            onChange={(v) => setDelivery(v as DeliveryMethod)}
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
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

function OrderSummary({
  subtotalCents,
  taxCents,
  shippingCents,
  totalCents,
}: OrderSummaryProps) {
  const lines = useCartStore((state) => state.lines);
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
            <Text variant="body-sm" tone="muted">
              Tax (8.25%)
            </Text>
            <Text variant="body-sm">{formatPrice(taxCents)}</Text>
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
  const code = useCartStore((state) => state.promoCode);
  const setPromoCode = useCartStore((state) => state.setPromoCode);
  return (
    <Row gap="sm">
      <TextField
        placeholder="Promo code"
        value={code}
        onChange={(e) => setPromoCode(e.target.value)}
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
