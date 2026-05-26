// Insert the 5x5 HD Lace Bone Straight Wig (28" Ombre Burgundy) into MongoDB.
// Single-length product — no lengthOptions. Image embedded as base64 data URL.
// Idempotent — skips if a product with the same `name` already exists.
//
// Usage:
//   node scripts/add-bone-straight-ombre-burgundy-28.mjs
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
  name: '5x5 HD Lace Bone Straight Wig (28" Ombre Burgundy)',
  description:
    "Raw Hair · Super Double Drawn · Ombre Burgundy · Bone Straight · 5x5 HD Lace Closure · 28 inches",
  category: "wigs",
  type: "Bone Straight · 5x5 HD Lace · Ombre Burgundy",
  priceCents: 65_500,
  imagePaths: ["/products/bone-straight-ombre-burgundy-28-a.jpeg"],
  stock: 10,
  featured: true,
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
