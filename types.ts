export interface User {
  id?: string;
  email: string;
  name?: string;
  token?: string;
}

export interface GeoData {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // "lat,lng"
  org?: string;
  postal?: string;
  timezone?: string;
}

export interface HistoryItem {
  id: string;
  user_id?: string;
  created_at?: string;
  timestamp?: number; // Keeping for backward compatibility if needed
  data: GeoData;
}

export interface ApiError {
  message: string;
}
