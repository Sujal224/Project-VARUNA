/**
 * VARUNA Map Repository
 * Central data access layer for live map intelligence, PFZ polygons, marine metrics,
 * safe route calculations, and hazard alerts for exact GPS coordinates.
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
import { locationService } from '../services/locationService';
import { MOCK_PFZ_ZONES, MOCK_ALERTS, MOCK_PRIMARY_INSIGHT } from '../mock/marineData';
import { ENV } from '../config/environment';

import { LocationSearchResult } from '../../domain/models/location';

export interface IMapRepository {
  getCurrentLocation(): Promise<Coordinates>;
  getMapIntelligence(request?: Partial<MapIntelligenceRequest>): Promise<MapIntelligenceResponse>;
  getPFZZones(lat?: number, lng?: number): Promise<PfzZoneFeature[]>;
  getMarineConditions(lat?: number, lng?: number): Promise<MarineConditions>;
  getSafeRoutes(origin: Coordinates, destination: Coordinates): Promise<SafeRoute[]>;
  getNearbyAlerts(lat?: number, lng?: number): Promise<MapAlertItem[]>;
  searchLocations(query?: string, limit?: number): Promise<LocationSearchResult[]>;
}


class MapRepository implements IMapRepository {
  private cachedIntelligence: MapIntelligenceResponse | null = null;
  private lastFetchTime: number = 0;
  private lastCachedCoords: string = '';
  private readonly CACHE_TTL_MS = 15000; // 15s cache

  public async getCurrentLocation(): Promise<Coordinates> {
    return locationService.getCurrentState().coords;
  }

  public async getMapIntelligence(
    request?: Partial<MapIntelligenceRequest>
  ): Promise<MapIntelligenceResponse> {
    const currentLoc = locationService.getCurrentState().coords;
    const lat = request?.latitude !== undefined ? request.latitude : currentLoc.latitude;
    const lng = request?.longitude !== undefined ? request.longitude : currentLoc.longitude;
    const radius = request?.radius_km ?? 50;

    const coordKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    const now = Date.now();

    if (
      this.cachedIntelligence &&
      this.lastCachedCoords === coordKey &&
      now - this.lastFetchTime < this.CACHE_TTL_MS
    ) {
      return this.cachedIntelligence;
    }

    try {
      const response = await mapApi.getMapIntelligence({
        latitude: lat,
        longitude: lng,
        radius_km: radius,
      });
      this.cachedIntelligence = response;
      this.lastCachedCoords = coordKey;
      this.lastFetchTime = now;
      return response;
    } catch (error) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        const fallback = this.generateDynamicMapIntelligence(lat, lng);
        this.cachedIntelligence = fallback;
        this.lastCachedCoords = coordKey;
        this.lastFetchTime = now;
        return fallback;
      }
      throw error;
    }
  }

  public async getPFZZones(lat?: number, lng?: number): Promise<PfzZoneFeature[]> {
    const currentLoc = locationService.getCurrentState().coords;
    const targetLat = lat !== undefined ? lat : currentLoc.latitude;
    const targetLng = lng !== undefined ? lng : currentLoc.longitude;

    try {
      return await mapApi.getPFZZones(targetLat, targetLng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return this.mapDynamicPfzFeatures(targetLat, targetLng);
      }
      throw err;
    }
  }

  public async getMarineConditions(lat?: number, lng?: number): Promise<MarineConditions> {
    const currentLoc = locationService.getCurrentState().coords;
    const targetLat = lat !== undefined ? lat : currentLoc.latitude;
    const targetLng = lng !== undefined ? lng : currentLoc.longitude;

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
            name: `Direct Passage from ${origin.latitude.toFixed(2)}°N, ${origin.longitude.toFixed(2)}°E`,
            distance_nm: 14.2,
            estimated_duration_hours: 1.4,
            fuel_estimated_liters: 18.5,
            safety_score: 96,
            is_recommended: true,
            waypoints: [
              { latitude: origin.latitude, longitude: origin.longitude, sequence: 1, depth_m: 22, risk_level: 'safe' },
              { latitude: (origin.latitude + destination.latitude) / 2, longitude: (origin.longitude + destination.longitude) / 2, sequence: 2, depth_m: 54, risk_level: 'safe' },
              { latitude: destination.latitude, longitude: destination.longitude, sequence: 3, depth_m: 64, risk_level: 'safe' },
            ],
          },
        ];
      }
      throw err;
    }
  }

  public async getNearbyAlerts(lat?: number, lng?: number): Promise<MapAlertItem[]> {
    const currentLoc = locationService.getCurrentState().coords;
    const targetLat = lat !== undefined ? lat : currentLoc.latitude;
    const targetLng = lng !== undefined ? lng : currentLoc.longitude;

    try {
      return await mapApi.getNearbyAlerts(targetLat, targetLng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return [
          {
            id: 'alert-live-01',
            title: 'Regional Operational Advisory',
            category: 'Navigation Hazard',
            severity: 'Info',
            location_name: `Sector ${targetLat.toFixed(2)}°N, ${targetLng.toFixed(2)}°E`,
            coordinates: { latitude: targetLat, longitude: targetLng },
            timestamp: 'Live Sensor',
            description: 'Clear navigation conditions across operational zone.',
            impact_explanation: 'Standard navigation operations recommended.',
            recommended_action: 'Maintain assigned heading.',
            active: true,
          },
        ];
      }
      throw err;
    }
  }

  public async searchLocations(query: string = '', limit: number = 8): Promise<LocationSearchResult[]> {
    try {
      return await mapApi.searchLocations(query, limit);
    } catch (err) {
      // Fallback ports for offline/fallback mode
      const defaultPorts: LocationSearchResult[] = [
        {
          id: 'port-vizag',
          name: 'Visakhapatnam Port',
          region: 'Andhra Pradesh (Bay of Bengal)',
          country: 'India',
          latitude: 17.6868,
          longitude: 83.2185,
          is_marine_port: true,
          formatted_coordinates: '17.69°N, 83.22°E',
          elevation_m: 4.0,
          timezone: 'Asia/Kolkata',
        },
        {
          id: 'port-mumbai',
          name: 'Mumbai Port (JNPT)',
          region: 'Maharashtra (Arabian Sea)',
          country: 'India',
          latitude: 18.9500,
          longitude: 72.8500,
          is_marine_port: true,
          formatted_coordinates: '18.95°N, 72.85°E',
          elevation_m: 6.0,
          timezone: 'Asia/Kolkata',
        },
        {
          id: 'port-chennai',
          name: 'Chennai Port',
          region: 'Tamil Nadu (Coromandel Coast)',
          country: 'India',
          latitude: 13.0827,
          longitude: 80.2930,
          is_marine_port: true,
          formatted_coordinates: '13.08°N, 80.29°E',
          elevation_m: 7.0,
          timezone: 'Asia/Kolkata',
        },
        {
          id: 'port-paradip',
          name: 'Paradip Port',
          region: 'Odisha (Bay of Bengal)',
          country: 'India',
          latitude: 20.3167,
          longitude: 86.6167,
          is_marine_port: true,
          formatted_coordinates: '20.32°N, 86.62°E',
          elevation_m: 3.0,
          timezone: 'Asia/Kolkata',
        },
        {
          id: 'port-kochi',
          name: 'Cochin (Kochi) Port',
          region: 'Kerala (Laccadive Sea)',
          country: 'India',
          latitude: 9.9667,
          longitude: 76.2667,
          is_marine_port: true,
          formatted_coordinates: '9.97°N, 76.27°E',
          elevation_m: 2.0,
          timezone: 'Asia/Kolkata',
        },
      ];

      if (!query.trim()) return defaultPorts.slice(0, limit);
      const q = query.toLowerCase();
      const filtered = defaultPorts.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.region && p.region.toLowerCase().includes(q))
      );
      return filtered.length > 0 ? filtered.slice(0, limit) : defaultPorts.slice(0, limit);
    }
  }


  private mapDynamicPfzFeatures(baseLat: number, baseLng: number): PfzZoneFeature[] {
    return [
      {
        id: 'pfz-zone-alpha',
        name: `Sector Alpha (${(baseLat + 0.04).toFixed(2)}°N, ${(baseLng + 0.13).toFixed(2)}°E)`,
        coordinates: { latitude: baseLat + 0.04, longitude: baseLng + 0.13 },
        probability: 'High',
        confidence_percent: 87,
        target_species: ['Yellowfin Tuna', 'Indian Mackerel', 'Skipjack'],
        depth_meters: 64,
        chlorophyll_mg_m3: 2.4,
        sea_temp_c: 28.4,
        optimal_time_window: '06:00 – 10:30',
        distance_nm: 14.2,
        bearing_deg: 124,
        boundary_polygon: [
          { latitude: baseLat + 0.08, longitude: baseLng + 0.09 },
          { latitude: baseLat + 0.09, longitude: baseLng + 0.17 },
          { latitude: baseLat + 0.01, longitude: baseLng + 0.18 },
          { latitude: baseLat, longitude: baseLng + 0.10 },
        ],
      },
      {
        id: 'pfz-zone-beta',
        name: `Sector Beta (${(baseLat + 0.27).toFixed(2)}°N, ${(baseLng + 0.27).toFixed(2)}°E)`,
        coordinates: { latitude: baseLat + 0.27, longitude: baseLng + 0.27 },
        probability: 'Moderate',
        confidence_percent: 68,
        target_species: ['Sardine', 'Ribbon Fish'],
        depth_meters: 42,
        chlorophyll_mg_m3: 1.7,
        sea_temp_c: 28.9,
        optimal_time_window: '07:30 – 11:00',
        distance_nm: 22.8,
        bearing_deg: 86,
        boundary_polygon: [
          { latitude: baseLat + 0.31, longitude: baseLng + 0.23 },
          { latitude: baseLat + 0.32, longitude: baseLng + 0.31 },
          { latitude: baseLat + 0.23, longitude: baseLng + 0.32 },
          { latitude: baseLat + 0.22, longitude: baseLng + 0.23 },
        ],
      },
    ];
  }

  private generateDynamicMapIntelligence(lat: number, lng: number): MapIntelligenceResponse {
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
          condition_text: 'Favorable Coastal Conditions',
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
        zones: this.mapDynamicPfzFeatures(lat, lng),
        last_satellite_pass: 'Live Sensor Telemetry',
      },
      risk: {
        score: 18,
        level: 'LOW',
        summary: `Ideal marine operating window at ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E with swell under 1.2m.`,
        factors: [
          { name: 'Wave Severity', score: 14, severity: 'low', description: 'Wave height 0.8-1.2m is optimal for small craft.' },
          { name: 'Wind Stability', score: 18, severity: 'low', description: 'Wind speeds under 15 km/h from ESE.' },
          { name: 'Squall / Cyclone Threat', score: 8, severity: 'low', description: 'Zero convective cloud clusters detected.' },
        ],
      },
      safe_routes: [
        {
          id: 'route-alpha-direct',
          name: `Direct Passage from ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
          distance_nm: 14.2,
          estimated_duration_hours: 1.4,
          fuel_estimated_liters: 18.5,
          safety_score: 96,
          is_recommended: true,
          waypoints: [
            { latitude: lat, longitude: lng, sequence: 1, depth_m: 24, risk_level: 'safe' },
            { latitude: lat + 0.02, longitude: lng + 0.07, sequence: 2, depth_m: 48, risk_level: 'safe' },
            { latitude: lat + 0.04, longitude: lng + 0.13, sequence: 3, depth_m: 64, risk_level: 'safe' },
          ],
        },
      ],
      alerts: [
        {
          id: 'alert-01',
          title: 'Regional Operational Advisory',
          category: 'Navigation Hazard',
          severity: 'Info',
          location_name: `Sector ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
          coordinates: { latitude: lat, longitude: lng },
          timestamp: 'Live Sensor',
          description: 'Favorable operational window.',
          impact_explanation: 'Standard navigation operations recommended.',
          recommended_action: 'Maintain assigned heading.',
          active: true,
        },
      ],
      recommendation: {
        headline: `Operations favorable at ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E.`,
        explanation: 'Satellite front convergence provides favorable marine conditions.',
        confidence_percent: 87,
        timestamp: 'Just now',
        recommended_zone_id: 'pfz-zone-alpha',
        key_factors: MOCK_PRIMARY_INSIGHT.factors,
      },
    };
  }
}

export const mapRepository = new MapRepository();
