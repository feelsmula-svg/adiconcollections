"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/app/lib/cart/cart-context";
import { formatPrice } from "@/app/lib/cart/format";
import type { CartProduct, ProductLengthOption } from "@/app/lib/cart/types";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Heading,
  Icon,
  Image,
  QuantityStepper,
  Row,
  Section,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";

const DEFAULT_LENGTHS: ProductLengthOption[] = [
  { length: '18"', priceCents: 0 },
  { length: '20"', priceCents: 0 },
  { length: '22"', priceCents: 0 },
  { length: '24"', priceCents: 0 },
];

function pickDefaultLength(
  options: ProductLengthOption[],
  description?: string,
): string {
  if (description) {
    const match = description.match(/(\d+)"/);
    if (match) {
      const fromDesc = `${match[1]}"`;
      const hit = options.find((o) => o.length === fromDesc);
      if (hit) return hit.length;
    }
  }
  return options[0]?.length ?? DEFAULT_LENGTHS[1].length;
}

function variantId(productId: string, length: string): string {
  const digits = length.replace(/\D+/g, "");
  return digits ? `${productId}--${digits}` : productId;
}

interface ProductDetailProps {
  product: CartProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, open: openCart } = useCart();
  const lengthOptions = useMemo<ProductLengthOption[]>(
    () =>
      product.lengthOptions && product.lengthOptions.length > 0
        ? product.lengthOptions
        : DEFAULT_LENGTHS,
    [product.lengthOptions],
  );
  const hasVariants = (product.lengthOptions?.length ?? 0) > 0;
  const [selectedLength, setSelectedLength] = useState<string>(() =>
    pickDefaultLength(lengthOptions, product.description),
  );
  const [quantity, setQuantity] = useState(1);

  const selectedOption =
    lengthOptions.find((o) => o.length === selectedLength) ?? lengthOptions[0];
  const displayPriceCents = hasVariants
    ? selectedOption.priceCents
    : product.priceCents;

  const onAddToBag = () => {
    if (hasVariants) {
      const variantProduct: CartProduct = {
        ...product,
        id: variantId(product.id, selectedOption.length),
        name: `${product.name} — ${selectedOption.length}`,
        priceCents: selectedOption.priceCents,
      };
      addItem(variantProduct, quantity);
    } else {
      addItem(product, quantity);
    }
    openCart();
  };

  return (
    <Container width="default">
      <Section padding="md">
        <Stack gap="lg">
          <Row gap="xs" align="center" wrap>
            <TextLink href="/" variant="muted" className="text-body-sm">
              Home
            </TextLink>
            <Icon name="chevron_right" className="text-sm text-outline-variant" />
            <TextLink href="/" variant="muted" className="text-body-sm">
              Shop
            </TextLink>
            <Icon name="chevron_right" className="text-sm text-outline-variant" />
            <Text variant="body-sm" tone="primary" className="font-bold">
              {product.name}
            </Text>
          </Row>

          <Box className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
            <Box className="lg:col-span-7">
              <ProductGallery product={product} />
            </Box>
            <Box className="lg:col-span-5 lg:sticky lg:top-md">
              <PurchasePanel
                product={product}
                lengthOptions={lengthOptions}
                selectedLength={selectedLength}
                onLengthChange={setSelectedLength}
                displayPriceCents={displayPriceCents}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToBag={onAddToBag}
              />
            </Box>
          </Box>

          <ProductDescription product={product} />
        </Stack>
      </Section>
    </Container>
  );
}

function ProductGallery({ product }: { product: CartProduct }) {
  return (
    <Stack gap="md">
      <Box className="relative aspect-[4/5] rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
        />
        {product.badge && (
          <Box className="absolute top-md left-md">
            <Badge tone={product.badge.tone}>{product.badge.label}</Badge>
          </Box>
        )}
      </Box>
      <Row gap="md">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            className="flex-1 relative aspect-square rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low"
          >
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              fill
              sizes="200px"
            />
          </Box>
        ))}
      </Row>
    </Stack>
  );
}

interface PurchasePanelProps {
  product: CartProduct;
  lengthOptions: ProductLengthOption[];
  selectedLength: string;
  onLengthChange: (length: string) => void;
  displayPriceCents: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToBag: () => void;
}

function PurchasePanel({
  product,
  lengthOptions,
  selectedLength,
  onLengthChange,
  displayPriceCents,
  quantity,
  onQuantityChange,
  onAddToBag,
}: PurchasePanelProps) {
  const gridColsClass =
    lengthOptions.length >= 4
      ? "grid-cols-4"
      : lengthOptions.length === 3
        ? "grid-cols-3"
        : "grid-cols-2";
  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Heading
          level={1}
          variant="display-lg"
          size="headline-md"
          className="leading-tight"
        >
          {product.name}
        </Heading>
        <Row gap="sm" align="center">
          <Row gap="none">
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                name="star"
                filled
                className="text-base text-primary"
              />
            ))}
          </Row>
          <Text variant="label-caps" tone="muted">
            (128 reviews)
          </Text>
        </Row>
      </Stack>

      <Text
        variant="body-lg"
        size="headline-md"
        tone="primary"
        className="font-bold"
      >
        {formatPrice(displayPriceCents)}
      </Text>

      <Stack gap="sm">
        <Row justify="between" align="center">
          <Text variant="label-caps" tone="muted">
            Select length
          </Text>
          <TextLink
            href="#"
            variant="default"
            className="text-body-sm underline"
          >
            Size guide
          </TextLink>
        </Row>
        <Box className={`grid ${gridColsClass} gap-sm`}>
          {lengthOptions.map((opt) => (
            <Button
              key={opt.length}
              variant={opt.length === selectedLength ? "primary" : "outline"}
              size="sm"
              onClick={() => onLengthChange(opt.length)}
            >
              {opt.length}
            </Button>
          ))}
        </Box>
      </Stack>

      <Card variant="elevated" padding="md">
        <Box className="grid grid-cols-2 gap-md">
          <SpecItem label="Origin" value="Premium Virgin" />
          <SpecItem label="Texture" value={product.description ?? "—"} />
          <SpecItem label="Lace type" value="HD Swiss" />
          <SpecItem label="Weight" value="300g (3 bundles)" />
        </Box>
      </Card>

      <Stack gap="sm">
        <Row gap="sm" align="center" justify="between">
          <Text variant="label-caps" tone="muted">
            Quantity
          </Text>
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            size="sm"
          />
        </Row>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={onAddToBag}
          className="gap-xs tracking-[0.12em]"
        >
          <Icon name="shopping_bag" className="text-base" />
          Add to bag
        </Button>
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onAddToBag}
          className="tracking-[0.12em]"
        >
          Buy now
        </Button>
      </Stack>

      <Stack gap="xs" className="pt-md border-t border-outline-variant">
        <Row gap="sm" align="center">
          <Icon
            name="local_shipping"
            className="text-base text-on-surface-variant"
          />
          <Text variant="body-sm" tone="muted">
            Free express shipping on US orders over $150
          </Text>
        </Row>
        <Row gap="sm" align="center">
          <Icon
            name="workspace_premium"
            className="text-base text-on-surface-variant"
          />
          <Text variant="body-sm" tone="muted">
            100% Remy virgin human hair guaranteed
          </Text>
        </Row>
      </Stack>
    </Stack>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="xs">
      <Text variant="label-caps" tone="muted" className="text-[10px]">
        {label}
      </Text>
      <Text variant="body-sm" className="font-bold">
        {value}
      </Text>
    </Stack>
  );
}

function ProductDescription({ product }: { product: CartProduct }) {
  return (
    <Section padding="md">
      <Box className="grid grid-cols-1 md:grid-cols-12 gap-xl">
        <Box className="md:col-span-4">
          <Heading
            level={2}
            variant="headline-sm"
            className="text-primary border-l-4 border-primary pl-md"
          >
            The Details
          </Heading>
        </Box>
        <Box className="md:col-span-8">
          <Stack gap="md">
            <Text variant="body-lg" className="leading-relaxed">
              Our{" "}
              <Text as="span" tone="primary" className="font-bold">
                {product.name}
              </Text>{" "}
              is crafted with care. Sourced from premium donors with the
              cuticle intact and aligned in one direction, each bundle stays
              tangle-free and ultra-soft for over two years with proper care.
            </Text>
            <Text variant="body-md" tone="muted">
              Pair with our care collection for best results — gentle wash, low
              heat, and a satin pillowcase will keep this piece looking
              salon-fresh wash after wash.
            </Text>
            <Card variant="tonal" padding="lg">
              <Stack gap="sm">
                <Text variant="editorial-italic">
                  &ldquo;Designed for the woman who demands excellence without
                  compromise.&rdquo;
                </Text>
                <Text variant="label-caps" tone="primary">
                  — Adrienne C., Founder
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Section>
  );
}
