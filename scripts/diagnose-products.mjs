// Diagnose visible-product state in MongoDB. Reports total count, per-category
// counts, featured status, the configured DB host/name, and whether the
// `categories` collection has the slugs each product references.
//
// Usage:
//   node scripts/diagnose-products.mjs
//
// Requires MONGO_DB_URL (and optionally MONGO_DB_NAME) in .env.local.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = path.join(ROOT, ".env.local");

const raw = await fs.readFile(ENV_FILE, "utf8");
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  if (!(key in process.env)) process.env[key] = value;
}

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";
if (!URI) {
  console.error("MONGO_DB_URL is not set.");
  process.exit(1);
}

function redact(uri) {
  try {
    const u = new URL(uri);
    return `${u.protocol}//${u.username ? "***@" : ""}${u.host}${u.pathname}`;
  } catch {
    return "(unparseable)";
  }
}

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
await client.connect();
const db = client.db(DB_NAME);

console.log(`Connected to: ${redact(URI)}  (db = "${DB_NAME}")`);

const products = await db.collection("products").find({}).toArray();
console.log(`\nProducts in DB: ${products.length}`);
console.table(
  products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    featured: !!p.featured,
    stock: p.stock,
    images: Array.isArray(p.images) ? p.images.length : p.imageUrl ? 1 : 0,
  })),
);

const categories = await db.collection("categories").find({}).toArray();
console.log(
  `\nCategory slugs in DB: ${categories.map((c) => c.slug ?? c.id).join(", ") || "(none)"}`,
);

const referencedCategories = [...new Set(products.map((p) => p.category))];
const missing = referencedCategories.filter(
  (slug) => !categories.some((c) => c.slug === slug),
);
console.log(
  `Products reference: ${referencedCategories.join(", ") || "(none)"}` +
    (missing.length ? ` — missing in 'categories': ${missing.join(", ")}` : " — all present"),
);

console.log(`\nFeatured products: ${products.filter((p) => p.featured).length}`);
console.log(
  "Home page (/) shows only featured products. Set featured=true if you want them on the homepage.",
);

await client.close();
