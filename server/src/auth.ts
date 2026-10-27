import type { NextFunction, Request, Response } from "express";
import { query } from "./db.js";
import { verifyFirebaseIdToken, type FirebaseIdTokenPayload } from "./firebase-auth.js";
import type { DbUser, PgError, UserRole } from "./types.js";

const USER_COLUMNS = `id, email, full_name, role, avatar_url, bio, is_active,
        created_at, firebase_uid, last_login_at, ant_media_stream_id`;

export function publicUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}

export async function ensureUserFromFirebase(
  payload: FirebaseIdTokenPayload,
  fullNameOverride?: string,
): Promise<DbUser | null> {
  const firebaseUid = payload.sub;
  const email = (payload.email || "").trim().toLowerCase();

  if (!firebaseUid || !email) {
    return null;
  }

  const existing = await query(`SELECT ${USER_COLUMNS} FROM users WHERE firebase_uid = $1`, [
    firebaseUid,
  ]);
  if (existing.rowCount) {
    const user = existing.rows[0] as DbUser;
    if (fullNameOverride && fullNameOverride !== user.full_name) {
      const updated = await query(
        `UPDATE users SET full_name = $1 WHERE id = $2 RETURNING ${USER_COLUMNS}`,
        [fullNameOverride, user.id],
      );
      return updated.rows[0] as DbUser;
    }
    return user;
  }

  const linkParams: unknown[] = [firebaseUid, email];
  let linkSql = `UPDATE users SET firebase_uid = $1 WHERE email = $2 AND firebase_uid IS NULL`;
  if (fullNameOverride) {
    linkParams.push(fullNameOverride);
    linkSql = `UPDATE users SET firebase_uid = $1, full_name = $3 WHERE email = $2 AND firebase_uid IS NULL`;
  }
  const linked = await query(`${linkSql} RETURNING ${USER_COLUMNS}`, linkParams);
  if (linked.rowCount) {
    return linked.rows[0] as DbUser;
  }

  const clash = await query("SELECT id FROM users WHERE email = $1 AND firebase_uid IS NOT NULL", [
    email,
  ]);
  if (clash.rowCount) {
    throw new Error("El correo está asociado a otra cuenta");
  }

  const fallbackName = fullNameOverride || payload.name || email.split("@")[0] || email;

  try {
    const inserted = await query(
      `INSERT INTO users (email, full_name, role, firebase_uid)
       VALUES ($1, $2, 'user', $3)
       RETURNING ${USER_COLUMNS}`,
      [email, fallbackName, firebaseUid],
    );
    return inserted.rows[0] as DbUser;
  } catch (error) {
    if ((error as PgError).code === "23505") {
      const retry = await query(
        `SELECT ${USER_COLUMNS} FROM users WHERE firebase_uid = $1 OR email = $2`,
        [firebaseUid, email],
      );
      if (retry.rowCount) {
        return retry.rows[0] as DbUser;
      }
    }
    throw error;
  }
}

export async function authenticateRequest(req: Request, res: Response, next: NextFunction) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token de acceso requerido" });
  }

  try {
    const payload = await verifyFirebaseIdToken(token);
    const user = await ensureUserFromFirebase(payload);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Usuario no disponible" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Autenticación requerida" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }

    next();
  };
}
