import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { pool, query } from "./db.js";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import streamsRouter from "./routes/streams.js";
import type { PgError } from "./types.js";

const app = express();
const allowedOrigins = config.frontendOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use((_req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  next();
});

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    console.error("PostgreSQL:", (error as Error).message);
    res.status(503).json({ ok: false, database: "disconnected" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/streams", streamsRouter);
app.use("/api", contentRouter);

app.get("/api/destinos", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM destinos ORDER BY creado_en DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron consultar los destinos" });
  }
});

app.post("/api/destinos", async (req, res) => {
  const { nombre, departamento, descripcion = "", imagen_url = "" } = req.body;

  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    typeof departamento !== "string" ||
    !departamento.trim()
  ) {
    return res.status(400).json({
      error: "nombre y departamento son obligatorios",
    });
  }

  try {
    const result = await query(
      `INSERT INTO destinos (nombre, departamento, descripcion, imagen_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre.trim(), departamento.trim(), descripcion, imagen_url],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo guardar el destino" });
  }
});

app.get("/api/resenas", async (_req, res) => {
  try {
    const result = await query("SELECT * FROM resenas ORDER BY creado_en DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron consultar las reseñas" });
  }
});

app.post("/api/resenas", async (req, res) => {
  const {
    autor,
    calificacion,
    comentario,
    destino_id = "",
    destino_nombre,
    departamento,
  } = req.body;

  if (
    typeof autor !== "string" ||
    !autor.trim() ||
    !Number.isInteger(calificacion) ||
    calificacion < 1 ||
    calificacion > 5 ||
    typeof comentario !== "string" ||
    !comentario.trim() ||
    typeof destino_nombre !== "string" ||
    !destino_nombre.trim() ||
    typeof departamento !== "string" ||
    !departamento.trim()
  ) {
    return res.status(400).json({ error: "Datos de reseña inválidos" });
  }

  try {
    const result = await query(
      `INSERT INTO resenas
       (autor, calificacion, comentario, destino_id, destino_nombre, departamento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        autor.trim(),
        calificacion,
        comentario.trim(),
        String(destino_id),
        destino_nombre.trim(),
        departamento.trim(),
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo guardar la reseña" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((error: PgError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  if (res.headersSent) {
    return;
  }
  if (error.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: error.message });
  }
  const status = Number(error.status) || 500;
  res.status(status).json({
    error: status >= 500 ? "Error interno del servidor" : error.message,
  });
});

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`API disponible en http://localhost:${config.port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
