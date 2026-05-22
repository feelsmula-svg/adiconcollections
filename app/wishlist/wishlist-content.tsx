"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useWishlist } from "@/app/lib/wishlist/wishlist-context";
import { ProductCard } from "@/app/components/products/product-card";
import type { CartProduct } from "@/app/lib/cart/types";
import {
  Box,
  Button,
  Heading,
  Icon,
  Stack,
  Text,
} from "@/app/components/ui";

interface WishlistContentProps {
  initialProducts: CartProduct[];
  isAuthenticated: boolean;
}

export function WishlistContent({
  initialProducts,
  isAuthenticated,
}: WishlistContentProps) {
  const router = useRouter();
  const { ids } = useWishlist();

  const products = useMemo(() => {
    if (!isAuthenticated) return [];
    if (ids.size === 0) return [];
    return initialProducts.filter((product) => ids.has(product.id));
  }, [initialProducts, ids, isAuthenticated]);

  const isEmpty = products.length === 0;
  const count = products.length;

  return (
    <>
      <Stack gap="xs">
        <Text
          variant="label-caps"
          tone="primary"
          as="span"
          className="tracking-[0.2em]"
        >
          Saved For Later
        </Text>
        <Heading
          level={1}
          variant="display-lg"
          size="headline-md"
          className="md:text-headline-md lg:text-display-lg"
        >
          Your wish list
        </Heading>
        <Box className="max-w-[560px]">
          <Text variant="body-md" tone="muted">
            Save pieces from the collection to revisit later. We&apos;ll keep
            them here for whenever you&apos;re ready.
            {count > 0 ? (
              <Text as="span" variant="body-md" className="font-semibold">
                {" "}
                · {count} piece{count === 1 ? "" : "s"} saved
              </Text>
            ) : null}
          </Text>
        </Box>
      </Stack>

      {isEmpty ? (
        <Box className="rounded-2xl border border-outline-variant bg-surface-container-low p-2xl md:p-3xl">
          <Stack gap="md" align="center" justify="center" className="text-center">
            <Box className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
              <Icon
                name="favorite"
                className="text-on-surface-variant text-3xl"
              />
            </Box>
            <Heading
              level={2}
              variant="headline-sm"
              size="body-lg"
              className="md:text-headline-sm"
            >
              {isAuthenticated
                ? "Your wish list is empty"
                : "Sign in to save pieces"}
            </Heading>
            <Box className="max-w-[360px]">
              <Text variant="body-sm" tone="muted">
                {isAuthenticated
                  ? "Tap the heart on any piece to save it here — it’ll be waiting for you when you’re ready."
                  : "Create an account or sign in to save pieces to your wish list across devices."}
              </Text>
            </Box>
            <Box className="pt-xs">
              <Button
                variant="primary"
                size="sm"
                caps={false}
                className="rounded-full"
                onClick={() => router.push("/shop")}
              >
                Browse the collection
              </Button>
            </Box>
          </Stack>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} withWishlist />
          ))}
        </Box>
      )}
    </>
  );
}
