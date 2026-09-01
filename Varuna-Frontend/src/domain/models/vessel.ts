/**
 * Domain Models for AIS Vessel Tracking and Collision Risk
 */

export interface CollisionRiskAnalysis {
  cpa_nm: number;
  tcpa_minutes: number;
  level: 'SAFE' | 'CAUTION' | 'DANGER';
  is_head_on: boolean;
  is_crossing: boolean;
  description: string;
}

export interface VesselLiveItem {
  mmsi: number;
  name: string;
  callsign: string;
  ship_type: string;
  flag_country: string;
  latitude: number;
  longitude: number;
  speed_knots: number;
  course_deg: number;
  heading_deg: number;
  nav_status: string;
  destination: string;
  eta: string;
  length_meters: number;
  beam_meters: number;
  last_updated: string;
  collision_risk: CollisionRiskAnalysis;
}

export interface VesselRadarResponse {
  reference_point: {
    latitude: number;
    longitude: number;
    speed_knots: number;
    course_deg: number;
  };
  radar_range_nm: number;
  total_vessels: number;
  danger_count: number;
  caution_count: number;
  safe_count: number;
  vessels: VesselLiveItem[];
}
