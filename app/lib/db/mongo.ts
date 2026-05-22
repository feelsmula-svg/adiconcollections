import "server-only";

import { MongoClient, type Db } from "mongodb";

const URI = process.env.MONGO_DB_URL;
const DB_NAME = process.env.MONGO_DB_NAME ?? "adiconcollections";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function buildClient(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    appName: "adiconcollections",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  return client.connect();
}

function getClientPromise(): Promise<MongoClient> {
  if (!URI) {
    throw new Error(
      "MONGO_DB_URL is not set. Add it to .env.local before using a Mongo repository.",
    );
  }
  if (process.env.NODE_ENV === "development") {
    if (!globalThis.__mongoClientPromise) {
      globalThis.__mongoClientPromise = buildClient(URI);
    }
    return globalThis.__mongoClientPromise;
  }
  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = buildClient(URI);
  }
  return globalThis.__mongoClientPromise;
}

export function isMongoConfigured(): boolean {
  return typeof URI === "string" && URI.length > 0;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
