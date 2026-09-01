/**
 * VARUNA Weather Repository
 */

import { weatherApi } from '../api/weather';
import { WeatherIntelligence, WeatherForecastItem } from '../../domain/models/mapIntelligence';
import { OceanMetric } from '../../domain/models/types';
import { INITIAL_OCEAN_METRICS } from '../mock/marineData';
import { ENV } from '../config/environment';

class WeatherRepository {
  public async getOceanMetrics(): Promise<OceanMetric[]> {
    return INITIAL_OCEAN_METRICS;
  }

  public async getWeatherIntelligence(lat: number = 17.38, lng: number = 83.25): Promise<WeatherIntelligence> {
    try {
      return await weatherApi.getWeatherIntelligence(lat, lng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return {
          current: {
            temperature_c: 28.4,
            humidity_percent: 74,
            barometric_pressure_hpa: 1013,
            wind_speed_kmh: 14,
            wind_gust_kmh: 19,
            condition_text: 'Calm Swell, Favorable for Fishing',
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
        };
      }
      throw err;
    }
  }

  public async getForecast(lat: number = 17.38, lng: number = 83.25): Promise<WeatherForecastItem[]> {
    try {
      return await weatherApi.getForecast(lat, lng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        const intel = await this.getWeatherIntelligence(lat, lng);
        return intel.forecast;
      }
      throw err;
    }
  }
}

export const weatherRepository = new WeatherRepository();
