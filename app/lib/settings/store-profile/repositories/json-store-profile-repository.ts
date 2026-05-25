import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { StoreProfileRepository } from "../store-profile-repository";
import {
  DEFAULT_STORE_PROFILE_SETTINGS,
  type StoreProfileSettings,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "store-profile.json");

export class JsonStoreProfileRepository implements StoreProfileRepository {
  private mutex: Promise<void> = Promise.resolve();

  async get(): Promise<StoreProfileSettings> {
    return this.withLock(async () => readFile());
  }

  async update(
    input: Omit<StoreProfileSettings, "updatedAt">,
  ): Promise<StoreProfileSettings> {
    return this.withLock(async () => {
      const next: StoreProfileSettings = {
        ...input,
        updatedAt: new Date().toISOString(),
      };
      await writeFile(next);
      return next;
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

async function readFile(): Promise<StoreProfileSettings> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreProfileSettings>;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_STORE_PROFILE_SETTINGS;
    }
    return {
      brandName:
        typeof parsed.brandName === "string" && parsed.brandName.trim()
          ? parsed.brandName
          : DEFAULT_STORE_PROFILE_SETTINGS.brandName,
      supportEmail:
        typeof parsed.supportEmail === "string" && parsed.supportEmail.trim()
          ? parsed.supportEmail
          : DEFAULT_STORE_PROFILE_SETTINGS.supportEmail,
      currency:
        typeof parsed.currency === "string" && parsed.currency.trim()
          ? parsed.currency.toUpperCase()
          : DEFAULT_STORE_PROFILE_SETTINGS.currency,
      updatedAt: parsed.updatedAt ?? DEFAULT_STORE_PROFILE_SETTINGS.updatedAt,
    };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return DEFAULT_STORE_PROFILE_SETTINGS;
    }
    throw error;
  }
}

async function writeFile(data: StoreProfileSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
