import { apiRequest } from "./apiClient";
import type { DepartmentDetail, DepartmentSummary, TouristSiteWithMipymes } from "../types/domain";

export function getDepartments() {
  return apiRequest<DepartmentSummary[]>("/api/departments");
}

export function getDepartment(id: string) {
  return apiRequest<DepartmentDetail>(`/api/departments/${id}`);
}

export function getSites(departmentId?: string) {
  const search = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : "";
  return apiRequest<TouristSiteWithMipymes[]>(`/api/sites${search}`);
}

export function getSite(id: string) {
  return apiRequest<TouristSiteWithMipymes & { departmentName: string }>(`/api/sites/${id}`);
}
