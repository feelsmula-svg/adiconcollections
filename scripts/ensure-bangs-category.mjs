// Ensure a "bangs" category exists in the categories collection. Idempotent.
//
// Usage:
//   node scripts/ensure-bangs-category.mjs
//
// Requires MONGO_DB_URL (and optionally MONGO_DB_NAME) in .env.local.

import { randomUUID } from "node:crypto";
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

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";
const client = new MongoClient(URI, { serverSelectionTimeoutMS: 15000 });
await client.connect();
const db = client.db(DB_NAME);
const coll = db.collection("categories");

// Inspect existing shape so we mirror it.
const sample = await coll.findOne({});
console.log("Existing category shape:", sample);

const existing = await coll.findOne({ slug: "bangs" });
if (existing) {
  console.log(`Skipped — "bangs" category already exists (id=${existing.id}).`);
} else {
  const now = new Date().toISOString();
  const record = {
    id: randomUUID(),
    slug: "bangs",
    label: "Bangs",
    createdAt: now,
    updatedAt: now,
  };
  // Copy any other fields seen on the sample (e.g. sortOrder, system) using
  // sensible defaults so we don't omit something the UI relies on.
  if (sample && typeof sample.sortOrder === "number") {
    record.sortOrder = sample.sortOrder + 1;
  }
  if (sample && typeof sample.system === "boolean") {
    record.system = false;
  }
  await coll.insertOne(record);
  console.log(`Inserted bangs category:`, record);
}

await client.close();
