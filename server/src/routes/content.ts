import { Router } from "express";
import { query } from "../db.js";

const router = Router();

export function serializeMipyme(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    distance: row.distance,
    rating: Number(row.rating),
    priceRange: row.price_range,
    phone: row.phone,
  };
}

async function loadMipymes(siteIds: string[]) {
  const map = new Map<string, ReturnType<typeof serializeMipyme>[]>();

  if (!siteIds.length) {
    return map;
  }

  const result = await query(
    `SELECT * FROM mipymes
     WHERE site_id = ANY($1::text[])
     ORDER BY site_id, sort_order, name`,
    [siteIds],
  );

  for (const row of result.rows) {
    const list = map.get(row.site_id) ?? [];
    list.push(serializeMipyme(row));
    map.set(row.site_id, list);
  }

  return map;
}

export function serializeSite(
  site: Record<string, any>,
  mipymes: ReturnType<typeof serializeMipyme>[] = [],
) {
  return {
    id: site.id,
    departmentId: site.department_id,
    name: site.name,
    category: site.category,
    description: site.description,
    history: site.history,
    coverImageUrl: site.cover_image_url,
    thumbnailImageUrl: site.thumbnail_image_url,
    videoUrl: site.video_url,
    videoType: site.video_type || "youtube",
    videoFilename: site.video_filename || null,
    tags: site.tags,
    isActive: site.is_active,
    mipymes,
  };
}

function departmentPayload(department: Record<string, any>) {
  return {
    id: department.id,
    name: department.name,
    capital: department.capital,
    region: department.region,
    description: department.description,
    coverImageUrl: department.cover_image_url,
    mapX: department.map_x,
    mapY: department.map_y,
    siteCount: department.site_count,
  };
}

router.get("/departments", async (_req, res) => {
  const result = await query(
    `SELECT d.*,
            COUNT(s.id)::int AS site_count
     FROM departments d
     LEFT JOIN tourist_sites s ON s.department_id = d.id AND s.is_active = TRUE
     GROUP BY d.id
     ORDER BY d.name`,
  );

  return res.json(result.rows.map(departmentPayload));
});

router.get("/departments/:id", async (req, res) => {
  const result = await query("SELECT * FROM departments WHERE id = $1", [req.params.id]);

  if (!result.rowCount) {
    return res.status(404).json({ error: "Departamento no encontrado" });
  }

  const sites = await query(
    `SELECT * FROM tourist_sites
     WHERE department_id = $1 AND is_active = TRUE
     ORDER BY name`,
    [req.params.id],
  );

  const mipymes = await loadMipymes(sites.rows.map((site) => site.id as string));
  const department = result.rows[0];

  return res.json({
    ...departmentPayload({ ...department, site_count: sites.rowCount }),
    sites: sites.rows.map((site) => serializeSite(site, mipymes.get(site.id as string) ?? [])),
  });
});

router.get("/sites", async (req, res) => {
  const departmentId = String(req.query.departmentId || "").trim();
  const params: unknown[] = [];
  let sql = `SELECT * FROM tourist_sites WHERE is_active = TRUE`;

  if (departmentId) {
    params.push(departmentId);
    sql += ` AND department_id = $1`;
  }
  sql += ` ORDER BY name`;

  const result = await query(sql, params);
  const mipymes = await loadMipymes(result.rows.map((site) => site.id as string));

  return res.json(
    result.rows.map((site) => serializeSite(site, mipymes.get(site.id as string) ?? [])),
  );
});

router.get("/sites/:id", async (req, res) => {
  const result = await query(
    `SELECT s.*, d.name AS department_name
     FROM tourist_sites s
     JOIN departments d ON d.id = s.department_id
     WHERE s.id = $1 AND s.is_active = TRUE`,
    [req.params.id],
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: "Sitio turístico no encontrado" });
  }

  const site = result.rows[0];
  const mipymes = await loadMipymes([site.id as string]);

  return res.json({
    ...serializeSite(site, mipymes.get(site.id as string) ?? []),
    departmentName: site.department_name,
  });
});

export default router;
