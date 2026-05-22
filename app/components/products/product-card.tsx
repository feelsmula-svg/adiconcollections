"use client";

import { useMemo, useState } from "react";
import {
  selectCartQuantityFor,
  selectIsInCart,
  useCartStore,
} from "@/app/lib/state/cart-store";
import { useWishlist } from "@/app/lib/wishlist/wishlist-context";
import { useHydrated } from "@/app/lib/state/hydration";
import { formatPrice } from "@/app/lib/cart/format";
import type {
  CartProduct,
  ProductLengthOption,
} from "@/app/lib/cart/types";
import {
  Badge,
  Box,
  Button,
  Heading,
  Icon,
  IconButton,
  Image,
  QuantityStepper,
  Row,
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

export function ProductCard({
  product,
  rank,
  ctaLabel = "Quick add",
  ctaStyle = "primary",
  withWishlist,
}: ProductCardProps) {
  const hydrated = useHydrated();
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const lines = useCartStore((state) => state.lines);
  const inCartRaw = useCartStore(selectIsInCart(product.id));
  const quantityRaw = useCartStore(selectCartQuantityFor(product.id));
  const inCart = hydrated && inCartRaw;
  const quantity = hydrated ? quantityRaw : 0;

  const wishlist = useWishlist();
  const isWishlisted = wishlist.isWishlisted(product.id);
  const toggleWishlist = wishlist.toggle;
  const wishlistAvailable = wishlist.isAuthenticated;

  const href = `/products/${product.id}`;

  const baseVariantLine = lines.find(
    (line) =>
      line.product.id === product.id ||
      line.product.id.startsWith(`${product.id}--`),
  );

  const onStepperChange = (q: number) => {
    if (!baseVariantLine) return;
    setQuantity(baseVariantLine.product.id, q);
  };

  const hasVariants = (product.lengthOptions?.length ?? 0) > 0;
  const lengthOptions = useMemo<ProductLengthOption[]>(
    () =>
      product.lengthOptions && product.lengthOptions.length > 0
        ? product.lengthOptions
        : DEFAULT_LENGTHS,
    [product.lengthOptions],
  );

  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [selectedLength, setSelectedLength] = useState<string>(() =>
    pickDefaultLength(lengthOptions, product.description),
  );
  const [pendingQuantity, setPendingQuantity] = useState<number>(1);

  const openQuickAdd = () => {
    setSelectedLength(pickDefaultLength(lengthOptions, product.description));
    setPendingQuantity(1);
    setIsQuickAdding(true);
  };

  const cancelQuickAdd = () => setIsQuickAdding(false);

  const confirmQuickAdd = () => {
    if (hasVariants) {
      const opt =
        lengthOptions.find((o) => o.length === selectedLength) ??
        lengthOptions[0];
      const variantProduct: CartProduct = {
        ...product,
        id: variantId(product.id, opt.length),
        name: `${product.name} — ${opt.length}`,
        priceCents: opt.priceCents || product.priceCents,
      };
      addItem(variantProduct, pendingQuantity);
    } else {
      addItem(product, pendingQuantity);
    }
    setIsQuickAdding(false);
  };

  return (
    <Stack gap="sm" className="group h-full">
      <Box className="relative aspect-product overflow-hidden bg-surface-container-low rounded-lg">
        <TextLink
          href={href}
          variant="bare"
          aria-label={product.name}
          className="absolute inset-0 block"
        >
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="group-hover:scale-105 transition-transform duration-500"
          />
        </TextLink>

        {product.badge && (
          <Box className="absolute top-sm left-sm sm:top-md sm:left-md pointer-events-none">
            <Badge tone={product.badge.tone} size="sm">
              {product.badge.label}
            </Badge>
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

        {withWishlist && wishlistAvailable && !inCart && (
          <Box className="absolute top-sm right-sm sm:top-md sm:right-md">
            <IconButton
              icon="favorite"
              filled={isWishlisted}
              label={
                isWishlisted
                  ? `Remove ${product.name} from wishlist`
                  : `Save ${product.name} to wishlist`
              }
              variant="tonal"
              size="sm"
              aria-pressed={isWishlisted}
              onClick={() => toggleWishlist(product.id)}
              className="bg-surface/80"
            />
          </Box>
        )}

        {inCart && !isQuickAdding && (
          <Box className="absolute top-sm right-sm sm:top-md sm:right-md pointer-events-none">
            <Badge tone="primary" size="sm">
              In bag
            </Badge>
          </Box>
        )}

        {isQuickAdding && (
          <Box
            role="dialog"
            aria-label={`Quick add ${product.name}`}
            className="absolute inset-0 bg-surface/85 backdrop-blur-sm px-sm pt-sm pb-2xl sm:px-md sm:pt-md sm:pb-3xl flex items-center justify-center overflow-y-auto"
          >
            <Stack gap="xs" align="stretch" className="w-full sm:gap-sm">
              {hasVariants && (
                <Stack gap="xs" align="center">
                  <Text
                    variant="label-caps"
                    tone="muted"
                    align="center"
                    className="font-bold"
                  >
                    Select length
                  </Text>
                  <Stack gap="xs" align="stretch" className="w-full">
                    {lengthOptions.map((opt) => (
                      <Button
                        key={opt.length}
                        variant={
                          opt.length === selectedLength ? "primary" : "outline"
                        }
                        size="sm"
                        fullWidth
                        caps={false}
                        onClick={() => setSelectedLength(opt.length)}
                        className="rounded-full text-label-caps sm:text-body-sm leading-none"
                      >
                        {opt.length}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              )}
              <Stack gap="xs" align="center">
                <Text
                  variant="label-caps"
                  tone="muted"
                  align="center"
                  className="font-bold"
                >
                  Quantity
                </Text>
                <QuantityStepper
                  value={pendingQuantity}
                  min={1}
                  onChange={setPendingQuantity}
                  size="sm"
                  label={`Quantity of ${product.name}`}
                />
              </Stack>
            </Stack>
          </Box>
        )}

        <Box className="absolute bottom-sm left-sm right-sm sm:bottom-md sm:left-md sm:right-md">
          {inCart && !isQuickAdding ? (
            <QuantityStepper
              value={quantity}
              min={0}
              onChange={onStepperChange}
              size="sm"
              fullWidth
              label={`Quantity of ${product.name} in bag`}
            />
          ) : isQuickAdding ? (
            <Row gap="xs" className="sm:gap-sm">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                caps={false}
                onClick={cancelQuickAdd}
                className="rounded-full uppercase font-label-caps tracking-wider whitespace-nowrap bg-surface/90 px-sm sm:px-md text-label-caps sm:text-body-sm leading-none"
              >
                Cancel
              </Button>
              <Button
                variant={ctaStyle === "inverse" ? "inverse" : "primary"}
                size="sm"
                fullWidth
                caps={false}
                onClick={confirmQuickAdd}
                className="rounded-full uppercase font-label-caps tracking-wider whitespace-nowrap px-sm sm:px-md text-label-caps sm:text-body-sm leading-none"
              >
                Add
              </Button>
            </Row>
          ) : (
            <Button
              variant={ctaStyle === "inverse" ? "inverse" : "primary"}
              size="sm"
              fullWidth
              caps={false}
              onClick={openQuickAdd}
              className="gap-xs rounded-full uppercase font-label-caps tracking-wider whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-300 px-sm sm:px-md text-label-caps sm:text-body-sm leading-none"
            >
              <Icon name="shopping_bag" className="text-sm" />
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
            size="label-caps"
            className="font-medium uppercase text-on-surface-variant"
          >
            {product.name}
          </Heading>
          <Text variant="label-caps" tone="primary" className="font-bold">
            {formatPrice(product.priceCents)}
          </Text>
          {hasVariants && (
            <Text
              variant="body-sm"
              size="label-caps"
              tone="muted"
              align="center"
              className="opacity-70"
            >
              More sizes available
            </Text>
          )}
        </Stack>
      </TextLink>
    </Stack>
  );
}
