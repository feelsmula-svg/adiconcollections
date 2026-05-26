// Dump categories, hair_types, and current product (id/name/category/type) so
// we can decide the correct slug for each product.
//
// Usage:
//   node scripts/list-hair-types-and-products.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
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
  )
    value = value.slice(1, -1);
  if (!(key in process.env)) process.env[key] = value;
}

const client = new MongoClient(process.env.MONGO_DB_URL, {
  serverSelectionTimeoutMS: 15000,
});
await client.connect();
const db = client.db(process.env.MONGO_DB_NAME ?? "adiconcollections");

console.log("\n=== categories ===");
const cats = await db.collection("categories").find({}).toArray();
console.table(cats.map((c) => ({ id: c.id, slug: c.slug, label: c.label })));

console.log("\n=== hair_types ===");
const types = await db.collection("hair_types").find({}).toArray();
console.table(
  types.map((t) => ({
    id: t.id,
    slug: t.slug,
    label: t.label,
    category: t.category ?? t.categorySlug ?? t.parentSlug,
  })),
);

console.log("\n=== products ===");
const products = await db.collection("products").find({}).toArray();
console.table(
  products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    type: p.type,
    description: p.description,
  })),
);

await client.close();
