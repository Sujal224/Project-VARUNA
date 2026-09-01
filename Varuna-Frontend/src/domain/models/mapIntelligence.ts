/**
 * VARUNA Map Intelligence & Geospatial Data Contracts
 * Defines strongly typed contracts for Map Intelligence API (POST /api/v1/map/intelligence),
 * PFZ tracking, marine hazards, and navigation corridors.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  minLatitude: number;
  minLongitude: number;
  maxLatitude: number;
  maxLongitude: number;
}

export interface MarineConditions {
  sea_temperature: number; // in °C (e.g. 28.4)
  wave_height: number; // in meters (e.g. 1.2)
  wave_speed: number; // in km/h or knots (e.g. 14)
  chlorophyll: number; // in mg/m³ (e.g. 2.4)
  swell_direction_deg?: number; // 0-360°
  swell_period_sec?: number; // e.g. 9
  wind_direction_deg?: number; // e.g. 120
  salinity_psu?: number; // e.g. 34.8
  current_speed_knots?: number; // e.g. 1.4
  current_direction_deg?: number;
  surface_visibility_km?: number;
}

export interface WeatherConditionItem {
  temperature_c: number;
  humidity_percent: number;
  barometric_pressure_hpa: number;
  wind_speed_kmh: number;
  wind_gust_kmh: number;
  condition_text: string;
  icon: string;
  uv_index: number;
  visibility_km: number;
}

export interface WeatherForecastItem {
  timestamp: string; // ISO 8601 or HH:mm
  time_label: string;
  temp_c: number;
  wave_height_m: number;
  wind_speed_kmh: number;
  precipitation_probability: number;
  condition: string;
  icon: string;
}

export interface WeatherIntelligence {
  current: WeatherConditionItem;
  forecast: WeatherForecastItem[];
  sunrise?: string;
  sunset?: string;
  tide_state?: 'Low Ebb' | 'High Flood' | 'Slack';
}

export interface PfzZoneFeature {
  id: string;
  name: string;
  coordinates: Coordinates;
  probability: 'High' | 'Moderate' | 'Low';
  confidence_percent: number;
  target_species: string[];
  depth_meters: number;
  chlorophyll_mg_m3: number;
  sea_temp_c: number;
  optimal_time_window: string;
  distance_nm: number;
  bearing_deg: number;
  boundary_polygon: Coordinates[];
}

export interface RiskFactor {
  name: string;
  score: number; // 0 - 100
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
}

export interface RiskAssessment {
  score: number; // 0 - 100 (0 = safe, 100 = critical danger)
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary: string;
  factors: RiskFactor[];
}

export interface SafeRouteWaypoint extends Coordinates {
  sequence: number;
  depth_m?: number;
  risk_level?: 'safe' | 'caution' | 'danger';
  notes?: string;
}

export interface SafeRoute {
  id: string;
  name: string;
  distance_nm: number;
  estimated_duration_hours: number;
  fuel_estimated_liters: number;
  safety_score: number;
  waypoints: SafeRouteWaypoint[];
  is_recommended: boolean;
}

export interface MapAlertItem {
  id: string;
  title: string;
  category: 'Cyclone' | 'High Swell' | 'Gale Wind' | 'Navigation Hazard' | 'Advisory' | 'Current';
  severity: 'Critical' | 'Warning' | 'Advisory' | 'Info' | 'Moderate' | 'Low Risk';
  location_name: string;
  coordinates?: Coordinates;
  timestamp: string;
  description: string;
  impact_explanation: string;
  recommended_action: string;
  active: boolean;
}

export interface MapRecommendation {
  headline: string;
  explanation: string;
  confidence_percent: number;
  timestamp: string;
  recommended_zone_id: string;
  key_factors: Array<{
    name: string;
    score: number;
    description: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

/**
 * Main Map Intelligence Request Payload
 * POST /api/v1/map/intelligence
 */
export interface MapIntelligenceRequest {
  latitude: number;
  longitude: number;
  radius_km?: number;
  target_species?: string[];
  vessel_id?: string;
}

/**
 * Main Map Intelligence API Response Contract
 */
export interface MapIntelligenceResponse {
  user_location: Coordinates;
  region_name?: string;
  nearest_ocean?: string;
  conditions: MarineConditions;
  weather: WeatherIntelligence;
  pfz: {
    zones: PfzZoneFeature[];
    last_satellite_pass?: string;
  };
  risk: RiskAssessment;
  safe_routes: SafeRoute[];
  alerts: MapAlertItem[];
  recommendation?: MapRecommendation;
}
