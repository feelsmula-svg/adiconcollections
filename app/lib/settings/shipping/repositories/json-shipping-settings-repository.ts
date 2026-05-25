import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { ShippingSettingsRepository } from "../shipping-settings-repository";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingMethodConfig,
  type ShippingSettings,
} from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "shipping-settings.json");

export class JsonShippingSettingsRepository
  implements ShippingSettingsRepository
{
  private mutex: Promise<void> = Promise.resolve();

  async get(): Promise<ShippingSettings> {
    return this.withLock(async () => readFile());
  }

  async update(
    input: Omit<ShippingSettings, "updatedAt">,
  ): Promise<ShippingSettings> {
    return this.withLock(async () => {
      const next: ShippingSettings = {
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

function mergeMethod(
  partial: Partial<ShippingMethodConfig> | undefined,
  fallback: ShippingMethodConfig,
): ShippingMethodConfig {
  return {
    label: partial?.label ?? fallback.label,
    description: partial?.description ?? fallback.description,
    priceCents:
      typeof partial?.priceCents === "number"
        ? partial.priceCents
        : fallback.priceCents,
  };
}

async function readFile(): Promise<ShippingSettings> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<ShippingSettings>;
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_SHIPPING_SETTINGS;
    }
    return {
      sameDay: mergeMethod(parsed.sameDay, DEFAULT_SHIPPING_SETTINGS.sameDay),
      standard: mergeMethod(
        parsed.standard,
        DEFAULT_SHIPPING_SETTINGS.standard,
      ),
      taxRate:
        typeof parsed.taxRate === "number"
          ? parsed.taxRate
          : DEFAULT_SHIPPING_SETTINGS.taxRate,
      updatedAt: parsed.updatedAt ?? DEFAULT_SHIPPING_SETTINGS.updatedAt,
    };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return DEFAULT_SHIPPING_SETTINGS;
    }
    throw error;
  }
}

async function writeFile(data: ShippingSettings): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}
