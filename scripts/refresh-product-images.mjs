// Re-read a product's image files from public/ and refresh the base64 data
// URLs stored on the matching MongoDB document. Use when the public image
// file changes but the embedded base64 in the DB is stale.
//
// Usage:
//   node scripts/refresh-product-images.mjs "<product name>" <publicPath1> [publicPath2 ...]

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");

await loadEnv(path.join(ROOT, ".env.local"));

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";

const [, , productName, ...publicPaths] = process.argv;
if (!productName || publicPaths.length === 0) {
  console.error(
    'Usage: node scripts/refresh-product-images.mjs "<name>" <publicPath> [publicPath2 ...]',
  );
  process.exit(1);
}

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

const images = await Promise.all(publicPaths.map(toDataUrl));

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
await client.connect();
const db = client.db(DB_NAME);
const coll = db.collection("products");
const result = await coll.updateOne(
  { name: productName },
  {
    $set: {
      imageUrl: images[0],
      images,
      updatedAt: new Date().toISOString(),
    },
  },
);
if (result.matchedCount === 0) {
  console.error(`No product matched name="${productName}"`);
  process.exit(1);
}
console.log(
  `Refreshed ${images.length} image(s) on "${productName}" (modified=${result.modifiedCount})`,
);
await client.close();
