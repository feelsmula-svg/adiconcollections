// One-time migration: read every data/*.json file and upsert its records into the
// matching MongoDB collection. Idempotent — re-running updates by id instead of
// inserting duplicates.
//
// Usage:
//   node scripts/migrate-json-to-mongo.mjs
//
// Requires MONGO_DB_URL (and optionally MONGO_DB_NAME) in .env.local.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MongoClient } from "mongodb";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");

await loadEnv(path.join(ROOT, ".env.local"));

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";

if (!URI) {
  console.error("MONGO_DB_URL is not set. Add it to .env.local and retry.");
  process.exit(1);
}

const MIGRATIONS = [
  {
    file: "products.json",
    key: "products",
    collection: "products",
    keyField: "id",
    indexes: [{ key: { id: 1 }, unique: true }],
  },
  {
    file: "users.json",
    key: "users",
    collection: "users",
    keyField: "id",
    indexes: [
      { key: { id: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
    ],
  },
  {
    file: "password-resets.json",
    key: "tokens",
    collection: "password_resets",
    keyField: "tokenHash",
    indexes: [{ key: { tokenHash: 1 }, unique: true }],
  },
  {
    file: "categories.json",
    key: "categories",
    collection: "categories",
    keyField: "id",
    indexes: [
      { key: { id: 1 }, unique: true },
      { key: { slug: 1 }, unique: true },
    ],
  },
  {
    file: "hair-types.json",
    key: "types",
    collection: "hair_types",
    keyField: "id",
    indexes: [
      { key: { id: 1 }, unique: true },
      { key: { slug: 1 }, unique: true },
    ],
  },
  {
    file: "orders.json",
    key: "orders",
    collection: "orders",
    keyField: "id",
    indexes: [{ key: { id: 1 }, unique: true }],
  },
];

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

async function readJson(file) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function ensureIndexes(coll, indexes) {
  for (const ix of indexes) {
    await coll.createIndex(ix.key, ix);
  }
}

async function migrate(client) {
  const db = client.db(DB_NAME);
  const summary = [];

  for (const m of MIGRATIONS) {
    const data = await readJson(m.file);
    if (!data || !Array.isArray(data[m.key])) {
      summary.push({ collection: m.collection, status: "skipped (no data)" });
      continue;
    }
    const records = data[m.key];
    if (records.length === 0) {
      summary.push({ collection: m.collection, status: "skipped (empty)" });
      continue;
    }

    const coll = db.collection(m.collection);
    await ensureIndexes(coll, m.indexes);

    const ops = records.map((record) => ({
      replaceOne: {
        filter: { [m.keyField]: record[m.keyField] },
        replacement: record,
        upsert: true,
      },
    }));

    const result = await coll.bulkWrite(ops, { ordered: false });
    summary.push({
      collection: m.collection,
      records: records.length,
      upserts: result.upsertedCount,
      modifies: result.modifiedCount,
      matches: result.matchedCount,
    });
  }

  return summary;
}

async function main() {
  const client = new MongoClient(URI, {
    appName: "adiconcollections-migrate",
    serverSelectionTimeoutMS: 15000,
  });
  console.log(`Connecting to MongoDB (${DB_NAME})...`);
  await client.connect();
  try {
    const summary = await migrate(client);
    console.table(summary);
    console.log("Migration complete.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
