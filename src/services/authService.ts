import { apiRequest } from "./apiClient";
import type { AuthUser } from "../types/domain";

export function registerRequest(fullName: string) {
  return apiRequest<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName }),
  });
}

export function meRequest() {
  return apiRequest<{ user: AuthUser }>("/api/auth/me");
}
