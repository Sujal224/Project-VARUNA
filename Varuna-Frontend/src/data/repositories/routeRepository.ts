/**
 * VARUNA Route Repository
 */

import { routesApi, RouteCalculationRequest } from '../api/routes';
import { SafeRoute, Coordinates } from '../../domain/models/mapIntelligence';
import { ENV } from '../config/environment';

class RouteRepository {
  public async calculateRoute(origin: Coordinates, destination: Coordinates): Promise<SafeRoute> {
    try {
      return await routesApi.calculateSafeRoute({ origin, destination, avoidSevereWeather: true });
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return {
          id: 'route-optimal-fallback',
          name: 'Direct Channel Passage to Target',
          distance_nm: 14.2,
          estimated_duration_hours: 1.4,
          fuel_estimated_liters: 18.5,
          safety_score: 96,
          is_recommended: true,
          waypoints: [
            { latitude: origin.latitude, longitude: origin.longitude, sequence: 1, depth_m: 24, risk_level: 'safe' },
            { latitude: (origin.latitude + destination.latitude) / 2, longitude: (origin.longitude + destination.longitude) / 2, sequence: 2, depth_m: 48, risk_level: 'safe' },
            { latitude: destination.latitude, longitude: destination.longitude, sequence: 3, depth_m: 64, risk_level: 'safe' },
          ],
        };
      }
      throw err;
    }
  }

  public async getSavedRoutes(): Promise<SafeRoute[]> {
    try {
      return await routesApi.getSavedRoutes();
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return [];
      }
      throw err;
    }
  }
}

export const routeRepository = new RouteRepository();
