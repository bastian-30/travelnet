import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: "server/.env" });

const [email, fullName, role = "user"] = process.argv.slice(2);

if (!email || !fullName) {
  console.error('Uso: npm run user:create -- correo "Nombre completo" [user|collaborator|admin]');
  process.exit(1);
}

if (!["user", "collaborator", "admin"].includes(role)) {
  console.error("Rol inválido. Usa user, collaborator o admin.");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const result = await pool.query(
    `INSERT INTO users (email, full_name, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, role, created_at`,
    [email.toLowerCase(), fullName, role],
  );
  console.log("Usuario creado:", result.rows[0]);
  console.log(
    "Nota: inicia sesión con este correo en Firebase (se enlaza automáticamente al primer acceso).",
  );
} finally {
  await pool.end();
}
