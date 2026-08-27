/**
 * VARUNA AIS Vessel Domain Models
 * Live Automatic Identification System (AIS) transponder telemetry and maritime radar contracts.
 */

import { Coordinates } from './mapIntelligence';

export interface VesselCollisionRisk {
  level: 'SAFE' | 'CAUTION' | 'DANGER';
  cpa_nm: number; // Closest Point of Approach in NM
  tcpa_minutes: number; // Time to CPA in minutes
  description: string;
}

export interface VesselWaypoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed_knots: number;
}

export interface VesselLiveItem {
  mmsi: string;
  name: string;
  callsign?: string;
  ship_type: string;
  flag_country: string;
  latitude: number;
  longitude: number;
  speed_knots: number;
  course_deg: number;
  heading_deg: number;
  nav_status: string;
  destination: string;
  eta?: string;
  length_m: number;
  beam_m: number;
  draught_m: number;
  distance_nm: number;
  bearing_deg: number;
  collision_risk: VesselCollisionRisk;
  last_ais_signal: string;
  recent_track?: VesselWaypoint[];
}

export interface VesselRadarResponse {
  origin_coordinates: Coordinates;
  search_radius_nm: number;
  total_vessels_tracked: number;
  vessels: VesselLiveItem[];
  nearest_vessel?: VesselLiveItem;
  active_collision_warnings: number;
}
