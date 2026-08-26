export interface MarineLocation {
  latitude: number;
  longitude: number;
}

export interface MarineMetric {
  id: 'sea_temp' | 'wave_height' | 'wind_speed' | 'chlorophyll';
  value: number | null;
  unit: '°C' | 'm' | 'km/h' | 'mg/m³';
  trend: 'up' | 'down' | 'stable';
  delta: number | null;
  history: number[];
  available: boolean;
}

export interface MarineConditions {
  location: MarineLocation;
  metrics: MarineMetric[];
  source: string[];
  lastUpdated: string;
}