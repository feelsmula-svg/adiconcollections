"use client";

import { useCart } from "@/app/lib/cart/cart-context";
import { formatPrice } from "@/app/lib/cart/format";
import type { CartProduct } from "@/app/lib/cart/types";
import {
  Badge,
  Box,
  Button,
  Heading,
  IconButton,
  Image,
  QuantityStepper,
  Stack,
  Text,
  TextLink,
} from "@/app/components/ui";

type CtaStyle = "primary" | "inverse";

interface ProductCardProps {
  product: CartProduct;
  rank?: number;
  ctaLabel?: string;
  ctaStyle?: CtaStyle;
  withWishlist?: boolean;
}

export function ProductCard({
  product,
  rank,
  ctaLabel = "Add to bag",
  ctaStyle = "primary",
  withWishlist,
}: ProductCardProps) {
  const { addItem, setQuantity, lines } = useCart();
  const line = lines.find((l) => l.product.id === product.id);
  const quantity = line?.quantity ?? 0;
  const inCart = quantity > 0;

  const href = `/products/${product.id}`;

  return (
    <Stack gap="sm" className="group">
      <Box className="relative aspect-square overflow-hidden bg-surface-container-low rounded-lg">
        <TextLink href={href} variant="bare" aria-label={product.name}>
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="group-hover:scale-105 transition-transform duration-500"
          />
        </TextLink>

        {product.badge && (
          <Box className="absolute top-md left-md pointer-events-none">
            <Badge tone={product.badge.tone}>{product.badge.label}</Badge>
          </Box>
        )}

        {typeof rank === "number" && (
          <Text
            aria-hidden
            className="absolute top-sm right-md text-white font-display-lg text-4xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] pointer-events-none"
          >
            {rank.toString().padStart(2, "0")}
          </Text>
        )}

        {withWishlist && !inCart && (
          <Box className="absolute top-md right-md">
            <IconButton
              icon="favorite"
              label={`Save ${product.name} to wishlist`}
              variant="tonal"
              size="sm"
              className="bg-surface/80"
            />
          </Box>
        )}

        {inCart && (
          <Box className="absolute top-md right-md pointer-events-none">
            <Badge tone="primary" size="sm">
              In bag
            </Badge>
          </Box>
        )}

        <Box className="absolute bottom-sm left-sm right-sm">
          {inCart ? (
            <QuantityStepper
              value={quantity}
              min={0}
              onChange={(q) => setQuantity(product.id, q)}
              size="sm"
              fullWidth
              label={`Quantity of ${product.name} in bag`}
            />
          ) : (
            <Button
              variant={ctaStyle === "inverse" ? "inverse" : "primary"}
              size="sm"
              fullWidth
              onClick={() => addItem(product)}
              className="tracking-[0.12em]"
            >
              {ctaLabel}
            </Button>
          )}
        </Box>
      </Box>

      <TextLink href={href} variant="bare">
        <Stack gap="xs" align="center" className="text-center">
          <Heading
            level={3}
            variant="headline-sm"
            size="body-sm"
            className="font-normal tracking-wide uppercase text-on-surface-variant"
          >
            {product.name}
          </Heading>
          <Text variant="body-sm" tone="primary" className="font-bold">
            {formatPrice(product.priceCents)}
          </Text>
        </Stack>
      </TextLink>
    </Stack>
  );
}
