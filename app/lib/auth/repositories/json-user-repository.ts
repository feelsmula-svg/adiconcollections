import "server-only";

// DEV ONLY — single-process, not safe across serverless invocations or multiple workers.
// Replace with a real database adapter (Postgres, etc.) by implementing UserRepository
// and swapping the factory in app/lib/auth/user-repository.ts.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  CreateUserInput,
  ListUsersFilters,
  UpdateUserProfileInput,
  UserRepository,
} from "../user-repository";
import type { AdminStatus, UserRecord, UserRole } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "users.json");

interface FileShape {
  users: UserRecord[];
}

export class JsonUserRepository implements UserRepository {
  private mutex: Promise<void> = Promise.resolve();

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const { users } = await readFile();
      const normalised = email.trim().toLowerCase();
      return users.find((u) => u.email === normalised) ?? null;
    });
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const { users } = await readFile();
      return users.find((u) => u.id === id) ?? null;
    });
  }

  async list(filters: ListUsersFilters = {}): Promise<UserRecord[]> {
    return this.withLock(async () => {
      const { users } = await readFile();
      const q = filters.q?.trim().toLowerCase();
      return users.filter((user) => {
        if (filters.role && user.role !== filters.role) return false;
        if (
          filters.adminStatus &&
          user.adminStatus !== filters.adminStatus
        )
          return false;
        if (q) {
          const haystack = `${user.email} ${user.name}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
    });
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    return this.withLock(async () => {
      const data = await readFile();
      const email = input.email.trim().toLowerCase();
      if (data.users.some((u) => u.email === email)) {
        throw new DuplicateEmailError(email);
      }
      const role = input.role ?? "customer";
      const record: UserRecord = {
        id: randomUUID(),
        email,
        name: input.name.trim(),
        role,
        passwordHash: input.passwordHash,
        createdAt: new Date().toISOString(),
        ...(role === "admin"
          ? { adminStatus: input.adminStatus ?? "approved" }
          : {}),
      };
      data.users.push(record);
      await writeFile(data);
      return record;
    });
  }

  async updatePassword(
    id: string,
    passwordHash: string,
  ): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      const updated: UserRecord = {
        ...data.users[index],
        passwordHash,
      };
      data.users[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async updateRole(id: string, role: UserRole): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      const current = data.users[index];
      const updated: UserRecord = {
        ...current,
        role,
      };
      if (role === "admin") {
        updated.adminStatus = "approved";
      } else {
        delete updated.adminStatus;
      }
      data.users[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async updateAdminStatus(
    id: string,
    status: AdminStatus,
  ): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      const current = data.users[index];
      if (current.role !== "admin") return null;
      const updated: UserRecord = { ...current, adminStatus: status };
      data.users[index] = updated;
      await writeFile(data);
      return updated;
    });
  }

  async countAdmins(approvedOnly = false): Promise<number> {
    return this.withLock(async () => {
      const { users } = await readFile();
      return users.filter((u) => {
        if (u.role !== "admin") return false;
        if (approvedOnly && u.adminStatus !== "approved") return false;
        return true;
      }).length;
    });
  }

  async findPrimaryAdmin(): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const { users } = await readFile();
      const admins = users.filter((u) => u.role === "admin");
      if (admins.length === 0) return null;
      const sorted = [...admins].sort((a, b) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
      );
      const approved = sorted.find((u) => u.adminStatus === "approved");
      return approved ?? sorted[0];
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.withLock(async () => {
      const data = await readFile();
      const before = data.users.length;
      data.users = data.users.filter((u) => u.id !== id);
      const changed = data.users.length !== before;
      if (changed) await writeFile(data);
      return changed;
    });
  }

  async updateProfile(
    id: string,
    input: UpdateUserProfileInput,
  ): Promise<UserRecord | null> {
    return this.withLock(async () => {
      const data = await readFile();
      const index = data.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      const current = data.users[index];
      const next: UserRecord = { ...current };
      if (typeof input.name === "string") {
        const trimmed = input.name.trim();
        if (trimmed.length > 0) next.name = trimmed;
      }
      if (input.phone === null) {
        delete next.phone;
      } else if (typeof input.phone === "string") {
        const trimmed = input.phone.trim();
        if (trimmed.length === 0) {
          delete next.phone;
        } else {
          next.phone = trimmed;
        }
      }
      data.users[index] = next;
      await writeFile(data);
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

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = "DuplicateEmailError";
  }
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileShape>;
    if (!parsed || !Array.isArray(parsed.users)) {
      return { users: [] };
    }
    const users = parsed.users.map((u) => ({
      ...u,
      role: (u as { role?: UserRole }).role ?? "customer",
    })) as UserRecord[];
    return { users };
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return { users: [] };
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
