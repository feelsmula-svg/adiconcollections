export type UserRole = "customer" | "admin";

export type AdminStatus = "pending" | "approved";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  adminStatus?: AdminStatus;
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

export interface PendingSignupRecord {
  email: string;
  name: string;
  passwordHash: string;
  otpHash: string;
  attempts: number;
  createdAt: string;
  expiresAt: string;
  /** Earliest ISO timestamp at which a new OTP may be requested via resend. */
  resendAvailableAt: string;
}
