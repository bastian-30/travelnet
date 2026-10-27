import { apiRequest } from "./apiClient";
import type {
  CreateStreamInput,
  LiveStream,
  StreamCredentials,
  StreamStatus,
} from "../types/domain";

interface StreamFilters {
  departmentId?: string;
  siteId?: string;
  status?: "scheduled" | "live";
}

export function getStreams(filters: StreamFilters = {}) {
  const params = new URLSearchParams();
  if (filters.departmentId) params.set("departmentId", filters.departmentId);
  if (filters.siteId) params.set("siteId", filters.siteId);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return apiRequest<LiveStream[]>(`/api/streams${query ? `?${query}` : ""}`, {
    authenticated: false,
  });
}

export function getStream(id: string) {
  return apiRequest<LiveStream>(`/api/streams/${id}`, {
    authenticated: false,
  });
}

export function getMyStreams() {
  return apiRequest<LiveStream[]>("/api/streams/mine");
}

export function getStreamCredentials() {
  return apiRequest<StreamCredentials>("/api/streams/credentials");
}

export function createStream(input: CreateStreamInput) {
  return apiRequest<LiveStream>("/api/streams", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateStreamStatus(id: string, status: StreamStatus) {
  return apiRequest<LiveStream>(`/api/streams/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
