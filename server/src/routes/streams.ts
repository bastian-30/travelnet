import crypto from "node:crypto";
import { Router } from "express";
import { authenticateRequest, requireRole } from "../auth.js";
import { playbackUrls, rtmpCredentials } from "../ant-media.js";
import { config } from "../config.js";
import { query } from "../db.js";
import type { DbUser, PgError } from "../types.js";

const router = Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STREAM_STATUSES = new Set(["scheduled", "live", "ended", "offline"]);

function serializeStream(row: Record<string, any>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    antMediaStreamId: row.ant_media_stream_id,
    playback: {
      hlsUrl: row.playback_hls_url,
      webrtcUrl: row.playback_webrtc_url,
    },
    thumbnailUrl: row.thumbnail_url,
    viewerCount: row.viewer_count,
    scheduledFor: row.scheduled_for,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    departmentId: row.department_id,
    departmentName: row.department_name,
    touristSiteId: row.tourist_site_id,
    touristSiteName: row.tourist_site_name,
    collaborator: {
      id: row.collaborator_id,
      name: row.collaborator_name,
      avatarUrl: row.collaborator_avatar_url,
    },
  };
}

async function findStreamById(id: string) {
  const result = await query(
    `SELECT s.*, COALESCE(d.name, td.name) AS department_name,
            ts.name AS tourist_site_name,
            u.full_name AS collaborator_name,
            u.avatar_url AS collaborator_avatar_url
     FROM streams s
     JOIN users u ON u.id = s.collaborator_id
     LEFT JOIN departments d ON d.id = s.department_id
     LEFT JOIN tourist_sites ts ON ts.id = s.tourist_site_id
     LEFT JOIN departments td ON td.id = ts.department_id
     WHERE s.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

async function ensureCollaboratorCredentials(userId: string) {
  const result = await query("SELECT id, ant_media_stream_id FROM users WHERE id = $1", [userId]);

  if (!result.rowCount) {
    throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  }

  const user = result.rows[0] as Pick<DbUser, "ant_media_stream_id">;
  return rtmpCredentials(user.ant_media_stream_id, user.ant_media_stream_id);
}

router.get("/", async (req, res) => {
  const departmentId = String(req.query.departmentId || "").trim() || null;
  const siteId = String(req.query.siteId || "").trim() || null;
  const requestedStatus = String(req.query.status || "").trim() || null;

  if (requestedStatus && !["scheduled", "live"].includes(requestedStatus)) {
    return res.status(400).json({ error: "Estado público no válido" });
  }

  const result = await query(
    `SELECT *
     FROM public_live_streams
     WHERE ($1::text IS NULL OR status = $1::stream_status)
       AND (
         $2::text IS NULL
         OR department_id = $2
         OR tourist_site_id IN (
           SELECT id FROM tourist_sites WHERE department_id = $2
         )
       )
       AND ($3::text IS NULL OR tourist_site_id = $3)
     ORDER BY (status = 'live') DESC, started_at DESC NULLS LAST,
              scheduled_for ASC NULLS LAST`,
    [requestedStatus, departmentId, siteId],
  );

  return res.json(result.rows.map(serializeStream));
});

router.get("/mine", authenticateRequest, async (req, res) => {
  if (!["collaborator", "admin"].includes(req.user!.role)) {
    return res.status(403).json({ error: "Se requiere rol de colaborador" });
  }

  const result = await query(
    `SELECT s.*, d.name AS department_name,
            ts.name AS tourist_site_name,
            u.full_name AS collaborator_name,
            u.avatar_url AS collaborator_avatar_url
     FROM streams s
     JOIN users u ON u.id = s.collaborator_id
     LEFT JOIN departments d ON d.id = s.department_id
     LEFT JOIN tourist_sites ts ON ts.id = s.tourist_site_id
     WHERE s.collaborator_id = $1
     ORDER BY s.created_at DESC`,
    [req.user!.id],
  );

  return res.json(result.rows.map(serializeStream));
});

router.get(
  "/credentials",
  authenticateRequest,
  requireRole("collaborator", "admin"),
  async (req, res) => {
    const credentials = await ensureCollaboratorCredentials(req.user!.id);
    res.set("Cache-Control", "no-store");
    return res.json(credentials);
  },
);

router.get("/:id", async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: "Identificador de stream inválido" });
  }

  const stream = await findStreamById(req.params.id);
  if (!stream) {
    return res.status(404).json({ error: "Stream no encontrado" });
  }

  return res.json(serializeStream(stream));
});

router.post("/", authenticateRequest, requireRole("collaborator", "admin"), async (req, res) => {
  const title = String(req.body?.title || "").trim();
  const description = String(req.body?.description || "").trim();
  const departmentId = String(req.body?.departmentId || "").trim() || null;
  const touristSiteId = String(req.body?.touristSiteId || "").trim() || null;
  const thumbnailUrl = String(req.body?.thumbnailUrl || "").trim() || null;
  const scheduledFor = req.body?.scheduledFor ? new Date(req.body.scheduledFor) : null;

  if (title.length < 3 || title.length > 180) {
    return res.status(400).json({
      error: "El título debe tener entre 3 y 180 caracteres",
    });
  }

  if (Boolean(departmentId) === Boolean(touristSiteId)) {
    return res.status(400).json({
      error: "Debes indicar exactamente un departamento o un sitio",
    });
  }

  if (scheduledFor && Number.isNaN(scheduledFor.getTime())) {
    return res.status(400).json({ error: "La fecha programada no es válida" });
  }

  if (departmentId) {
    const target = await query("SELECT 1 FROM departments WHERE id = $1", [departmentId]);
    if (!target.rowCount) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
  }

  if (touristSiteId) {
    const target = await query("SELECT 1 FROM tourist_sites WHERE id = $1 AND is_active = TRUE", [
      touristSiteId,
    ]);
    if (!target.rowCount) {
      return res.status(404).json({ error: "Sitio turístico no encontrado" });
    }
  }

  const urls = playbackUrls(req.user!.ant_media_stream_id);
  const result = await query(
    `INSERT INTO streams (
         collaborator_id, department_id, tourist_site_id, title, description,
         status, ant_media_stream_id, playback_hls_url, playback_webrtc_url,
         thumbnail_url, scheduled_for
       )
       VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7, $8, $9, $10)
       RETURNING id`,
    [
      req.user!.id,
      departmentId,
      touristSiteId,
      title,
      description,
      req.user!.ant_media_stream_id,
      urls.hlsUrl,
      urls.webrtcUrl,
      thumbnailUrl,
      scheduledFor,
    ],
  );

  const created = await findStreamById(result.rows[0].id);
  return res.status(201).json(serializeStream(created));
});

router.patch("/:id/status", authenticateRequest, async (req, res) => {
  const streamId = String(req.params.id);
  if (!UUID_PATTERN.test(streamId)) {
    return res.status(400).json({ error: "Identificador de stream inválido" });
  }

  const nextStatus = String(req.body?.status || "").trim();
  if (!STREAM_STATUSES.has(nextStatus)) {
    return res.status(400).json({ error: "Estado de stream no válido" });
  }

  const current = await query("SELECT id, collaborator_id, status FROM streams WHERE id = $1", [
    streamId,
  ]);

  if (!current.rowCount) {
    return res.status(404).json({ error: "Stream no encontrado" });
  }

  const stream = current.rows[0];
  if (req.user!.role !== "admin" && stream.collaborator_id !== req.user!.id) {
    return res.status(403).json({ error: "No puedes modificar este stream" });
  }

  try {
    await query(
      `UPDATE streams
       SET status = $2::stream_status,
           started_at = CASE
             WHEN $2::stream_status = 'live' THEN COALESCE(started_at, NOW())
             ELSE started_at
           END,
           ended_at = CASE
             WHEN $2::stream_status IN ('ended', 'offline')
               THEN COALESCE(ended_at, NOW())
             WHEN $2::stream_status = 'live' THEN NULL
             ELSE ended_at
           END
       WHERE id = $1`,
      [streamId, nextStatus],
    );

    const updated = await findStreamById(streamId);
    return res.json(serializeStream(updated));
  } catch (error) {
    if ((error as PgError).code === "23505") {
      return res.status(409).json({
        error: "Ya tienes otra transmisión en vivo. Finalízala primero.",
      });
    }
    throw error;
  }
});

router.post("/webhook/ant-media", async (req, res) => {
  const secret = config.antMedia.webhookSecret;
  if (!secret) {
    return res.status(503).json({ error: "Webhook no configurado" });
  }

  const received = Buffer.from(req.get("x-webhook-secret") || String(req.query.secret || ""));
  const expected = Buffer.from(secret);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return res.status(401).json({ error: "Firma de webhook inválida" });
  }

  const action = String(req.body?.action || "").toLowerCase();
  const streamId = String(req.body?.streamId || "").trim();

  if (!streamId || !["publish", "unpublish"].includes(action)) {
    return res.status(400).json({ error: "Evento de webhook inválido" });
  }

  if (action === "publish") {
    await query(
      `UPDATE streams
       SET status = 'live', started_at = COALESCE(started_at, NOW()), ended_at = NULL
       WHERE id = (
         SELECT id FROM streams
         WHERE ant_media_stream_id = $1 AND status IN ('scheduled', 'offline')
         ORDER BY created_at DESC
         LIMIT 1
       )`,
      [streamId],
    );
  } else {
    await query(
      `UPDATE streams
       SET status = 'ended', ended_at = COALESCE(ended_at, NOW())
       WHERE ant_media_stream_id = $1 AND status = 'live'`,
      [streamId],
    );
  }

  return res.json({ ok: true });
});

export default router;
