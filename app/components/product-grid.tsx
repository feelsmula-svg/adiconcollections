"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  LinkButton,
  Row,
  Section,
  Stack,
} from "@/app/components/ui";
import type { CartProduct } from "@/app/lib/cart/types";
import { FEATURED_PRODUCTS } from "@/app/lib/products/catalog";
import { ProductCard } from "./products/product-card";

const TEXTURES = ["All", "Straight", "Curly", "Waves", "Bangs"] as const;
type Texture = (typeof TEXTURES)[number];

const DEFAULT_PREVIEW_LIMIT = 8;

function matches(texture: Texture, name: string, description?: string): boolean {
  if (texture === "All") return true;
  const haystack = `${name} ${description ?? ""}`.toLowerCase();
  return haystack.includes(texture.toLowerCase());
}

interface ProductGridProps {
  products?: CartProduct[];
  previewLimit?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function ProductGrid({
  products: provided,
  previewLimit = DEFAULT_PREVIEW_LIMIT,
  viewAllHref = "/shop",
  viewAllLabel = "View all products",
}: ProductGridProps = {}) {
  const source = provided ?? FEATURED_PRODUCTS;
  const [active, setActive] = useState<Texture>("All");
  const filtered = source.filter((p) =>
    matches(active, p.name, p.description),
  );
  const products = filtered.slice(0, previewLimit);
  const hasMore = filtered.length > previewLimit;

  return (
    <Section padding="lg">
      <Container width="default">
        <Stack gap="xl">
          <Stack gap="md" align="center">
            <Heading
              level={2}
              variant="display-lg"
              size="headline-sm"
              align="center"
              className="uppercase tracking-[0.2em]"
            >
              Choose Your Style
            </Heading>
            <Row gap="xs" wrap justify="center">
              {TEXTURES.map((texture) => (
                <Button
                  key={texture}
                  variant={active === texture ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setActive(texture)}
                  className={
                    active === texture
                      ? "border-primary text-primary"
                      : "text-on-surface-variant"
                  }
                >
                  {texture}
                </Button>
              ))}
            </Row>
          </Stack>

          <Box className="grid grid-cols-2 md:grid-cols-4 gap-xl">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                ctaLabel="Quick add"
                withWishlist
              />
            ))}
          </Box>

          <Row justify="center">
            <LinkButton
              href={viewAllHref}
              variant={hasMore ? "primary" : "outline"}
              size="lg"
              caps
            >
              {hasMore
                ? `${viewAllLabel} (${filtered.length})`
                : viewAllLabel}
            </LinkButton>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
