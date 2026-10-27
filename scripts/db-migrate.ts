import fs from "node:fs/promises";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: "server/.env" });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const schema = await fs.readFile("database/schema.sql", "utf8");
  await pool.query(schema);
  console.log("Esquema aplicado correctamente.");
} finally {
  await pool.end();
}
