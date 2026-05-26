// Re-tag every product in the DB so its `type` is a hair_type slug (not a
// descriptive label) and its `category` matches the product's nature. Adds
// any missing hair_type slugs first. Safe to re-run.
//
// Usage:
//   node scripts/retag-products.mjs

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

const client = new MongoClient(process.env.MONGO_DB_URL, {
  serverSelectionTimeoutMS: 15000,
});
await client.connect();
const db = client.db(process.env.MONGO_DB_NAME ?? "adiconcollections");

const typeColl = db.collection("hair_types");
const prodColl = db.collection("products");

// Hair types we want to ensure exist. The existing rows include bone-straight,
// jerry-curl, body-wave, deep-wave, kinky-curly, loose-wave, closure-4x4,
// frontal-13x4. We add three more so every product description has a slug.
const TYPES_TO_ADD = [
  { slug: "yaki", label: "Yaki", category: "wigs" },
  { slug: "kinky-straight", label: "Kinky Straight", category: "wigs" },
  { slug: "curl", label: "Curl", category: "frontals-and-closures" },
];

for (const t of TYPES_TO_ADD) {
  const existing = await typeColl.findOne({ slug: t.slug });
  if (existing) {
    console.log(`hair_type "${t.slug}" already exists`);
    continue;
  }
  const now = new Date().toISOString();
  await typeColl.insertOne({
    id: randomUUID(),
    slug: t.slug,
    label: t.label,
    category: t.category,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Inserted hair_type "${t.slug}"`);
}

// Re-tag every product. `name` is the match key — these are exact strings of
// what's currently in the DB.
const RETAG = [
  {
    name: '13x4 Transparent Lace Jerry Curl Wig (22" Natural Black)',
    category: "wigs",
    type: "jerry-curl",
  },
  {
    name: "5x5 HD Lace Bone Straight Wig (Ombre Brown)",
    category: "wigs",
    type: "bone-straight",
  },
  {
    name: '5x5 HD Lace Bone Straight Wig (28" Ombre Burgundy)',
    category: "wigs",
    type: "bone-straight",
  },
  {
    name: '4x4 HD Lace Bone Straight Wig with Bangs (12" Ombre Purple)',
    category: "bangs",
    type: "bone-straight",
  },
  {
    name: '4x4 HD Lace Bone Straight Wig with Bangs (12" Brown)',
    category: "bangs",
    type: "bone-straight",
  },
  {
    name: '7x5 HD Lace Bone Straight Glueless Wig (28" Ombré)',
    category: "wigs",
    type: "bone-straight",
  },
  { name: "SDD Yaki Hair Wig", category: "wigs", type: "yaki" },
  { name: "SDD Jerry Curl Wig", category: "wigs", type: "jerry-curl" },
  {
    name: "Super Double Drawn Bone Straight Bob Wig",
    category: "wigs",
    type: "bone-straight",
  },
  {
    name: "Super Double Drawn Bone Straight Bob Wig with Bangs",
    category: "bangs",
    type: "bone-straight",
  },
  {
    name: "5x5 HD Lace Body Wave Closure",
    category: "frontals-and-closures",
    type: "body-wave",
  },
  {
    name: "5x5 HD Lace Straight Closure",
    category: "frontals-and-closures",
    type: "bone-straight",
  },
  {
    name: "5x5 HD Lace Kinky Straight Closure",
    category: "frontals-and-closures",
    type: "kinky-straight",
  },
  {
    name: "13x5 HD Lace Straight Frontal",
    category: "frontals-and-closures",
    type: "bone-straight",
  },
  {
    name: "13x5 HD Lace Curl Frontal",
    category: "frontals-and-closures",
    type: "curl",
  },
];

const now = new Date().toISOString();
for (const r of RETAG) {
  const result = await prodColl.updateOne(
    { name: r.name },
    { $set: { category: r.category, type: r.type, updatedAt: now } },
  );
  if (result.matchedCount === 0) {
    console.warn(`SKIP — no product named "${r.name}"`);
  } else {
    console.log(
      `Retagged "${r.name}" → category=${r.category}, type=${r.type}`,
    );
  }
}

await client.close();
