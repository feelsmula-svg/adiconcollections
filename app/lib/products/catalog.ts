import type { CartProduct } from "@/app/lib/cart/types";

export function allProducts(): CartProduct[] {
  return [...FEATURED_PRODUCTS, ...ACCESSORIES];
}

export function findProduct(id: string): CartProduct | undefined {
  return allProducts().find((p) => p.id === id);
}

export function allProductIds(): string[] {
  return allProducts().map((p) => p.id);
}

export function productsByKeywords(keywords: string[]): CartProduct[] {
  const needles = keywords.map((k) => k.toLowerCase());
  return allProducts().filter((p) => {
    const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
    return needles.some((n) => hay.includes(n));
  });
}

export function productsOnSale(maxCents: number): CartProduct[] {
  return allProducts().filter((p) => p.priceCents <= maxCents);
}

export const FEATURED_PRODUCTS: CartProduct[] = [
  {
    id: "super-double-drawn-ombre",
    name: "5x5 HD Lace Bone Straight Wig (Ombre Brown)",
    description: "Raw Hair · Super Double Drawn",
    priceCents: 72_500,
    imageSrc: "/products/super-double-drawn-32-ombre-a.jpeg",
    imageAlt:
      "Ombre brown bone straight wig with 5x5 HD lace closure",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '26"', priceCents: 72_500 },
      { length: '32"', priceCents: 85_000 },
    ],
  },
  {
    id: "super-double-drawn-28-burgundy",
    name: '5x5 HD Lace Bone Straight Wig (28" Ombre Burgundy)',
    description: "Raw Hair · Super Double Drawn",
    priceCents: 65_500,
    imageSrc: "/products/super-double-drawn-28-burgundy-a.jpeg",
    imageAlt:
      "28-inch ombre burgundy bone straight wig with 5x5 HD lace closure",
    badge: { tone: "secondary", label: "Luxury" },
  },
  {
    id: "jerry-curl-13x4-22",
    name: '13x4 Transparent Lace Jerry Curl (22")',
    description: "Super Double Drawn · Natural Black",
    priceCents: 30_000,
    imageSrc: "/products/jerry-curl-22-a.jpeg",
    imageAlt: "13x4 transparent lace Jerry curl wig in natural black, 22 inches",
  },
  {
    id: "bone-straight-ombre-purple-12",
    name: '4x4 HD Lace Bone Straight Wig with Bangs (12" Ombre Purple)',
    description: "Raw Hair · Super Double Drawn · Bangs",
    priceCents: 30_000,
    imageSrc: "/products/bone-straight-ombre-purple-12-a.jpeg",
    imageAlt:
      "12-inch ombre purple bone straight wig with bangs and 4x4 HD lace closure",
    badge: { tone: "secondary", label: "Luxury" },
  },
  {
    id: "bone-straight-brown-12",
    name: '4x4 HD Lace Bone Straight Wig with Bangs (12" Brown)',
    description: "Raw Hair · Super Double Drawn · Bangs",
    priceCents: 30_000,
    imageSrc: "/products/bone-straight-brown-12-a.jpeg",
    imageAlt:
      "12-inch brown bone straight wig with bangs and 4x4 HD lace closure",
    badge: { tone: "secondary", label: "Luxury" },
  },
];

export const ACCESSORIES: CartProduct[] = [
  {
    id: "sculpting-brush",
    name: "The Sculpting Brush",
    description: "Mahogany handle · Boar bristles",
    priceCents: 6_800,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFnMQ7oONN5IolZi2dYCEDMg5ts3cIijaK99obwYwrQI4t6enMbkK7KMLmbgW90Q0-a98XmyjX_lg7QnToRMxxjQ4p9vZeRb5n0CN9OFNeEpGAevDV0SzqOKkGGxuZtc94V2ooQzvdCEBoPQFJLyo5iHC2OuvyuIDrwTWdzoUfQbw5O1HeKJh35oqV4oE_y11uJEJxjkk7DzVPjZXo-poCWeFyCqp6RZa3F9tHNn6BWWSlVkDiRpx9EH1H7EebEXOb-FPQJUnWfv4",
    imageAlt:
      "Professional-grade mahogany wood hairbrush on a warm cream stone surface",
    badge: { tone: "primary", label: "New" },
  },
  {
    id: "mulberry-silk-trio",
    name: "Mulberry Silk Trio",
    description: "Set of 3 · 100% silk",
    priceCents: 4_500,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMZ-tgWO-MA2i9fkupxD1PCTG4pe58VBiYbMONp0ECEXnLcWCWGCCuWhEj9ZcJw0NI7b6w66LVFRemLIwtChLY9nd60hz-lXA4J0cLaaM4yJutlQIXtqQweJRk6BA9w7QW4w09vpOWSCcgaxSwb4VPfqTbIIc1wf3cjMMX70XXA_XpfdhBqiStyrieO1PHXwhzfeKxkhnDzAX8wyHYmVi23m8PUUMaZhuYAUFDCmBnMjhHXpTAs2_hMZu51SetSWMxwir-A5dT5Tc",
    imageAlt: "Luxury silk hair scrunchies in mocha, caramel and cream tones",
  },
  {
    id: "ionic-flow-dryer",
    name: "Ionic Flow Dryer",
    description: "Pro grade · Ionic technology",
    priceCents: 21_000,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCJgNBggVeUOMXUasyAZQEjcChsfz0X0F-Klk20mTxYRvkhH_zHO_yfYNp_dQauVPK1oKKOi-dH9uZwMNZ3u_zDPZG5I00pMYnAOA4ElbGDq9TSTOQFzwBbJzfw6XlhnO3h1AVAlE4WbXINHTl76J60kUb2SQU8PTs0ayO8iFjcB4awvLwWzla-F0AkkPW3hDVRVThcznbX0dEWjJMqopGUsAzCAjdKuAhf-m7yd0X7ni6GtaBoiBGqiSaJ3xXvW1qBCbCfBxolf5w",
    imageAlt:
      "Matte-finish professional hair dryer in charcoal with rose gold accents",
  },
  {
    id: "precision-clip-set",
    name: "Precision Clip Set",
    description: "Set of 4 · Tortoise resin",
    priceCents: 3_200,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBtv0-US9pGYdd1EHA20XTJYm1AfRvVaFypiS6GnWHQHKphiBAYp2nLQYd-qRh5eyySL3_dwQjen68iceIm3m_fFo9oGuT7gvAnHnQLagugTl05R0h8-v2PBzuOqNAqBLnlB2dmbzJO57sX1zTvS58fre1oTBWURp28Df0U2t2sX_rNJ6wSapqmNC2Sw6t50yUsKW3L3GqMvpS6btqzhjv6yGBgrQo2ST6KG3_u_2jGteDOD5PZiLLpBpFB4_HJVfqorRT1uLntv7w",
    imageAlt:
      "Four minimalist styling clips in amber and tortoiseshell on a porcelain tray",
    badge: { tone: "secondary", label: "Bestseller" },
  },
  {
    id: "sandalwood-detangler",
    name: "Sandalwood Detangler",
    description: "Wide-tooth · Hand-carved",
    priceCents: 3_800,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMHyRaaD4SmGmBl-bFWxZViMMsQ0y_w4HSFxCU75ukDiY4gtmn3JuWM2mlITRKDtnLBaRBG9y6d1jYSoeO9p4aEgoO9ED-oSGoZsPu_2r6Wi3oyiQi2fMg6N3l_t6nHV2cGt3VZrkdiI57bFzdUTU7u2D3f2CroyyxtJVOlDOETsOJe0vbG7IGkMv1Ih6zDnRSCUy2AUFMY3jPfG0vbl0TeIYds41iXrIEEROQUjGbUe_OZlQGe2q-4y-r6zjXaSeq0zvAfq_hDa4",
    imageAlt: "Hand-carved sandalwood wide-tooth comb on a soft cream linen surface",
  },
  {
    id: "ceramic-styler-pro",
    name: "Ceramic Styler Pro",
    description: "Salon grade · Ceramic plates",
    priceCents: 18_500,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBKjxfptuMEJ58_gq000azlKJ6yM1eyopxj7D58ot1tSj-yMLVVJFW-6PdvqL1pAGi34HSxFfyFfL3uplMJPuMTbvcGdIs5crwBlzf7TOhlo29rwP88g2IIS9qAmYA1AabZgn9CF9AjPqGjDXQpJkse1gOeXVGSrVw_IRYrRGWzJO6lwps-USM2CvICYlC42Nt32NKPtTk24vrpIKnns6nCp9a6iCzJfHwFEJkqeJU4a6rRAGqvz6E7ICc8PMB_opUVFpu_vtq9Vjk",
    imageAlt:
      "High-end ceramic flat iron in cream finish on draped mahogany silk",
  },
  {
    id: "beauty-sleep-set",
    name: "Beauty Sleep Set",
    description: "Silk pillowcase + scrunchie",
    priceCents: 9_500,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5HuWVJqWK0joy-AG6LaEySS1hDjU-2nr-HfIA5AobVF_2Iq4Wfltwh1-EXeAbz1N0lE69twMmQgHgEDNkQBN9sJS-FDtuycnbA7gfBuiFI7fxDoMAfbrLzzYpwfUZPsctDLpAEuF7aCgcxWifnOjWD37LkOqVU0ooKq9HRy_DaZm7I7hv_EH7YxK_926U0IGidJopJqoHSqcUaWW3IxK71aRTdfmGgb0rr-g_1OTLrTarM4syhIed2T3JwzjmG6Ac6o3wYkHrj9U",
    imageAlt:
      "Champagne gold silk pillowcases folded on a minimalist wooden bench",
  },
  {
    id: "texture-mist-kit",
    name: "Texture Mist Kit",
    description: "3-piece styling set",
    priceCents: 5_400,
    imageSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBADgk4ZGZM5W98Jnb32oljmMmkPz3V3uinI9XPrQz_-izeBA7Bm5CcGEvNRFb_LiCb_Tg4AjNdMI9cPdjSFA0XSNx7vMQdjbWUL1s2o9Z08kHkrEQO9XvezpK0EZDyEIDwWxJBxEeysYddKOFTMK7fKrm-vdJ6b0m4jsRhaW447ajszkGOfBDhQTg1ADWg1xANJDvYRO08YJngM67OGY1DdCH5XlmrR7MbP1FIEP-mSkaUs0PQJLIMjiKH5_c6dn9SE6IyyBCgzFI",
    imageAlt:
      "Minimalist hair mist bottles with black pumps on warm beige background",
  },
];
