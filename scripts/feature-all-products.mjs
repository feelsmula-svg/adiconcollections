// Flip every product in the DB to featured=true so they appear on the home
// page grid (which filters by `featured`).
//
// Usage:
//   node scripts/feature-all-products.mjs
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

const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
await client.connect();
const db = client.db(DB_NAME);

const result = await db.collection("products").updateMany(
  { featured: { $ne: true } },
  { $set: { featured: true, updatedAt: new Date().toISOString() } },
);
console.log(`Updated ${result.modifiedCount} product(s) → featured=true`);

await client.close();
