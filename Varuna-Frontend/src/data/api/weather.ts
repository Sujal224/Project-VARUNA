/**
 * VARUNA Weather API
 */

import { apiClient } from './client';
import { WeatherIntelligence, WeatherForecastItem } from '../../domain/models/mapIntelligence';

export const weatherApi = {
  async getWeatherIntelligence(lat: number, lng: number): Promise<WeatherIntelligence> {
    return apiClient.get<WeatherIntelligence>('/weather/intelligence', {
      params: { lat, lng },
    });
  },

  async getForecast(lat: number, lng: number, days: number = 3): Promise<WeatherForecastItem[]> {
    return apiClient.get<WeatherForecastItem[]>('/weather/forecast', {
      params: { lat, lng, days },
    });
  },
};
