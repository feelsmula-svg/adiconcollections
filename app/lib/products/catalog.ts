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
    id: "hd-curl-frontal-13x5",
    name: "13x5 HD Lace Curl Frontal",
    description: "100% Raw Vietnamese Single Donor Hair · Curl Tips",
    priceCents: 8_500,
    imageSrc: "/products/hd-curl-frontal-13x5-a.jpeg",
    imageAlt:
      "13x5 HD lace frontal in natural black with bouncy curled ends tipped in burgundy",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '14"', priceCents: 8_500 },
      { length: '16"', priceCents: 9_500 },
      { length: '18"', priceCents: 10_500 },
      { length: '20"', priceCents: 12_500 },
      { length: '22"', priceCents: 14_000 },
      { length: '24"', priceCents: 16_000 },
    ],
  },
  {
    id: "hd-straight-frontal-13x5",
    name: "13x5 HD Lace Straight Frontal",
    description: "100% Raw Vietnamese Single Donor Hair · Bone Straight",
    priceCents: 8_000,
    imageSrc: "/products/hd-straight-frontal-13x5-a.jpeg",
    imageAlt:
      "Natural black 13x5 HD lace straight frontal with sleek silky strands laid flat on a marble surface",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '14"', priceCents: 8_000 },
      { length: '16"', priceCents: 9_000 },
      { length: '18"', priceCents: 10_000 },
      { length: '20"', priceCents: 12_000 },
      { length: '22"', priceCents: 13_500 },
      { length: '24"', priceCents: 15_500 },
    ],
  },
  {
    id: "hd-kinky-straight-closure-5x5",
    name: "5x5 HD Lace Kinky Straight Closure",
    description: "100% Raw Vietnamese Single Donor Hair · Kinky Straight",
    priceCents: 7_000,
    imageSrc: "/products/hd-kinky-straight-closure-5x5-a.jpeg",
    imageAlt:
      "Natural black 5x5 HD lace kinky straight closure with crimped, textured strands held against a leafy green backdrop",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '14"', priceCents: 7_000 },
      { length: '16"', priceCents: 8_000 },
      { length: '18"', priceCents: 9_000 },
      { length: '20"', priceCents: 11_000 },
      { length: '22"', priceCents: 12_500 },
      { length: '24"', priceCents: 14_500 },
    ],
  },
  {
    id: "hd-straight-closure-5x5",
    name: "5x5 HD Lace Straight Closure",
    description: "100% Raw Vietnamese Single Donor Hair · Bone Straight",
    priceCents: 7_000,
    imageSrc: "/products/hd-straight-closure-5x5-a.jpeg",
    imageAlt:
      "Natural black 5x5 HD lace straight closure with sleek silky strands held up against a soft grey backdrop",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '14"', priceCents: 7_000 },
      { length: '16"', priceCents: 8_000 },
      { length: '18"', priceCents: 9_000 },
      { length: '20"', priceCents: 11_000 },
      { length: '22"', priceCents: 12_500 },
      { length: '24"', priceCents: 14_500 },
    ],
  },
  {
    id: "hd-body-wave-closure-5x5",
    name: "5x5 HD Lace Body Wave Closure",
    description: "100% Raw Vietnamese Single Donor Hair · Body Wave",
    priceCents: 7_000,
    imageSrc: "/products/hd-body-wave-closure-5x5-a.jpeg",
    imageAlt:
      "Natural black 5x5 HD lace body wave closure with loose flowing waves held up against a green leaf backdrop",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '14"', priceCents: 7_000 },
      { length: '16"', priceCents: 8_000 },
      { length: '18"', priceCents: 9_000 },
      { length: '20"', priceCents: 11_000 },
      { length: '22"', priceCents: 12_500 },
      { length: '24"', priceCents: 14_500 },
    ],
  },
  {
    id: "sdd-bone-straight-bob-bangs",
    name: "SDD Bone Straight Bob Wig with Bangs",
    description: "100% Raw Human Hair · Super Double Drawn · Bob · Bangs",
    priceCents: 23_000,
    imageSrc: "/products/sdd-bone-straight-bob-bangs-a.jpeg",
    imageAlt:
      "Sleek natural black bone straight bob wig with full bangs, fine center parting and glossy ends",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '6"', priceCents: 23_000 },
      { length: '8"', priceCents: 25_000 },
    ],
  },
  {
    id: "sdd-jerry-curl-wig",
    name: "SDD Jerry Curl Lace Front Wig",
    description: "100% Raw Human Hair · Super Double Drawn · Jerry Curl",
    priceCents: 25_000,
    imageSrc: "/products/sdd-jerry-curl-a.jpeg",
    imageAlt:
      "Voluminous natural black jerry curl lace front wig with a defined kinky-curly texture on a styling mannequin",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '18"', priceCents: 25_000 },
      { length: '20"', priceCents: 28_000 },
    ],
  },
  {
    id: "sdd-yaki-hair",
    name: "SDD Yaki Hair Lace Front Wig",
    description: "100% Human Hair · Super Double Drawn · Yaki Texture",
    priceCents: 28_000,
    imageSrc: "/products/sdd-yaki-hair-a.jpeg",
    imageAlt:
      "Natural black SDD yaki-textured lace front wig with soft body waves on a styling mannequin",
    badge: { tone: "secondary", label: "Luxury" },
    lengthOptions: [
      { length: '20"', priceCents: 28_000 },
      { length: '22"', priceCents: 32_000 },
      { length: '24"', priceCents: 36_000 },
      { length: '26"', priceCents: 42_000 },
      { length: '28"', priceCents: 47_000 },
    ],
  },
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

export const ACCESSORIES: CartProduct[] = [];
