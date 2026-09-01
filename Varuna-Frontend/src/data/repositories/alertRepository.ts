/**
 * VARUNA Alert Repository
 */

import { alertsApi } from '../api/alerts';
import { MarineAlert } from '../../domain/models/types';
import { MOCK_ALERTS } from '../mock/marineData';
import { ENV } from '../config/environment';

class AlertRepository {
  public async getActiveAlerts(lat?: number, lng?: number): Promise<MarineAlert[]> {
    try {
      return await alertsApi.getActiveAlerts(lat, lng);
    } catch (err) {
      if (ENV.USE_MOCK_DATA_FALLBACK) {
        return MOCK_ALERTS;
      }
      throw err;
    }
  }

  public async getAlertById(alertId: string): Promise<MarineAlert | undefined> {
    const alerts = await this.getActiveAlerts();
    return alerts.find((a) => a.id === alertId);
  }
}

export const alertRepository = new AlertRepository();
