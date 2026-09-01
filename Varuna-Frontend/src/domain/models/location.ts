/**
 * VARUNA Location Domain Models
 */

export interface LocationSearchResult {
  id: string;
  name: string;
  region?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
  is_marine_port: boolean;
  formatted_coordinates: string;
  elevation_m?: number | null;
  timezone?: string | null;
}
