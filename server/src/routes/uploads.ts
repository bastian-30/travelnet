import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { authenticateRequest, requireRole } from "../auth.js";
import { query } from "../db.js";

const router = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "videos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const allowed = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];
    if (!allowed.includes(ext)) {
      return cb(new Error("Formato de video no permitido"), "");
    }
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 512 * 1024 * 1024, // 512MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Solo se permiten archivos de video"));
    }
    cb(null, true);
  },
});

router.post(
  "/videos",
  authenticateRequest,
  requireRole("collaborator", "admin"),
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo" });
      }

      const siteId = String(req.body?.siteId || "").trim();
      if (!siteId) {
        return res.status(400).json({ error: "siteId es requerido" });
      }

      const site = await query(
        "SELECT id FROM tourist_sites WHERE id = $1 AND is_active = TRUE",
        [siteId],
      );
      if (!site.rowCount) {
        return res.status(404).json({ error: "Sitio turístico no encontrado" });
      }

      const filename = req.file.filename;
      const relativeUrl = `/uploads/videos/${filename}`;

      await query(
        `UPDATE tourist_sites
         SET video_url = $2,
             video_type = 'local',
             video_filename = $3,
             video_mime_type = $4,
             video_size_bytes = $5,
             updated_at = NOW()
         WHERE id = $1`,
        [siteId, relativeUrl, filename, req.file.mimetype, req.file.size],
      );

      return res.json({
        ok: true,
        videoUrl: relativeUrl,
        filename,
      });
    } catch (error: any) {
      console.error("upload video:", error);
      return res.status(500).json({ error: error.message || "Error al subir video" });
    }
  },
);

router.delete(
  "/videos/:siteId",
  authenticateRequest,
  requireRole("collaborator", "admin"),
  async (req, res) => {
    try {
      const siteId = String(req.params.siteId);
      const result = await query(
        "SELECT video_filename FROM tourist_sites WHERE id = $1",
        [siteId],
      );
      if (result.rowCount && result.rows[0].video_filename) {
        const filepath = path.resolve(UPLOAD_DIR, result.rows[0].video_filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }

      await query(
        `UPDATE tourist_sites
         SET video_url = NULL,
             video_type = 'youtube',
             video_filename = NULL,
             video_mime_type = NULL,
             video_size_bytes = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [siteId],
      );

      return res.json({ ok: true });
    } catch (error) {
      console.error("delete video:", error);
      return res.status(500).json({ error: "Error al eliminar video" });
    }
  },
);

export default router;
