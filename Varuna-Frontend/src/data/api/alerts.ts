/**
 * VARUNA Alerts API
 */

import { apiClient } from './client';
import { MarineAlert } from '../../domain/models/types';

export const alertsApi = {
  async getActiveAlerts(lat?: number, lng?: number): Promise<MarineAlert[]> {
    return apiClient.get<MarineAlert[]>('/alerts/active', {
      params: { lat, lng },
    });
  },

  async getAlertById(alertId: string): Promise<MarineAlert> {
    return apiClient.get<MarineAlert>(`/alerts/${alertId}`);
  },

  async dismissAlert(alertId: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/alerts/${alertId}/dismiss`);
  },
};
