// One-off: insert the mannequin-head accessories into the products collection
// as real, admin-editable products (NOT in-code seed). Idempotent — skips any
// product whose name already exists. Run from the project root:
//
//   node scripts/seed-accessories-to-db.mjs
//
// Reads MONGO_DB_URL / MONGO_DB_NAME from .env.local. Images are referenced by
// their /public path (already committed under public/products/), which the
// product schema accepts.

import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const now = new Date().toISOString();

// Embed images as base64 data URIs (self-contained, like admin-uploaded
// products) so they render on the live site without deploying public assets.
function dataUri(publicPath) {
  const buf = fs.readFileSync(`public${publicPath}`);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/** @param {object} p */
function record(p) {
  const img = dataUri(p.imagePublicPath);
  return {
    id: randomUUID(),
    name: p.name,
    description: p.description,
    category: "accessories",
    type: "",
    priceCents: p.priceCents,
    imageUrl: img,
    images: [img],
    stock: p.stock ?? 25,
    featured: false,
    badge: { tone: "secondary", label: "New" },
    ...(p.lengthOptions ? { lengthOptions: p.lengthOptions } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

const PRODUCTS = [
  record({
    name: "Wig Mannequin Head — Premium",
    description:
      "Salon-quality mannequin display head with shoulders and bust — ideal for styling, washing, and showcasing wigs. Lifelike face with a soft, pierceable finish. Pick your complexion by number to match the photo (Tone 1–7).",
    priceCents: 3500,
    imagePublicPath: "/products/mannequin-head-premium-a.jpeg",
    lengthOptions: Array.from({ length: 7 }, (_, i) => ({
      length: `Tone ${i + 1}`,
      priceCents: 3500,
    })),
  }),
  record({
    name: "Wig Mannequin Head — Classic",
    description:
      "Lightweight mannequin head with shoulders for displaying and storing wigs at home or in-store. Smooth, easy-to-clean finish. Pick your finish by number to match the photo.",
    priceCents: 2500,
    imagePublicPath: "/products/mannequin-head-classic-a.jpeg",
    lengthOptions: [
      "1 · A-White",
      "2 · A-Black",
      "3 · A-Brown",
      "4 · B-Beige",
      "5 · B-Black",
      "6 · B-Brown",
      "7 · C-Beige",
      "8 · C-Dark Brown",
      "9 · C-White",
      "10 · C-Brown",
    ].map((length) => ({ length, priceCents: 2500 })),
  }),
  record({
    name: "Mannequin Head Table Clamp",
    description:
      "Heavy-duty C-clamp that secures your mannequin head to a table or desk edge for hands-free styling. Adjustable screw mount fits standard mannequin posts and tabletops.",
    priceCents: 500,
    imagePublicPath: "/products/mannequin-table-clamp-a.jpeg",
  }),
];

const client = new MongoClient(env.MONGO_DB_URL, {
  serverSelectionTimeoutMS: 15000,
});
try {
  await client.connect();
  const coll = client.db(env.MONGO_DB_NAME).collection("products");
  await coll.createIndex({ id: 1 }, { unique: true });
  for (const doc of PRODUCTS) {
    const existing = await coll.findOne({ name: doc.name });
    if (existing) {
      console.log(`SKIP (already exists): ${doc.name}`);
      continue;
    }
    await coll.insertOne(doc);
    console.log(`INSERTED: ${doc.name} — $${(doc.priceCents / 100).toFixed(2)} (id: ${doc.id})`);
  }
  const total = await coll.countDocuments({ category: "accessories" });
  console.log(`\nDone. accessories in DB: ${total}`);
} catch (e) {
  console.log("ERROR:", e.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
