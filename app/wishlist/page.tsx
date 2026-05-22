import type { Metadata } from "next";

import { AccountShell } from "@/app/components/account/account-shell";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import { StickyActions } from "@/app/components/sticky-actions";
import { Box, Container, Section, Stack } from "@/app/components/ui";
import { getSessionUser } from "@/app/lib/auth/server";
import { findStorefrontProduct } from "@/app/lib/products/storefront";
import type { CartProduct } from "@/app/lib/cart/types";
import { getWishlistIds } from "@/app/lib/wishlist/actions";
import { WishlistContent } from "./wishlist-content";

export const metadata: Metadata = {
  title: "Wish List — AdiCon Collections",
  description: "Pieces you've saved to revisit later.",
};

export const dynamic = "force-dynamic";

async function loadWishlistProducts(): Promise<CartProduct[]> {
  const ids = await getWishlistIds();
  if (ids.length === 0) return [];
  const lookups = await Promise.all(ids.map((id) => findStorefrontProduct(id)));
  return lookups.filter((p): p is CartProduct => Boolean(p));
}

export default async function WishlistPage() {
  const user = await getSessionUser();
  const initialProducts = user ? await loadWishlistProducts() : [];

  if (user) {
    return (
      <>
        <SiteHeader />
        <Box className="flex-1 w-full">
          <AccountShell user={user} active="wishlist">
            <WishlistContent
              initialProducts={initialProducts}
              isAuthenticated
            />
          </AccountShell>
        </Box>
        <StickyActions />
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <Box className="flex-1 w-full">
        <Container width="default">
          <Section padding="md">
            <Stack gap="2xl">
              <WishlistContent
                initialProducts={[]}
                isAuthenticated={false}
              />
            </Stack>
          </Section>
        </Container>
      </Box>
      <StickyActions />
      <SiteFooter />
    </>
  );
}
