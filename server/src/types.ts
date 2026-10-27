export type UserRole = "user" | "collaborator" | "admin";

export interface DbUser {
  id: string;
  email: string;
  firebase_uid?: string | null;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: Date | string;
  last_login_at?: Date | string | null;
  ant_media_stream_id?: string | null;
}

export interface PgError extends Error {
  code?: string;
  status?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DbUser;
    }
  }
}

export {};
