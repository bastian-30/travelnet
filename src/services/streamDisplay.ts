import type { LiveStream } from "../types/domain";

export interface DisplayStream {
  id: string;
  title: string;
  creator: string;
  avatar: string;
  thumbnail: string;
  viewers: number;
  department: string;
  isLive: boolean;
  startTime: string;
}

export const fallbackThumbnail =
  "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=700&h=400&fit=crop&auto=format";

export const fallbackAvatar =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&auto=format";

export function toDisplayStream(stream: LiveStream): DisplayStream {
  return {
    id: stream.id,
    title: stream.title,
    creator: stream.collaborator.name || "Colaborador TravelNet",
    avatar: stream.collaborator.avatarUrl || fallbackAvatar,
    thumbnail: stream.thumbnailUrl || fallbackThumbnail,
    viewers: stream.viewerCount,
    department: stream.departmentName || stream.touristSiteName || "Nicaragua",
    isLive: stream.status === "live",
    startTime: stream.scheduledFor
      ? new Date(stream.scheduledFor).toLocaleString("es-NI", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "Por definir",
  };
}
