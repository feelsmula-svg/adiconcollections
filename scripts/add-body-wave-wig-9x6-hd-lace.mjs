// Insert the Body Wave Wig 9x6 HD Lace into MongoDB.
// Length variants: 16" $520, 18" $550. Color: dark brown with a touch of honey
// gold. Images embedded as base64 data URLs. Categorized under "wigs".
// Idempotent — skips if a product with the same `name` already exists.
//
// Usage:
//   node scripts/add-body-wave-wig-9x6-hd-lace.mjs

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");

await loadEnv(path.join(ROOT, ".env.local"));
await loadEnv(path.join(ROOT, ".env"));

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";

if (!URI) {
  console.error("MONGO_DB_URL is not set. Add it to .env and retry.");
  process.exit(1);
}

const PRODUCT = {
  name: "Body Wave Wig 9x6 HD Lace",
  description:
    "100% Raw Human Hair · 9x6 HD Lace · Body Wave · Color: Dark Brown with a Touch of Honey Gold. Shipping $44 · Duty fee $23 · Total $472.",
  category: "wigs",
  type: "body-wave",
  priceCents: 52_000,
  imagePaths: [
    "/products/body-wave-wig-9x6-hd-lace-a.jpeg",
    "/products/body-wave-wig-9x6-hd-lace-b.jpeg",
    "/products/body-wave-wig-9x6-hd-lace-c.jpeg",
  ],
  stock: 10,
  featured: true,
  badge: { tone: "secondary", label: "Luxury" },
  lengthOptions: [
    { length: '16"', priceCents: 52_000 },
    { length: '18"', priceCents: 55_000 },
  ],
};

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function loadEnv(file) {
  try {
    const raw = await fs.readFile(file, "utf8");
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
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function toDataUrl(publicPath) {
  const abs = path.join(PUBLIC_DIR, publicPath.replace(/^\//, ""));
  const buf = await fs.readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) throw new Error(`Unsupported image extension: ${ext} (${abs})`);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function main() {
  const client = new MongoClient(URI, {
    appName: "adiconcollections-add-product",
    serverSelectionTimeoutMS: 15000,
  });
  console.log(`Connecting to MongoDB (${DB_NAME})...`);
  await client.connect();
  try {
    const db = client.db(DB_NAME);
    const coll = db.collection("products");
    await coll.createIndex({ id: 1 }, { unique: true });

    const existing = await coll.findOne({ name: PRODUCT.name });
    if (existing) {
      console.log(
        `Skipped — a product named "${PRODUCT.name}" already exists (id=${existing.id}).`,
      );
      return;
    }

    const images = await Promise.all(PRODUCT.imagePaths.map(toDataUrl));
    const now = new Date().toISOString();
    const record = {
      id: randomUUID(),
      name: PRODUCT.name,
      description: PRODUCT.description,
      category: PRODUCT.category,
      type: PRODUCT.type,
      priceCents: PRODUCT.priceCents,
      imageUrl: images[0],
      images,
      stock: PRODUCT.stock,
      featured: PRODUCT.featured,
      badge: PRODUCT.badge,
      lengthOptions: PRODUCT.lengthOptions,
      createdAt: now,
      updatedAt: now,
    };

    await coll.insertOne(record);
    console.log(
      `Inserted "${PRODUCT.name}" with ${images.length} image(s) and ${PRODUCT.lengthOptions.length} length variant(s) (id=${record.id}).`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
