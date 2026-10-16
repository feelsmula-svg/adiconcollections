// Insert the Cambodian Deep Wave 9x6 HD Lace Wig into MongoDB.
// Length variants: 20" $400, 22" $430, 24" $450, 26" $480. Images embedded as
// base64 data URLs. Categorized under "wigs". Idempotent — skips if a product
// with the same `name` already exists.
//
// Usage:
//   node scripts/add-cambodian-deep-wave.mjs

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
  name: "Cambodian Deep Wave 9x6 HD Lace Wig",
  description: "100% Cambodian Raw Hair · 9x6 HD Lace · Deep Wave",
  category: "wigs",
  type: "deep-wave",
  priceCents: 40_000,
  imagePaths: [
    "/products/cambodian-deep-wave-a.jpeg",
    "/products/cambodian-deep-wave-b.jpeg",
    "/products/cambodian-deep-wave-c.jpeg",
  ],
  stock: 10,
  featured: true,
  badge: { tone: "secondary", label: "Luxury" },
  lengthOptions: [
    { length: '20"', priceCents: 40_000 },
    { length: '22"', priceCents: 43_000 },
    { length: '24"', priceCents: 45_000 },
    { length: '26"', priceCents: 48_000 },
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
