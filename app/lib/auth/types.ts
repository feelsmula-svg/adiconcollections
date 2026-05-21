export type UserRole = "customer" | "admin";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthErrorBody {
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export interface PasswordResetRecord {
  tokenHash: string;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
}
