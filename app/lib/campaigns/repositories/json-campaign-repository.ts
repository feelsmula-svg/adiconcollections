import "server-only";

// DEV ONLY — single-process JSON-backed campaign store.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CampaignRepository,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "../campaign-repository";
import { isCampaignLive, type Campaign } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "campaigns.json");

interface FileShape {
  campaigns: Campaign[];
}

export class JsonCampaignRepository implements CampaignRepository {
  private mutex: Promise<void> = Promise.resolve();

  async list(): Promise<Campaign[]> {
    return this.withLock(async () => {
      const data = await readFile();
      return [...data.campaigns].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1,
      );
    });
  }

  async listActive(now = new Date()): Promise<Campaign[]> {
    const all = await this.list();
    return all.filter((c) => isCampaignLive(c, now));
  }

  async findById(id: string): Promise<Campaign | null> {
    return this.withLock(async () => {
      const { campaigns } = await readFile();
      return campaigns.find((c) => c.id === id) ?? null;
    });
  }

  async findByPromoCode(
    code: string,
    now = new Date(),
  ): Promise<Campaign | null> {
    const normalised = code.trim().toUpperCase();
    if (normalised.length === 0) return null;
    const { campaigns } = await readFile();
    const match = campaigns.find(
      (c) => c.promoCode && c.promoCode.toUpperCase() === normalised,
    );
    if (!match) return null;
    return isCampaignLive(match, now) ? match : null;
  }

  async create(input: CreateCampaignInput): Promise<Campaign> {
    return this.withLock(async () => {
      const data = await readFile();
      const now = new Date().toISOString();
      const record: Campaign = {
        id: randomUUID(),
        ...input,
        promoCode: input.promoCode ? input.promoCode.toUpperCase() : undefined,
        createdAt: now,
        updatedAt: now,
      };
      data.campaigns.push(record);
      await writeFile(data);
      return record;
    });
  }

  async update(
    id: string,
    input: UpdateCampaignInput,
  ): Promise<Campaign | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.campaigns.findIndex((c) => c.id === id);
      if (index === -1) return null;
      const existing = data.campaigns[index];
      const updated: Campaign = {
        ...existing,
        ...input,
        promoCode: input.promoCode
          ? input.promoCode.toUpperCase()
          : input.promoCode === ""
            ? undefined
            : existing.promoCode,
        updatedAt: new Date().toISOString(),
      };
      data.campaigns[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await readFile();
      const before = data.campaigns.length;
      data.campaigns = data.campaigns.filter((c) => c.id !== id);
      const changed = data.campaigns.length !== before;
      if (changed) await writeFile(data);
      return changed;
    });
  }

  private withLock<T>(work: () => Promise<T>): Promise<T> {
    const previous = this.mutex;
    let release: () => void = () => {};
    this.mutex = new Promise<void>((resolve) => {
      release = resolve;
    });
    return previous.then(async () => {
      try {
        return await work();
      } finally {
        release();
      }
    });
  }
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.campaigns)) {
      return { campaigns: [] };
    }
    return { campaigns: parsed.campaigns as Campaign[] };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { campaigns: [] };
    }
    throw error;
  }
}

async function writeFile(data: FileShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
