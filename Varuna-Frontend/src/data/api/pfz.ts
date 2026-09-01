/**
 * VARUNA PFZ API
 */

import { apiClient } from './client';
import { PfzZoneFeature } from '../../domain/models/mapIntelligence';

export const pfzApi = {
  async getZones(lat: number, lng: number, radiusKm: number = 60): Promise<PfzZoneFeature[]> {
    return apiClient.get<PfzZoneFeature[]>('/pfz/zones', {
      params: { lat, lng, radius_km: radiusKm },
    });
  },

  async getZoneDetails(zoneId: string): Promise<PfzZoneFeature> {
    return apiClient.get<PfzZoneFeature>(`/pfz/zones/${zoneId}`);
  },
};
