import {
  MarineConditions,
  MarineMetric,
} from './marine.types';
import { getOpenMeteoMarineData } from './providers/openMeteoMarine.provider';

export async function getMarineConditions(
  latitude: number,
  longitude: number,
): Promise<MarineConditions> {
  const marineData = await getOpenMeteoMarineData(
    latitude,
    longitude,
  );

  const metrics: MarineMetric[] = [
    {
      id: 'sea_temp',
      value: marineData.seaTemperature,
      unit: '°C',
      trend: 'stable',
      delta: null,
      history: [],
      available: marineData.seaTemperature !== null,
    },
    {
      id: 'wave_height',
      value: marineData.waveHeight,
      unit: 'm',
      trend: 'stable',
      delta: null,
      history: [],
      available: marineData.waveHeight !== null,
    },
    {
      id: 'wind_speed',
      value: null,
      unit: 'km/h',
      trend: 'stable',
      delta: null,
      history: [],
      available: false,
    },
    {
      id: 'chlorophyll',
      value: null,
      unit: 'mg/m³',
      trend: 'stable',
      delta: null,
      history: [],
      available: false,
    },
  ];

  return {
    location: {
      latitude,
      longitude,
    },
    metrics,
    source: ['Open-Meteo'],
    lastUpdated: new Date().toISOString(),
  };
}