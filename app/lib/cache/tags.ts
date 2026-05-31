/**
 * Centralised cache tags for `unstable_cache` / `revalidateTag`.
 *
 * Cached storefront reads are tagged here so a Mongo round-trip is not paid on
 * every request. Admin mutations bust the matching tag so changes show up
 * quickly.
 *
 * NOTE: products are intentionally NOT cross-request cached yet — their records
 * embed base64 image data that exceeds the 2 MB data-cache limit. They use
 * request-scoped `cache()` in `lib/products/storefront.ts` instead.
 */
export const CACHE_TAGS = {
  campaigns: "campaigns",
} as const;
