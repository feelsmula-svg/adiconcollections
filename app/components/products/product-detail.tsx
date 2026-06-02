"use client";

import { useMemo, useState } from "react";
import { useCartStore } from "@/app/lib/state/cart-store";
import {
  discountBadgeLabel,
  discountedCents,
  formatPrice,
  hasDiscount,
} from "@/app/lib/cart/format";
import type { CartProduct, ProductLengthOption } from "@/app/lib/cart/types";
import {
  Badge,
  Box,
  Button,
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
  return options[0]?.length ?? "";
}

function variantId(productId: string, length: string): string {
  const digits = length.replace(/\D+/g, "");
  return digits ? `${productId}--${digits}` : productId;
}

interface ProductDetailProps {
  product: CartProduct;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.open);
  const lengthOptions = useMemo<ProductLengthOption[]>(
    () => product.lengthOptions ?? [],
    [product.lengthOptions],
  );
  const hasVariants = lengthOptions.length > 0;
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
        // Charge the discounted price; the cart line is the net source of truth.
        priceCents: discountedCents(
          selectedOption.priceCents,
          product.discountPercent,
        ),
        discountPercent: undefined,
      };
      addItem(variantProduct, quantity);
    } else if (hasDiscount(product.discountPercent)) {
      addItem(
        {
          ...product,
          priceCents: discountedCents(
            product.priceCents,
            product.discountPercent,
          ),
          discountPercent: undefined,
        },
        quantity,
      );
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
            <TextLink href="/shop" variant="muted" className="text-body-sm">
              Shop
            </TextLink>
            <Icon name="chevron_right" className="text-sm text-outline-variant" />
            <Text variant="body-sm" tone="primary" className="font-bold">
              {product.name}
            </Text>
          </Row>

          <Box className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
            <Box className="lg:col-span-6">
              <ProductGallery product={product} />
            </Box>
            <Box className="lg:col-span-6 lg:sticky lg:top-[120px]">
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
        </Stack>
      </Section>
    </Container>
  );
}

function ProductGallery({ product }: { product: CartProduct }) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageSrc];
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, images.length - 1);
  const activeSrc = images[safeIndex];

  return (
    <Box className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[560px] mx-auto lg:mx-0">
      <Stack gap="sm">
        <Box className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-low">
          <Image
            src={activeSrc}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
          {hasDiscount(product.discountPercent) ? (
            <Box className="absolute top-md left-md">
              <Badge tone="primary">
                {discountBadgeLabel(product.discountPercent as number)}
              </Badge>
            </Box>
          ) : product.badge ? (
            <Box className="absolute top-md left-md">
              <Badge tone={product.badge.tone}>{product.badge.label}</Badge>
            </Box>
          ) : null}
        </Box>
        {images.length > 1 && (
          <Row gap="sm" wrap>
            {images.map((src, index) => {
              const isActive = index === safeIndex;
              return (
                <Button
                  key={`${index}-${src.slice(0, 32)}`}
                  variant="ghost"
                  size="sm"
                  caps={false}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={isActive}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 p-0 rounded-lg overflow-hidden border ${
                    isActive
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-outline-variant hover:border-primary"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.imageAlt} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Button>
              );
            })}
          </Row>
        )}
      </Stack>
    </Box>
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
      <Heading
        level={1}
        variant="display-lg"
        size="headline-md"
        className="leading-tight"
      >
        {product.name}
      </Heading>

      {hasDiscount(product.discountPercent) ? (
        <Row gap="sm" align="center" wrap>
          <Text
            variant="body-lg"
            size="headline-md"
            tone="primary"
            className="font-bold"
          >
            {formatPrice(
              discountedCents(displayPriceCents, product.discountPercent),
            )}
          </Text>
          <Text variant="body-lg" tone="muted" className="line-through">
            {formatPrice(displayPriceCents)}
          </Text>
          <Badge tone="primary">
            {discountBadgeLabel(product.discountPercent as number)}
          </Badge>
        </Row>
      ) : (
        <Text
          variant="body-lg"
          size="headline-md"
          tone="primary"
          className="font-bold"
        >
          {formatPrice(displayPriceCents)}
        </Text>
      )}

      {product.description && (
        <Text variant="body-md" tone="muted" className="leading-relaxed">
          {product.description}
        </Text>
      )}

      {lengthOptions.length > 0 && (
        <Stack gap="sm">
          <Text variant="label-caps" tone="muted">
            Select length
          </Text>
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
      )}

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
    </Stack>
  );
}
