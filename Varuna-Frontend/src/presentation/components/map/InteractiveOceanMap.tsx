/**
 * Interactive Ocean Map Component
 * Powered by MapLibre Marine Vector & Raster Engine with luxury HUD nautical styling.
 */

import React from 'react';
import { VarunaMapLibreEngine, VarunaMapLibreEngineProps } from './VarunaMapLibreEngine';

export interface MapMarkerLocation {
  id: string;
  type: 'pfz' | 'anchor' | 'wave' | 'hazard' | 'vessel' | 'cyclone';
  name: string;
  region: string;
  coordinates: string;
  lat: number;
  lng: number;
  condition: string;
  metrics: {
    seaTemp: string;
    tempTrend: string;
    waveHeight: string;
    waveStatus: string;
    windSpeed: string;
    windStatus: string;
    chlorophyll: string;
    chloroStatus: string;
  };
  alerts: Array<{
    id: string;
    title: string;
    severity: 'Moderate' | 'Low Risk' | 'High';
    type: 'current' | 'advisory' | 'cyclone';
  }>;
}

export interface InteractiveOceanMapProps extends VarunaMapLibreEngineProps {}

export const InteractiveOceanMap: React.FC<InteractiveOceanMapProps> = (props) => {
  return <VarunaMapLibreEngine {...props} />;
};
