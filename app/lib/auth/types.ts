export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
}

export interface AuthErrorBody {
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
}
