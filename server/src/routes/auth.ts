import { Router } from "express";
import { authenticateRequest, ensureUserFromFirebase, publicUser } from "../auth.js";
import { verifyFirebaseIdToken } from "../firebase-auth.js";
import { query } from "../db.js";

const router = Router();

router.post("/register", async (req, res) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token de acceso requerido" });
  }

  const fullName = String(req.body?.fullName || "").trim();

  if (fullName.length < 3 || fullName.length > 120) {
    return res.status(400).json({
      error: "El nombre debe tener entre 3 y 120 caracteres",
    });
  }

  let payload: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
  try {
    payload = await verifyFirebaseIdToken(token);
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  try {
    const user = await ensureUserFromFirebase(payload, fullName);

    if (!user) {
      return res.status(400).json({ error: "El token no incluye un correo válido" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "La cuenta está desactivada" });
    }

    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]);

    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === "El correo está asociado a otra cuenta") {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }
});

router.get("/me", authenticateRequest, async (req, res) => {
  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [req.user!.id]).catch(
    () => undefined,
  );

  return res.json({ user: publicUser(req.user!) });
});

export default router;
