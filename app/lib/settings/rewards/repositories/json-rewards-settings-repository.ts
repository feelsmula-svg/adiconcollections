import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { RewardsSettingsRepository } from "../rewards-settings-repository";
import {
  DEFAULT_REWARDS_SETTINGS,
  type RewardsSettings,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "rewards-settings.json");

export class JsonRewardsSettingsRepository
  implements RewardsSettingsRepository
{
  private mutex: Promise<void> = Promise.resolve();

  async get(): Promise<RewardsSettings> {
    return this.withLock(async () => readFile());
  }

  async update(
    input: Omit<RewardsSettings, "updatedAt">,
  ): Promise<RewardsSettings> {
    return this.withLock(async () => {
      const next: RewardsSettings = {
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

async function readFile(): Promise<RewardsSettings> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<RewardsSettings>;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_REWARDS_SETTINGS;
    }
    return {
      enabled: parsed.enabled ?? DEFAULT_REWARDS_SETTINGS.enabled,
      displayToCustomers:
        parsed.displayToCustomers ??
        DEFAULT_REWARDS_SETTINGS.displayToCustomers,
      pointsPerDollar:
        typeof parsed.pointsPerDollar === "number"
          ? parsed.pointsPerDollar
          : DEFAULT_REWARDS_SETTINGS.pointsPerDollar,
      tiers: Array.isArray(parsed.tiers)
        ? parsed.tiers
        : DEFAULT_REWARDS_SETTINGS.tiers,
      updatedAt: parsed.updatedAt ?? DEFAULT_REWARDS_SETTINGS.updatedAt,
    };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return DEFAULT_REWARDS_SETTINGS;
    }
    throw error;
  }
}

async function writeFile(data: RewardsSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
