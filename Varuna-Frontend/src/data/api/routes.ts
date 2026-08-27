/**
 * VARUNA Routes API
 */

import { apiClient } from './client';
import { SafeRoute, Coordinates } from '../../domain/models/mapIntelligence';

export interface RouteCalculationRequest {
  origin: Coordinates;
  destination: Coordinates;
  vesselId?: string;
  avoidSevereWeather?: boolean;
}

export const routesApi = {
  async calculateSafeRoute(request: RouteCalculationRequest): Promise<SafeRoute> {
    return apiClient.post<SafeRoute>('/routes/calculate', request);
  },

  async getSavedRoutes(): Promise<SafeRoute[]> {
    return apiClient.get<SafeRoute[]>('/routes/saved');
  },
};
