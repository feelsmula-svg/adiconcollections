// Diagnostic: confirm admin order-email delivery end-to-end.
// Reads .env.local, lists the approved-admin recipients from Mongo, and sends
// ONE real test email to the SMTP account itself.
//
// Run from the project root:   node scripts/check-email-delivery.mjs
// (Reads prod Mongo read-only + sends one email to your own SMTP_USER.)

import fs from "node:fs";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

// 1) Who would receive the "someone purchased an item" email?
const client = new MongoClient(env.MONGO_DB_URL, {
  serverSelectionTimeoutMS: 15000,
});
try {
  await client.connect();
  const db = client.db(env.MONGO_DB_NAME);
  const approved = await db
    .collection("users")
    .find({ role: "admin", adminStatus: "approved" })
    .toArray();
  const recipients = approved.map((a) => a.email).filter(Boolean);
  console.log(
    `approved admins: ${approved.length} | with a valid email: ${recipients.length}`,
  );
  for (const a of approved) {
    console.log(`  - ${a.email} | status: ${a.adminStatus}`);
  }
  const all = await db.collection("users").find({ role: "admin" }).toArray();
  console.log(`ALL role=admin (incl. non-approved): ${all.length}`);
  for (const a of all) {
    console.log(`    * ${a.email} | status: ${a.adminStatus ?? "(none)"}`);
  }
  if (recipients.length === 0) {
    console.log(
      "\n>>> No approved admin has a valid email — notifyAdmins sends to nobody.",
    );
  }
} catch (e) {
  console.log("mongo error:", e.message);
} finally {
  await client.close();
}

// 2) Real end-to-end send test (to your own SMTP account).
if (!env.SMTP_USER || !env.SMTP_PASS) {
  console.log(
    "\nSMTP_USER/SMTP_PASS not set in .env.local — sendEmail would be log-only here.",
  );
} else {
  const t = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: (env.SMTP_SECURE ?? "true") !== "false",
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  try {
    const info = await t.sendMail({
      from: env.NOTIFICATION_FROM_EMAIL ?? env.SMTP_USER,
      to: env.SMTP_USER,
      subject: "[AdiCon delivery test] admin purchase email path",
      text: "If you received this, SMTP delivery from this environment works end-to-end.",
    });
    console.log(
      `\nSEND OK ✅  messageId: ${info.messageId}\n  accepted: ${JSON.stringify(info.accepted)}\n  rejected: ${JSON.stringify(info.rejected)}`,
    );
  } catch (e) {
    console.log(`\nSEND FAILED ❌  ${e.code ?? ""} ${e.message}`);
  }
}
