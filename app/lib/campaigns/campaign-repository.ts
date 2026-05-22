import "server-only";

import type { Campaign } from "./types";

export interface CreateCampaignInput
  extends Omit<Campaign, "id" | "createdAt" | "updatedAt"> {}

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export interface CampaignRepository {
  list(): Promise<Campaign[]>;
  listActive(now?: Date): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign | null>;
  findByPromoCode(code: string, now?: Date): Promise<Campaign | null>;
  create(input: CreateCampaignInput): Promise<Campaign>;
  update(id: string, input: UpdateCampaignInput): Promise<Campaign | null>;
  delete(id: string): Promise<boolean>;
}

let repoPromise: Promise<CampaignRepository> | null = null;

export async function getCampaignRepository(): Promise<CampaignRepository> {
  if (!repoPromise) {
    repoPromise = (async () => {
      if (process.env.MONGO_DB_URL) {
        const { MongoCampaignRepository } = await import(
          "./repositories/mongo-campaign-repository"
        );
        return new MongoCampaignRepository();
      }
      const { JsonCampaignRepository } = await import(
        "./repositories/json-campaign-repository"
      );
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[campaigns] JsonCampaignRepository is DEV-ONLY. Set MONGO_DB_URL to use the Mongo-backed repository.",
        );
      }
      return new JsonCampaignRepository();
    })();
  }
  return repoPromise;
}
