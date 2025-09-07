export interface Link {
  id: string;
  shortCode: string;
  destinationUrl: string;
  alias?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  visitCount: number;
}

export interface Visit {
  id: string;
  linkId: string;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  userAgent: string;
  referrer?: string;
  timestamp: string;
}

export interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface LinkStats {
  totalVisits: number;
  uniqueVisitors: number;
  countries: { [key: string]: number };
  dailyVisits: { date: string; visits: number }[];
  recentVisits: Visit[];
}

export interface CreateLinkRequest {
  destinationUrl: string;
  alias?: string;
  expiresAt?: string;
}

export interface CreateLinkResponse {
  success: boolean;
  link?: Link;
  error?: string;
}