import "server-only";

import type { AddressInput, AddressRecord } from "./types";

export interface AddressRepository {
  listForUser(userId: string): Promise<AddressRecord[]>;
  findById(id: string, userId: string): Promise<AddressRecord | null>;
  create(userId: string, input: AddressInput): Promise<AddressRecord>;
  update(
    id: string,
    userId: string,
    input: AddressInput,
  ): Promise<AddressRecord | null>;
  delete(id: string, userId: string): Promise<boolean>;
}

let repoPromise: Promise<AddressRepository> | null = null;

export async function getAddressRepository(): Promise<AddressRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoAddressRepository } = await import(
          "./repositories/mongo-address-repository"
        );
        return new MongoAddressRepository();
      }
      const { JsonAddressRepository } = await import(
        "./repositories/json-address-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[addresses] JsonAddressRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonAddressRepository();
    })();
  }
  return repoPromise;
}
