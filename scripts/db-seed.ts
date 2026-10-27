import fs from "node:fs/promises";
import dotenv from "dotenv";
import pg from "pg";
import { departments, sampleReviews } from "../src/data/nicaragua.js";

dotenv.config({ path: "server/.env" });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const seed = await fs.readFile("database/seed.sql", "utf8");
  await pool.query(seed);

  let mipymeCount = 0;
  for (const department of departments) {
    for (const site of department.sites) {
      for (const [index, mipyme] of site.mipymes.entries()) {
        await pool.query(
          `INSERT INTO mipymes (id, site_id, name, type, description, distance, rating, price_range, phone, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             site_id = EXCLUDED.site_id,
             name = EXCLUDED.name,
             type = EXCLUDED.type,
             description = EXCLUDED.description,
             distance = EXCLUDED.distance,
             rating = EXCLUDED.rating,
             price_range = EXCLUDED.price_range,
             phone = EXCLUDED.phone,
             sort_order = EXCLUDED.sort_order,
             updated_at = NOW()`,
          [
            mipyme.id,
            site.id,
            mipyme.name,
            mipyme.type,
            mipyme.description,
            mipyme.distance,
            mipyme.rating,
            mipyme.priceRange,
            mipyme.phone,
            index,
          ],
        );
        mipymeCount += 1;
      }
    }
  }

  let reviewCount = 0;
  for (const review of sampleReviews) {
    const result = await pool.query(
      `INSERT INTO resenas (autor, calificacion, comentario, destino_id, destino_nombre, departamento)
       SELECT $1::varchar, $2::smallint, $3::text, $4::text, $5::varchar, $6::varchar
       WHERE NOT EXISTS (
         SELECT 1 FROM resenas WHERE autor = $1::varchar AND comentario = $3::text
       )`,
      [
        review.author,
        review.rating,
        review.text,
        review.siteId,
        review.siteName,
        review.departmentName,
      ],
    );
    reviewCount += result.rowCount ?? 0;
  }

  console.log(
    `Datos iniciales cargados correctamente (${mipymeCount} mipymes, ${reviewCount} reseñas nuevas).`,
  );
} finally {
  await pool.end();
}
