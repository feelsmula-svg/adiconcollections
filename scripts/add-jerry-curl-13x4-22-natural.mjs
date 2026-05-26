// Insert the "13x4 Transparent Lace Jerry Curl Wig (22\" Natural Black)" product
// into MongoDB. Idempotent — skips if a product with the same `name` already
// exists. Both images are embedded as base64 data URLs so the record is
// self-contained (same convention as scripts/seed-products.mjs).
//
// Usage:
//   node scripts/add-jerry-curl-13x4-22-natural.mjs
//
// Requires MONGO_DB_URL (and optionally MONGO_DB_NAME) in .env.local.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");

await loadEnv(path.join(ROOT, ".env.local"));

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";

if (!URI) {
  console.error("MONGO_DB_URL is not set. Add it to .env.local and retry.");
  process.exit(1);
}

const PRODUCT = {
  name: '13x4 Transparent Lace Jerry Curl Wig (22" Natural Black)',
  description: "Super double drawn · Natural black · 22 inches",
  category: "wigs",
  type: "Jerry Curl · 13x4 Transparent Lace",
  priceCents: 30_000,
  imagePaths: [
    "/products/jerry-curl-13x4-natural-a.jpeg",
    "/products/jerry-curl-13x4-natural-b.jpeg",
  ],
  stock: 10,
  featured: false,
  badge: { tone: "secondary", label: "Luxury" },
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
      createdAt: now,
      updatedAt: now,
    };

    await coll.insertOne(record);
    console.log(
      `Inserted "${PRODUCT.name}" with ${images.length} image(s) (id=${record.id}).`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
