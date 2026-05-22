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
  const value = trimmed.slice(eq + 1).trim();
  if (!(key in process.env)) process.env[key] = value;
}

const client = new MongoClient(process.env.MONGO_DB_URL, {
  serverSelectionTimeoutMS: 15000,
});
await client.connect();
const db = client.db(process.env.MONGO_DB_NAME ?? "adiconcollections");

const collections = ["products", "users", "password_resets", "categories", "hair_types", "orders"];
const rows = [];
for (const name of collections) {
  rows.push({ collection: name, count: await db.collection(name).countDocuments() });
}
console.table(rows);

const sample = await db.collection("products").findOne({ id: "hd-curl-frontal-13x5" });
console.log("Sample product:", {
  id: sample.id,
  name: sample.name,
  hasBase64: sample.imageUrl?.startsWith("data:image/"),
  imageSize: `${(sample.imageUrl?.length / 1024).toFixed(1)} KB`,
  lengthOptions: sample.lengthOptions?.length,
  badge: sample.badge,
});

await client.close();
