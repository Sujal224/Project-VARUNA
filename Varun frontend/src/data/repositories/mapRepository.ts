/**
 * VARUNA Map Repository
 */

import { mapApi } from '../api/map';
import {
  MapIntelligenceRequest,
  MapIntelligenceResponse,
  PfzZoneFeature,
  MarineConditions,
  SafeRoute,
  MapAlertItem,
  Coordinates,
} from '../../domain/models/mapIntelligence';
import { MOCK_PFZ_ZONES, INITIAL_OCEAN_METRICS, MOCK_ALERTS, MOCK_PRIMARY_INSIGHT, MOCK_VESSEL } from '../mock/marineData';
import { ENV } from '../config/environment';

export interface IMapRepository {
  getCurrentLocation(): Promise<Coordinates>;
  getMapIntelligence(request?: Partial<MapIntelligenceRequest>): Promise<MapIntelligenceResponse>;
  getPFZZones(lat?: number, lng?: number): Promise<PfzZoneFeature[]>;
  getMarineConditions(lat?: number, lng?: number): Promise<MarineConditions>;
  getSafeRoutes(origin: Coordinates, destination: Coordinates): Promise<SafeRoute[]>;
  getNearbyAlerts(lat?: number, lng?: number): Promise<MapAlertItem[]>;
}

class MapRepository implements IMapRepository {
  private cachedIntelligence: MapIntelligenceResponse | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 60000;

  private readonly DEFAULT_LOCATION: Coordinates = {
    latitude: 17.38,
    longitude: 83.25,
  };

  public async getCurrentLocation(): Promise<Coordinates> {
    return this.DEFAULT_LOCATION;
  }

  public async getMapIntelligence(
    request?: Partial<MapIntelligenceRequest>
  ): Promise<MapIntelligenceResponse> {
    const lat = request?.latitude ?? this.DEFAULT_LOCATION.latitude;
    const lng = request?.longitude ?? this.DEFAULT_LOCATION.longitude;
    const radius = request?.radius_km ?? 50;

    const now = Date.now();
    if (this.cachedIntelligence && (now - this.lastFetchTime < this.CACHE_TTL_MS)) {
      return this.cachedIntelligence;
    }

    try {
      const response = await mapApi.getMapIntelligence({
        latitude: lat,
        longitude: lng,
        radius_km: radius,
      });
      this.cachedIntelligence = response;
      this.lastFetchTime = now;
      return response;
    } catch (error) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        const fallback = this.generateMockMapIntelligence(lat, lng);
        this.cachedIntelligence = fallback;
        this.lastFetchTime = now;
        return fallback;
      }
      throw error;
    }
  }

  public async getPFZZones(lat?: number, lng?: number): Promise<PfzZoneFeature[]> {
    const targetLat = lat ?? this.DEFAULT_LOCATION.latitude;
    const targetLng = lng ?? this.DEFAULT_LOCATION.longitude;

    try {
      return await mapApi.getPFZZones(targetLat, targetLng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return this.mapMockPfzToFeatures();
      }
      throw err;
    }
  }

  public async getMarineConditions(lat?: number, lng?: number): Promise<MarineConditions> {
    const targetLat = lat ?? this.DEFAULT_LOCATION.latitude;
    const targetLng = lng ?? this.DEFAULT_LOCATION.longitude;

    try {
      return await mapApi.getMarineConditions(targetLat, targetLng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return {
          sea_temperature: 28.4,
          wave_height: 1.2,
          wave_speed: 14.0,
          chlorophyll: 2.4,
          swell_direction_deg: 135,
          swell_period_sec: 9,
          wind_direction_deg: 120,
          salinity_psu: 34.8,
          current_speed_knots: 1.4,
          surface_visibility_km: 18.0,
        };
      }
      throw err;
    }
  }

  public async getSafeRoutes(origin: Coordinates, destination: Coordinates): Promise<SafeRoute[]> {
    try {
      return await mapApi.getSafeRoutes(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return [
          {
            id: 'route-optimal-01',
            name: 'Primary Safe Passage (Via Deep Channel)',
            distance_nm: 14.2,
            estimated_duration_hours: 1.4,
            fuel_estimated_liters: 18.5,
            safety_score: 96,
            is_recommended: true,
            waypoints: [
              { latitude: origin.latitude, longitude: origin.longitude, sequence: 1, depth_m: 22, risk_level: 'safe' },
              { latitude: (origin.latitude + destination.latitude) / 2 + 0.02, longitude: (origin.longitude + destination.longitude) / 2, sequence: 2, depth_m: 54, risk_level: 'safe' },
              { latitude: destination.latitude, longitude: destination.longitude, sequence: 3, depth_m: 64, risk_level: 'safe' },
            ],
          },
        ];
      }
      throw err;
    }
  }

  public async getNearbyAlerts(lat?: number, lng?: number): Promise<MapAlertItem[]> {
    const targetLat = lat ?? this.DEFAULT_LOCATION.latitude;
    const targetLng = lng ?? this.DEFAULT_LOCATION.longitude;

    try {
      return await mapApi.getNearbyAlerts(targetLat, targetLng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return MOCK_ALERTS.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          severity: a.severity,
          location_name: a.location,
          coordinates: { latitude: 17.42, longitude: 83.38 },
          timestamp: a.timestamp,
          description: a.description,
          impact_explanation: a.impactExplanation,
          recommended_action: a.recommendedAction,
          active: a.active,
        }));
      }
      throw err;
    }
  }

  private mapMockPfzToFeatures(): PfzZoneFeature[] {
    return MOCK_PFZ_ZONES.map((z) => ({
      id: z.id,
      name: z.name,
      coordinates: { latitude: z.coordinates.lat, longitude: z.coordinates.lng },
      probability: z.probability,
      confidence_percent: z.confidencePercent,
      target_species: z.species,
      depth_meters: z.depthMeters,
      chlorophyll_mg_m3: parseFloat(z.chlorophyllConcentration) || 2.4,
      sea_temp_c: parseFloat(z.seaTemp) || 28.4,
      optimal_time_window: z.optimalTimeWindow,
      distance_nm: z.distanceNm,
      bearing_deg: z.bearingDeg,
      boundary_polygon: [
        { latitude: z.coordinates.lat + 0.04, longitude: z.coordinates.lng - 0.04 },
        { latitude: z.coordinates.lat + 0.05, longitude: z.coordinates.lng + 0.04 },
        { latitude: z.coordinates.lat - 0.03, longitude: z.coordinates.lng + 0.05 },
        { latitude: z.coordinates.lat - 0.04, longitude: z.coordinates.lng - 0.03 },
      ],
    }));
  }

  private generateMockMapIntelligence(lat: number, lng: number): MapIntelligenceResponse {
    return {
      user_location: { latitude: lat, longitude: lng },
      conditions: {
        sea_temperature: 28.4,
        wave_height: 1.2,
        wave_speed: 14.0,
        chlorophyll: 2.4,
        swell_direction_deg: 135,
        swell_period_sec: 9,
        wind_direction_deg: 120,
        salinity_psu: 34.8,
        current_speed_knots: 1.4,
        surface_visibility_km: 18.0,
      },
      weather: {
        current: {
          temperature_c: 29.2,
          humidity_percent: 74,
          barometric_pressure_hpa: 1013,
          wind_speed_kmh: 14,
          wind_gust_kmh: 19,
          condition_text: 'Partly Cloudy & Calm Swell',
          icon: 'weather-partly-cloudy',
          uv_index: 6,
          visibility_km: 18,
        },
        forecast: [
          { timestamp: '06:00', time_label: '06:00 AM', temp_c: 27.5, wave_height_m: 0.9, wind_speed_kmh: 12, precipitation_probability: 5, condition: 'Clear', icon: 'sun' },
          { timestamp: '12:00', time_label: '12:00 PM', temp_c: 30.1, wave_height_m: 1.1, wind_speed_kmh: 14, precipitation_probability: 10, condition: 'Partly Cloudy', icon: 'cloud-sun' },
          { timestamp: '18:00', time_label: '06:00 PM', temp_c: 28.4, wave_height_m: 1.2, wind_speed_kmh: 16, precipitation_probability: 15, condition: 'Moderate Swell', icon: 'wind' },
        ],
        sunrise: '05:42 AM',
        sunset: '06:18 PM',
        tide_state: 'High Flood',
      },
      pfz: {
        zones: this.mapMockPfzToFeatures(),
        last_satellite_pass: '24 mins ago (MODIS Aqua Pass)',
      },
      risk: {
        score: 18,
        level: 'LOW',
        summary: 'Ideal marine operating window. Stable barometric ridge with swell under 1.2m.',
        factors: [
          { name: 'Wave Severity', score: 14, severity: 'low', description: 'Wave height 0.8-1.2m is optimal for small craft.' },
          { name: 'Wind Stability', score: 18, severity: 'low', description: 'Wind speeds under 15 km/h from ESE.' },
          { name: 'Squall / Cyclone Threat', score: 8, severity: 'low', description: 'Zero convective cloud clusters within 120nm.' },
        ],
      },
      safe_routes: [
        {
          id: 'route-alpha-direct',
          name: 'Direct Channel Passage to PFZ Alpha',
          distance_nm: 14.2,
          estimated_duration_hours: 1.4,
          fuel_estimated_liters: 18.5,
          safety_score: 96,
          is_recommended: true,
          waypoints: [
            { latitude: lat, longitude: lng, sequence: 1, depth_m: 24, risk_level: 'safe' },
            { latitude: 17.40, longitude: 83.32, sequence: 2, depth_m: 48, risk_level: 'safe' },
            { latitude: 17.42, longitude: 83.38, sequence: 3, depth_m: 64, risk_level: 'safe' },
          ],
        },
      ],
      alerts: MOCK_ALERTS.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        severity: a.severity,
        location_name: a.location,
        coordinates: { latitude: 17.42, longitude: 83.38 },
        timestamp: a.timestamp,
        description: a.description,
        impact_explanation: a.impactExplanation,
        recommended_action: a.recommendedAction,
        active: a.active,
      })),
      recommendation: {
        headline: MOCK_PRIMARY_INSIGHT.headline,
        explanation: MOCK_PRIMARY_INSIGHT.explanation,
        confidence_percent: MOCK_PRIMARY_INSIGHT.confidencePercent,
        timestamp: MOCK_PRIMARY_INSIGHT.timestamp,
        recommended_zone_id: MOCK_PRIMARY_INSIGHT.recommendedZoneId,
        key_factors: MOCK_PRIMARY_INSIGHT.factors,
      },
    };
  }
}

export const mapRepository = new MapRepository();
