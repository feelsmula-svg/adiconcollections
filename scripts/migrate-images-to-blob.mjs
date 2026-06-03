/**
 * One-time migration: convert base64 imageUrl/images fields in MongoDB
 * to Vercel Blob CDN URLs.
 *
 * Usage:
 *   MONGO_DB_URL=<uri> BLOB_READ_WRITE_TOKEN=<token> node scripts/migrate-images-to-blob.mjs
 *
 * Safe to re-run — products that already have https:// URLs are skipped.
 */

import { put } from "@vercel/blob";
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";

if (!MONGO_URI) {
  console.error("Set MONGO_DB_URL before running this script.");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Set BLOB_READ_WRITE_TOKEN before running this script.");
  process.exit(1);
}

function isBase64(value) {
  return typeof value === "string" && /^data:image\//i.test(value);
}

async function uploadBase64(base64DataUrl, filename) {
  const match = base64DataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/i);
  if (!match) throw new Error("Not a valid base64 data URL");
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const ext = mimeType.split("/")[1] ?? "jpg";
  const blob = await put(`products/${filename}.${ext}`, buffer, {
    access: "public",
    contentType: mimeType,
  });
  return blob.url;
}

const client = new MongoClient(MONGO_URI, { appName: "migrate-images" });
await client.connect();
const db = client.db(DB_NAME);
const coll = db.collection("products");

const products = await coll.find({}).toArray();
console.log(`Found ${products.length} products.`);

let migrated = 0;
let skipped = 0;

for (const product of products) {
  const updates = {};
  const id = product.id ?? product._id.toString();

  // Migrate primary imageUrl
  if (isBase64(product.imageUrl)) {
    console.log(`  Uploading imageUrl for "${product.name}"...`);
    updates.imageUrl = await uploadBase64(product.imageUrl, `${id}-primary`);
  }

  // Migrate images gallery
  if (Array.isArray(product.images)) {
    const newImages = [];
    let changed = false;
    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i];
      if (isBase64(img)) {
        console.log(`  Uploading image[${i}] for "${product.name}"...`);
        newImages.push(await uploadBase64(img, `${id}-${i}`));
        changed = true;
      } else {
        newImages.push(img);
      }
    }
    if (changed) updates.images = newImages;
  }

  if (Object.keys(updates).length > 0) {
    await coll.updateOne({ _id: product._id }, { $set: updates });
    console.log(`  ✓ Migrated "${product.name}"`);
    migrated++;
  } else {
    skipped++;
  }
}

await client.close();
console.log(`\nDone. Migrated: ${migrated}, Already on CDN (skipped): ${skipped}`);
