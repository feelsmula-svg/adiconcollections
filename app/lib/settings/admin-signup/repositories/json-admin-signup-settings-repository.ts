import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { AdminSignupSettingsRepository } from "../repository";
import {
  DEFAULT_ADMIN_SIGNUP_SETTINGS,
  type AdminSignupSettings,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "admin-signup-settings.json");

export class JsonAdminSignupSettingsRepository
  implements AdminSignupSettingsRepository
{
  private mutex: Promise<void> = Promise.resolve();

  async get(): Promise<AdminSignupSettings> {
    return this.withLock(async () => readFile());
  }

  async update(
    input: Omit<AdminSignupSettings, "updatedAt">,
  ): Promise<AdminSignupSettings> {
    return this.withLock(async () => {
      const next: AdminSignupSettings = {
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

async function readFile(): Promise<AdminSignupSettings> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AdminSignupSettings>;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_ADMIN_SIGNUP_SETTINGS;
    }
    return {
      enabled: parsed.enabled ?? DEFAULT_ADMIN_SIGNUP_SETTINGS.enabled,
      inviteCode:
        parsed.inviteCode ?? DEFAULT_ADMIN_SIGNUP_SETTINGS.inviteCode,
      updatedAt: parsed.updatedAt ?? DEFAULT_ADMIN_SIGNUP_SETTINGS.updatedAt,
    };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return DEFAULT_ADMIN_SIGNUP_SETTINGS;
    }
    throw error;
  }
}

async function writeFile(data: AdminSignupSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
