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
}

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

export interface VarunaInsight {
  headline: string;
  explanation: string;
  confidencePercent: number;
  timestamp: string;
  factors: {
    name: string;
    score: number;
    description: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  recommendedZoneId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'varuna';
  text: string;
  timestamp: string;
  insight?: VarunaInsight;
  suggestedActions?: string[];
}

export interface OfflineCacheStatus {
  isOfflineReady: boolean;
  lastSynced: string;
  cacheSizeBytes: number;
  cachedSectorsCount: number;
  cachedTilesCount: number;
}
