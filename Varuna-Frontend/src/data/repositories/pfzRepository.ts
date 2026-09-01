/**
 * VARUNA PFZ Repository
 */

import { pfzApi } from '../api/pfz';
import { PfzZone } from '../../domain/models/types';
import { MOCK_PFZ_ZONES } from '../mock/marineData';
import { ENV } from '../config/environment';

class PfzRepository {
  public async getZones(lat: number = 17.38, lng: number = 83.25): Promise<PfzZone[]> {
    try {
      const remoteZones = await pfzApi.getZones(lat, lng);
      return remoteZones.map((z) => ({
        id: z.id,
        name: z.name,
        coordinates: { lat: z.coordinates.latitude, lng: z.coordinates.longitude },
        probability: z.probability,
        confidencePercent: z.confidence_percent,
        species: z.target_species,
        depthMeters: z.depth_meters,
        chlorophyllConcentration: `${z.chlorophyll_mg_m3} mg/m³`,
        seaTemp: `${z.sea_temp_c}°C`,
        optimalTimeWindow: z.optimal_time_window,
        distanceNm: z.distance_nm,
        bearingDeg: z.bearing_deg,
        boundaryPoints: z.boundary_polygon.map((p, idx) => ({ x: 100 + idx * 40, y: 120 + idx * 30 })),
      }));
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return MOCK_PFZ_ZONES;
      }
      throw err;
    }
  }

  public async getZoneById(zoneId: string): Promise<PfzZone | undefined> {
    const zones = await this.getZones();
    return zones.find((z) => z.id === zoneId);
  }
}

export const pfzRepository = new PfzRepository();
