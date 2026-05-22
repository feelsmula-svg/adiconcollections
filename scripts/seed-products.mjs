// Seed data/products.json with all storefront products, embedding each image as a base64 data URL.
// Run with:  node scripts/seed-products.mjs
//
// Regenerate this whenever catalog content or images change. The script is idempotent — it
// rewrites data/products.json from scratch using the SEEDS array below.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_FILE = path.join(ROOT, "data", "products.json");
const STOCK_FILE = path.join(ROOT, "data", "seed-stock.json");

const SEEDS = [
  {
    id: "hd-curl-frontal-13x5",
    name: "13x5 HD Lace Curl Frontal",
    description: "100% Raw Vietnamese Single Donor Hair · Curl Tips",
    category: "frontals-and-closures",
    type: "HD Lace Frontal · Curl Tips",
    priceCents: 8_500,
    imagePath: "/products/hd-curl-frontal-13x5-a.jpeg",
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
    category: "frontals-and-closures",
    type: "HD Lace Frontal · Bone Straight",
    priceCents: 8_000,
    imagePath: "/products/hd-straight-frontal-13x5-a.jpeg",
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
    category: "frontals-and-closures",
    type: "HD Lace Closure · Kinky Straight",
    priceCents: 7_000,
    imagePath: "/products/hd-kinky-straight-closure-5x5-a.jpeg",
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
    category: "frontals-and-closures",
    type: "HD Lace Closure · Bone Straight",
    priceCents: 7_000,
    imagePath: "/products/hd-straight-closure-5x5-a.jpeg",
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
    category: "frontals-and-closures",
    type: "HD Lace Closure · Body Wave",
    priceCents: 7_000,
    imagePath: "/products/hd-body-wave-closure-5x5-a.jpeg",
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
    category: "wigs",
    type: "Bone Straight Bob · Bangs",
    priceCents: 23_000,
    imagePath: "/products/sdd-bone-straight-bob-bangs-a.jpeg",
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
    category: "wigs",
    type: "Jerry Curl · Lace Front",
    priceCents: 25_000,
    imagePath: "/products/sdd-jerry-curl-a.jpeg",
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
    category: "wigs",
    type: "Yaki Texture · Lace Front",
    priceCents: 28_000,
    imagePath: "/products/sdd-yaki-hair-a.jpeg",
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
    category: "wigs",
    type: "Bone Straight · Ombre Brown",
    priceCents: 72_500,
    imagePath: "/products/super-double-drawn-32-ombre-a.jpeg",
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
    category: "wigs",
    type: "Bone Straight · Ombre Burgundy",
    priceCents: 65_500,
    imagePath: "/products/super-double-drawn-28-burgundy-a.jpeg",
    badge: { tone: "secondary", label: "Luxury" },
  },
  {
    id: "jerry-curl-13x4-22",
    name: '13x4 Transparent Lace Jerry Curl (22")',
    description: "Super Double Drawn · Natural Black",
    category: "wigs",
    type: "Jerry Curl · 13x4 Transparent Lace",
    priceCents: 30_000,
    imagePath: "/products/jerry-curl-22-a.jpeg",
  },
  {
    id: "bone-straight-ombre-purple-12",
    name: '4x4 HD Lace Bone Straight Wig with Bangs (12" Ombre Purple)',
    description: "Raw Hair · Super Double Drawn · Bangs",
    category: "wigs",
    type: "Bone Straight · Ombre Purple · Bangs",
    priceCents: 30_000,
    imagePath: "/products/bone-straight-ombre-purple-12-a.jpeg",
    badge: { tone: "secondary", label: "Luxury" },
  },
  {
    id: "bone-straight-brown-12",
    name: '4x4 HD Lace Bone Straight Wig with Bangs (12" Brown)',
    description: "Raw Hair · Super Double Drawn · Bangs",
    category: "wigs",
    type: "Bone Straight · Brown · Bangs",
    priceCents: 30_000,
    imagePath: "/products/bone-straight-brown-12-a.jpeg",
    badge: { tone: "secondary", label: "Luxury" },
  },
];

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function toDataUrl(publicPath) {
  const abs = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ""));
  const buf = await fs.readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) throw new Error(`Unsupported image extension: ${ext} (${abs})`);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function loadStock() {
  try {
    const raw = await fs.readFile(STOCK_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed?.stock ?? {};
  } catch {
    return {};
  }
}

async function main() {
  const stockMap = await loadStock();
  const now = new Date().toISOString();
  const products = [];

  for (const seed of SEEDS) {
    const imageUrl = await toDataUrl(seed.imagePath);
    products.push({
      id: seed.id,
      name: seed.name,
      description: seed.description,
      category: seed.category,
      type: seed.type,
      priceCents: seed.priceCents,
      imageUrl,
      stock: stockMap[seed.id] ?? 10,
      featured: true,
      badge: seed.badge,
      lengthOptions: seed.lengthOptions,
      createdAt: now,
      updatedAt: now,
    });
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ products }, null, 2), "utf8");
  const bytes = (await fs.stat(DATA_FILE)).size;
  console.log(
    `Seeded ${products.length} products to ${path.relative(ROOT, DATA_FILE)} (${(bytes / 1024).toFixed(1)} KB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
