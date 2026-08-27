/**
 * VARUNA Core Domain Models
 * Contains shared entity interfaces used across the presentation layer,
 * repositories, and API clients.
 */

export * from './mapIntelligence';

// ==========================================
// 1. User & Authentication Models
// ==========================================
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: 'captain' | 'crew' | 'fleet_manager' | 'researcher';
  harborHomePort?: string;
  licenseNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSession {
  user: UserProfile | null;
  idToken: string | null;
  refreshToken?: string | null;
  expiresAt?: number;
  isAuthenticated: boolean;
}

// ==========================================
// 2. Vessel Models
// ==========================================
export interface VesselState {
  id: string;
  name: string;
  callSign: string;
  position: { lat: number; lng: number; x: number; y: number };
  heading: number;
  speedKnots: number;
  destination: string;
  eta: string;
  fuelPercent: number;
  lengthMeters?: number;
  vesselType?: 'trawler' | 'gillnetter' | 'longliner' | 'catamaran' | 'patrol';
  maxRangeNm?: number;
}

export type Vessel = VesselState;

// ==========================================
// 3. Marine Metrics & Conditions
// ==========================================
export interface OceanMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  delta?: string;
  status: string;
  trend: 'up' | 'down' | 'stable';
  icon: 'thermometer' | 'waves' | 'wind' | 'science';
  sparkline: number[];
  colorMode?: 'cyan' | 'emerald' | 'amber';
}

// ==========================================
// 4. Potential Fishing Zones (PFZ)
// ==========================================
export interface PfzZone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  probability: 'High' | 'Moderate' | 'Low';
  confidencePercent: number;
  species: string[];
  depthMeters: number;
  chlorophyllConcentration: string;
  seaTemp: string;
  optimalTimeWindow: string;
  distanceNm: number;
  bearingDeg: number;
  boundaryPoints: { x: number; y: number }[];
}

export type PFZZone = PfzZone;

// ==========================================
// 5. Marine Alerts & Warnings
// ==========================================
export interface MarineAlert {
  id: string;
  title: string;
  category: 'Cyclone' | 'High Swell' | 'Gale Wind' | 'Navigation Hazard' | 'Advisory';
  severity: 'Critical' | 'Warning' | 'Advisory' | 'Info';
  location: string;
  timestamp: string;
  description: string;
  impactExplanation: string;
  recommendedAction: string;
  active: boolean;
}

// ==========================================
// 6. Insights & Recommendations
// ==========================================
export interface InsightFactor {
  name: string;
  score: number;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface VarunaInsight {
  headline: string;
  explanation: string;
  confidencePercent: number;
  timestamp: string;
  factors: InsightFactor[];
  recommendedZoneId: string;
}

export type Recommendation = VarunaInsight;

// ==========================================
// 7. AI Assistant & Conversations
// ==========================================
export interface ChatMessage {
  id: string;
  sender: 'user' | 'varuna';
  text: string;
  timestamp: string;
  insight?: VarunaInsight;
  suggestedActions?: string[];
}

export interface AIConversation {
  id: string;
  title: string;
  startedAt: string;
  messages: ChatMessage[];
}

// ==========================================
// 8. Push / In-App Notifications
// ==========================================
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type:
    | 'Cyclone Warning'
    | 'High Wave Warning'
    | 'Strong Wind Warning'
    | 'Route Hazard'
    | 'Marine Alert'
    | 'New PFZ Detected'
    | 'System Alert';
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

// ==========================================
// 9. Offline Caching
// ==========================================
export interface OfflineCacheStatus {
  isOfflineReady: boolean;
  lastSynced: string;
  cacheSizeBytes: number;
  cachedSectorsCount: number;
  cachedTilesCount: number;
}
