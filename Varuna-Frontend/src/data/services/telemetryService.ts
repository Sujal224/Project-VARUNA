import { INITIAL_OCEAN_METRICS, MOCK_PFZ_ZONES, MOCK_ALERTS, MOCK_PRIMARY_INSIGHT, MOCK_VESSEL } from '../mock/marineData';
import { OceanMetric, PfzZone, MarineAlert, VarunaInsight, VesselState, OfflineCacheStatus } from '../../domain/models/types';

class TelemetryService {
  private metrics: OceanMetric[] = INITIAL_OCEAN_METRICS;
  private pfzZones: PfzZone[] = MOCK_PFZ_ZONES;
  private alerts: MarineAlert[] = MOCK_ALERTS;
  private primaryInsight: VarunaInsight = MOCK_PRIMARY_INSIGHT;
  private vessel: VesselState = MOCK_VESSEL;

  getMetrics(): OceanMetric[] {
    return this.metrics;
  }

  getPfzZones(): PfzZone[] {
    return this.pfzZones;
  }

  getAlerts(): MarineAlert[] {
    return this.alerts;
  }

  getPrimaryInsight(): VarunaInsight {
    return this.primaryInsight;
  }

  getVessel(): VesselState {
    return this.vessel;
  }

  getOfflineStatus(): OfflineCacheStatus {
    return {
      isOfflineReady: true,
      lastSynced: '12m ago',
      cacheSizeBytes: 48.2 * 1024 * 1024, // 48.2 MB
      cachedSectorsCount: 6,
      cachedTilesCount: 1420,
    };
  }
}

export const telemetryService = new TelemetryService();
