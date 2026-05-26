// Print the full shape of a product by name (without dumping the base64 blob).
// Usage: node scripts/inspect-product.mjs "<product name>"

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

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/inspect-product.mjs "<product name>"');
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_DB_URL);
await client.connect();
const db = client.db(process.env.MONGO_DB_NAME ?? "adiconcollections");
const p = await db.collection("products").findOne({ name });
if (!p) {
  console.error("No product matches:", name);
  await client.close();
  process.exit(1);
}

const summary = {
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  type: p.type,
  priceCents: p.priceCents,
  stock: p.stock,
  featured: p.featured,
  badge: p.badge,
  lengthOptions: p.lengthOptions ?? null,
  imageUrlBytes: p.imageUrl?.length ?? 0,
  imageUrlKind: p.imageUrl?.startsWith("data:")
    ? "data-url"
    : p.imageUrl?.startsWith("/")
      ? "public-path"
      : "url",
  imagesCount: Array.isArray(p.images) ? p.images.length : 0,
  imagesBytes: Array.isArray(p.images) ? p.images.map((s) => s.length) : [],
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
};
console.log(JSON.stringify(summary, null, 2));

await client.close();
