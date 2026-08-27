/**
 * VARUNA Map Intelligence API
 */

import { apiClient } from './client';
import {
  MapIntelligenceRequest,
  MapIntelligenceResponse,
  PfzZoneFeature,
  MarineConditions,
  SafeRoute,
  MapAlertItem,
} from '../../domain/models/mapIntelligence';

export const mapApi = {
  async getMapIntelligence(payload: MapIntelligenceRequest): Promise<MapIntelligenceResponse> {
    return apiClient.post<MapIntelligenceResponse>('/map/intelligence', payload);
  },

  async getPFZZones(lat: number, lng: number, radiusKm: number = 50): Promise<PfzZoneFeature[]> {
    return apiClient.get<PfzZoneFeature[]>('/map/pfz-zones', {
      params: { lat, lng, radius_km: radiusKm },
    });
  },

  async getMarineConditions(lat: number, lng: number): Promise<MarineConditions> {
    return apiClient.get<MarineConditions>('/map/conditions', {
      params: { lat, lng },
    });
  },

  async getSafeRoutes(originLat: number, originLng: number, destLat: number, destLng: number): Promise<SafeRoute[]> {
    return apiClient.post<SafeRoute[]>('/map/safe-routes', {
      origin: { latitude: originLat, longitude: originLng },
      destination: { latitude: destLat, longitude: destLng },
    });
  },

  async getNearbyAlerts(lat: number, lng: number, radiusKm: number = 100): Promise<MapAlertItem[]> {
    return apiClient.get<MapAlertItem[]>('/map/alerts', {
      params: { lat, lng, radius_km: radiusKm },
    });
  },
};
