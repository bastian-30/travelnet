import { useEffect, useState } from "react";
import {
  departments as staticDepartments,
  type Department,
  type MIPYME,
  type Site,
} from "../data/nicaragua";
import { getDepartments, getSites } from "../services/contentService";
import type { DepartmentSummary, Mipyme, TouristSiteWithMipymes } from "../types/domain";

let catalogPromise: Promise<Department[]> | null = null;

function extractVideoId(videoUrl: string | null): string {
  if (!videoUrl) {
    return "";
  }
  const match = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
  return match?.[1] ?? "";
}

function toMipyme(mipyme: Mipyme): MIPYME {
  return {
    id: mipyme.id,
    name: mipyme.name,
    type: mipyme.type as MIPYME["type"],
    description: mipyme.description,
    distance: mipyme.distance,
    rating: Number(mipyme.rating),
    priceRange: mipyme.priceRange,
    phone: mipyme.phone,
  };
}

function toSite(site: TouristSiteWithMipymes): Site {
  return {
    id: site.id,
    name: site.name,
    category: site.category,
    coverImage: site.coverImageUrl || "",
    thumbnailImage: site.thumbnailImageUrl || "",
    description: site.description,
    history: site.history,
    videoId: extractVideoId(site.videoUrl),
    tags: site.tags,
    mipymes: site.mipymes.map(toMipyme),
  };
}

async function loadCatalog(): Promise<Department[]> {
  const [summaries, sites] = await Promise.all([getDepartments(), getSites()]);

  const sitesByDepartment = new Map<string, Site[]>();
  for (const site of sites) {
    const list = sitesByDepartment.get(site.departmentId) ?? [];
    list.push(toSite(site));
    sitesByDepartment.set(site.departmentId, list);
  }

  return summaries.map((summary: DepartmentSummary) => ({
    id: summary.id,
    name: summary.name,
    capital: summary.capital,
    region: summary.region as Department["region"],
    description: summary.description,
    coverImage: summary.coverImageUrl || "",
    mapX: summary.mapX ?? 0,
    mapY: summary.mapY ?? 0,
    sites: sitesByDepartment.get(summary.id) ?? [],
  }));
}

export function getCatalog(): Promise<Department[]> {
  if (!catalogPromise) {
    catalogPromise = loadCatalog().catch(() => staticDepartments);
  }
  return catalogPromise;
}

export function useCatalog(): Department[] {
  const [departments, setDepartments] = useState<Department[]>(staticDepartments);

  useEffect(() => {
    let cancelled = false;

    getCatalog().then((result) => {
      if (!cancelled) {
        setDepartments(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return departments;
}
