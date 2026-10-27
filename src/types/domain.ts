export type UserRole = "user" | "collaborator" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  capital: string;
  region: string;
  description: string;
  coverImageUrl: string | null;
  mapX: number | null;
  mapY: number | null;
  siteCount: number;
}

export interface TouristSite {
  id: string;
  departmentId: string;
  name: string;
  category: "turistico" | "historico" | "colonial";
  description: string;
  history: string;
  coverImageUrl: string | null;
  thumbnailImageUrl: string | null;
  videoUrl: string | null;
  tags: string[];
  isActive: boolean;
}

export interface Mipyme {
  id: string;
  name: string;
  type: string;
  description: string;
  distance: string;
  rating: number;
  priceRange: "$" | "$$" | "$$$";
  phone: string;
}

export type TouristSiteWithMipymes = TouristSite & { mipymes: Mipyme[] };

export interface DepartmentDetail extends Omit<DepartmentSummary, "siteCount"> {
  sites: TouristSiteWithMipymes[];
}

export type StreamStatus = "scheduled" | "live" | "ended" | "offline";

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  status: StreamStatus;
  antMediaStreamId: string;
  playback: {
    hlsUrl: string;
    webrtcUrl: string;
  };
  thumbnailUrl: string | null;
  viewerCount: number;
  scheduledFor: string | null;
  startedAt: string | null;
  endedAt: string | null;
  departmentId: string | null;
  departmentName?: string;
  touristSiteId: string | null;
  touristSiteName?: string | null;
  collaborator: {
    id: string;
    name?: string;
    avatarUrl?: string | null;
  };
}

export interface StreamCredentials {
  streamId: string;
  streamKey: string;
  rtmpServer: string;
  hlsUrl: string;
  webrtcUrl: string;
}

export interface CreateStreamInput {
  title: string;
  description?: string;
  departmentId?: string;
  touristSiteId?: string;
  scheduledFor?: string;
  thumbnailUrl?: string;
}
