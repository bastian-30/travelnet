import { Router } from "express";
import { authenticateRequest, publicUser, requireRole } from "../auth.js";
import { query } from "../db.js";
import type { DbUser, PgError, UserRole } from "../types.js";

const router = Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set<UserRole>(["user", "collaborator", "admin"]);
const REGIONS = new Set(["Pacífico", "Norte", "Atlántico", "Central"]);
const CATEGORIES = new Set(["turistico", "historico", "colonial"]);

router.use(authenticateRequest, requireRole("admin"));

function text(value: unknown) {
  return String(value ?? "").trim();
}

function nullableText(value: unknown) {
  const result = text(value);
  return result || null;
}

function slugify(value: string) {
  return text(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.get("/stats", async (_req, res) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) AS users,
       (SELECT COUNT(*)::int FROM users WHERE role = 'collaborator') AS collaborators,
       (SELECT COUNT(*)::int FROM departments) AS departments,
       (SELECT COUNT(*)::int FROM tourist_sites WHERE is_active = TRUE) AS sites,
       (SELECT COUNT(*)::int FROM streams WHERE status = 'live') AS live_streams`,
  );

  return res.json(result.rows[0]);
});

router.get("/users", async (_req, res) => {
  const result = await query(
    `SELECT id, email, full_name, role, avatar_url, bio, is_active,
            last_login_at, created_at
     FROM users
     ORDER BY created_at DESC`,
  );

  return res.json(
    result.rows.map((user: DbUser) => ({
      ...publicUser(user),
      lastLoginAt: user.last_login_at,
    })),
  );
});

router.post("/users", async (req, res) => {
  const email = text(req.body?.email).toLowerCase();
  const fullName = text(req.body?.fullName);
  const role = text(req.body?.role) || "user";

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: "El correo no es válido" });
  }
  if (fullName.length < 3 || fullName.length > 120) {
    return res.status(400).json({ error: "Nombre inválido" });
  }
  if (!ROLES.has(role as UserRole)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  try {
    const result = await query(
      `INSERT INTO users (email, full_name, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role, avatar_url, bio, is_active, created_at`,
      [email, fullName, role],
    );

    return res.status(201).json(publicUser(result.rows[0] as DbUser));
  } catch (error) {
    if ((error as PgError).code === "23505") {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }
    throw error;
  }
});

router.patch("/users/:id", async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: "Identificador inválido" });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (req.body?.role !== undefined) {
    const role = text(req.body.role);
    if (!ROLES.has(role as UserRole)) {
      return res.status(400).json({ error: "Rol inválido" });
    }
    if (req.params.id === req.user!.id && role !== "admin") {
      return res.status(400).json({ error: "No puedes quitarte el rol admin" });
    }
    params.push(role);
    updates.push(`role = $${params.length}`);
  }

  if (req.body?.isActive !== undefined) {
    if (typeof req.body.isActive !== "boolean") {
      return res.status(400).json({ error: "isActive debe ser booleano" });
    }
    if (req.params.id === req.user!.id && !req.body.isActive) {
      return res.status(400).json({ error: "No puedes desactivar tu cuenta" });
    }
    params.push(req.body.isActive);
    updates.push(`is_active = $${params.length}`);
  }

  if (req.body?.fullName !== undefined) {
    const fullName = text(req.body.fullName);
    if (fullName.length < 3 || fullName.length > 120) {
      return res.status(400).json({ error: "Nombre inválido" });
    }
    params.push(fullName);
    updates.push(`full_name = $${params.length}`);
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  params.push(req.params.id);
  const result = await query(
    `UPDATE users SET ${updates.join(", ")}
     WHERE id = $${params.length}
     RETURNING id, email, full_name, role, avatar_url, bio, is_active, last_login_at, created_at`,
    params,
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const user = result.rows[0] as DbUser;
  return res.json({
    ...publicUser(user),
    lastLoginAt: user.last_login_at,
  });
});

router.post("/departments", async (req, res) => {
  const name = text(req.body?.name);
  const id = text(req.body?.id) || slugify(name);
  const capital = text(req.body?.capital);
  const region = text(req.body?.region);

  if (!SLUG_PATTERN.test(id)) {
    return res.status(400).json({ error: "Identificador inválido" });
  }
  if (!name || !capital || !REGIONS.has(region)) {
    return res.status(400).json({
      error: "Nombre, capital y región válida son obligatorios",
    });
  }

  try {
    const result = await query(
      `INSERT INTO departments (
         id, name, capital, region, description, cover_image_url, map_x, map_y
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        name,
        capital,
        region,
        text(req.body?.description),
        nullableText(req.body?.coverImageUrl),
        req.body?.mapX ?? null,
        req.body?.mapY ?? null,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if ((error as PgError).code === "23505") {
      return res.status(409).json({ error: "El departamento ya existe" });
    }
    throw error;
  }
});

router.patch("/departments/:id", async (req, res) => {
  const mapping: Record<string, string> = {
    name: "name",
    capital: "capital",
    region: "region",
    description: "description",
    coverImageUrl: "cover_image_url",
    mapX: "map_x",
    mapY: "map_y",
  };
  const updates: string[] = [];
  const params: unknown[] = [];

  for (const [bodyKey, column] of Object.entries(mapping)) {
    if (req.body?.[bodyKey] !== undefined) {
      const value =
        bodyKey === "coverImageUrl" ? nullableText(req.body[bodyKey]) : req.body[bodyKey];
      if (bodyKey === "region" && !REGIONS.has(value)) {
        return res.status(400).json({ error: "Región inválida" });
      }
      params.push(value);
      updates.push(`${column} = $${params.length}`);
    }
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  params.push(req.params.id);
  const result = await query(
    `UPDATE departments SET ${updates.join(", ")}
     WHERE id = $${params.length}
     RETURNING *`,
    params,
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: "Departamento no encontrado" });
  }

  return res.json(result.rows[0]);
});

router.delete("/departments/:id", async (req, res) => {
  try {
    const result = await query("DELETE FROM departments WHERE id = $1", [req.params.id]);
    if (!result.rowCount) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    return res.status(204).end();
  } catch (error) {
    if ((error as PgError).code === "23503") {
      return res.status(409).json({
        error: "El departamento tiene sitios o transmisiones asociadas",
      });
    }
    throw error;
  }
});

router.post("/sites", async (req, res) => {
  const departmentId = text(req.body?.departmentId);
  const name = text(req.body?.name);
  const id = text(req.body?.id) || slugify(name);
  const category = text(req.body?.category) || "turistico";

  if (!SLUG_PATTERN.test(id)) {
    return res.status(400).json({ error: "Identificador inválido" });
  }
  if (!name || !departmentId || !CATEGORIES.has(category)) {
    return res.status(400).json({
      error: "Nombre, departamento y categoría válida son obligatorios",
    });
  }

  try {
    const result = await query(
      `INSERT INTO tourist_sites (
         id, department_id, name, category, description, history,
         cover_image_url, thumbnail_image_url, video_url, tags
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        departmentId,
        name,
        category,
        text(req.body?.description),
        text(req.body?.history),
        nullableText(req.body?.coverImageUrl),
        nullableText(req.body?.thumbnailImageUrl),
        nullableText(req.body?.videoUrl),
        Array.isArray(req.body?.tags)
          ? req.body.tags.map((tag: unknown) => text(tag)).filter(Boolean)
          : [],
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if ((error as PgError).code === "23505") {
      return res.status(409).json({ error: "El sitio ya existe" });
    }
    if ((error as PgError).code === "23503") {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    throw error;
  }
});

router.patch("/sites/:id", async (req, res) => {
  const mapping: Record<string, string> = {
    departmentId: "department_id",
    name: "name",
    category: "category",
    description: "description",
    history: "history",
    coverImageUrl: "cover_image_url",
    thumbnailImageUrl: "thumbnail_image_url",
    videoUrl: "video_url",
    tags: "tags",
    isActive: "is_active",
  };
  const updates: string[] = [];
  const params: unknown[] = [];

  for (const [bodyKey, column] of Object.entries(mapping)) {
    if (req.body?.[bodyKey] !== undefined) {
      if (bodyKey === "category" && !CATEGORIES.has(req.body[bodyKey])) {
        return res.status(400).json({ error: "Categoría inválida" });
      }
      if (bodyKey === "tags" && !Array.isArray(req.body.tags)) {
        return res.status(400).json({ error: "tags debe ser un arreglo" });
      }
      params.push(req.body[bodyKey]);
      updates.push(`${column} = $${params.length}`);
    }
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  params.push(req.params.id);
  const result = await query(
    `UPDATE tourist_sites SET ${updates.join(", ")}
     WHERE id = $${params.length}
     RETURNING *`,
    params,
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: "Sitio no encontrado" });
  }

  return res.json(result.rows[0]);
});

router.delete("/sites/:id", async (req, res) => {
  try {
    const result = await query("DELETE FROM tourist_sites WHERE id = $1", [req.params.id]);
    if (!result.rowCount) {
      return res.status(404).json({ error: "Sitio no encontrado" });
    }
    return res.status(204).end();
  } catch (error) {
    if ((error as PgError).code === "23503") {
      return res.status(409).json({
        error: "El sitio tiene transmisiones asociadas",
      });
    }
    throw error;
  }
});

export default router;
