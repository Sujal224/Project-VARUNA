/**
 * VARUNA Live Telemetry Hook
 * Reactive hook subscribing to continuous GPS tracking and real-time marine weather telemetry.
 *
 * FIXES:
 * - Debounces fetchTelemetry calls so rapid GPS updates don't flood the backend
 * - Only fetches telemetry when coordinates actually change meaningfully
 * - Properly tracks GPS lock state for UI indicators
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { locationService, LiveGpsState, GpsPermissionState } from '../services/locationService';
import { mapRepository } from '../repositories/mapRepository';
import {
  MapIntelligenceResponse,
  Coordinates,
  MarineConditions,
  WeatherIntelligence,
  PfzZoneFeature,
  RiskAssessment,
  SafeRoute,
  MapAlertItem,
} from '../../domain/models/mapIntelligence';

export interface UseLiveTelemetryResult {
  gpsState: LiveGpsState;
  coordinates: Coordinates;
  locationName: string;
  regionName: string;
  isCustomLocation: boolean;
  isGpsLocked: boolean;
  permissionStatus: GpsPermissionState;
  requestGpsPermission: () => Promise<boolean>;
  selectLocation: (coords: Coordinates, name: string, region?: string) => void;
  resetToGps: () => void;
  conditions: MarineConditions | null;
  weather: WeatherIntelligence | null;
  pfzZones: PfzZoneFeature[];
  risk: RiskAssessment | null;
  safeRoutes: SafeRoute[];
  alerts: MapAlertItem[];
  isLoading: boolean;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

// Minimum coordinate change (in degrees, ~110m) to trigger a new telemetry fetch
const MIN_FETCH_DELTA_DEG = 0.005;
// Minimum time between telemetry fetches (ms)
const FETCH_DEBOUNCE_MS = 2000;

export const useLiveTelemetry = (): UseLiveTelemetryResult => {
  const [gpsState, setGpsState] = useState<LiveGpsState>(locationService.getCurrentState());
  const [locationName, setLocationName] = useState<string>(locationService.getSelectedLocationName());
  const [regionName, setRegionName] = useState<string>(locationService.getSelectedRegionName());
  const [isCustomLocation, setIsCustomLocation] = useState<boolean>(locationService.isCustomLocationSelected());
  const [intelligence, setIntelligence] = useState<MapIntelligenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Refs for debouncing and deduplication
  const lastFetchedCoordsRef = useRef<Coordinates | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const pendingFetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchTelemetry = useCallback(async (coords: Coordinates) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const data = await mapRepository.getMapIntelligence({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setIntelligence(data);
      setLastUpdated(Date.now());
      lastFetchedCoordsRef.current = coords;
      lastFetchTimeRef.current = Date.now();
    } catch (err) {
      console.warn('[useLiveTelemetry] Error fetching live telemetry:', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  /**
   * Smart fetch — only calls the backend if coords changed meaningfully
   * and enough time has passed since the last fetch.
   */
  const smartFetch = useCallback((coords: Coordinates) => {
    const now = Date.now();
    const lastCoords = lastFetchedCoordsRef.current;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;

    // Check if coordinates changed meaningfully
    const coordsChanged = !lastCoords ||
      Math.abs(coords.latitude - lastCoords.latitude) >= MIN_FETCH_DELTA_DEG ||
      Math.abs(coords.longitude - lastCoords.longitude) >= MIN_FETCH_DELTA_DEG;

    if (!coordsChanged) return;

    // Clear any pending scheduled fetch
    if (pendingFetchTimerRef.current) {
      clearTimeout(pendingFetchTimerRef.current);
      pendingFetchTimerRef.current = null;
    }

    if (timeSinceLastFetch >= FETCH_DEBOUNCE_MS) {
      // Enough time has passed, fetch immediately
      fetchTelemetry(coords);
    } else {
      // Schedule a deferred fetch
      pendingFetchTimerRef.current = setTimeout(() => {
        fetchTelemetry(coords);
        pendingFetchTimerRef.current = null;
      }, FETCH_DEBOUNCE_MS - timeSinceLastFetch);
    }
  }, [fetchTelemetry]);

  useEffect(() => {
    // Subscribe to real-time GPS / user location updates from locationService
    const unsubscribe = locationService.subscribe((newGpsState) => {
      setGpsState(newGpsState);
      setLocationName(locationService.getSelectedLocationName());
      setRegionName(locationService.getSelectedRegionName());
      setIsCustomLocation(locationService.isCustomLocationSelected());

      // Only fetch telemetry when we have meaningful coordinate changes
      smartFetch(newGpsState.coords);
    });

    return () => {
      unsubscribe();
      if (pendingFetchTimerRef.current) {
        clearTimeout(pendingFetchTimerRef.current);
      }
    };
  }, [smartFetch]);

  const selectLocation = useCallback((coords: Coordinates, name: string, region?: string) => {
    // Reset fetch tracking so the new location always triggers a fetch
    lastFetchedCoordsRef.current = null;
    locationService.setUserSelectedLocation(coords, name, region);
  }, []);

  const resetToGps = useCallback(() => {
    lastFetchedCoordsRef.current = null;
    locationService.resetToDeviceGps();
  }, []);

  const refresh = useCallback(async () => {
    lastFetchedCoordsRef.current = null;
    await fetchTelemetry(gpsState.coords);
  }, [fetchTelemetry, gpsState.coords]);

  const requestGpsPermission = useCallback(async () => {
    return await locationService.requestPermissions();
  }, []);

  return {
    gpsState,
    coordinates: gpsState.coords,
    locationName: locationName || (gpsState.isGpsLocked ? 'Live Vessel GPS' : 'Local Waters'),
    regionName: regionName || intelligence?.region_name || intelligence?.nearest_ocean || 'Maritime Zone',
    isCustomLocation,
    isGpsLocked: gpsState.isGpsLocked,
    permissionStatus: gpsState.permissionStatus,
    requestGpsPermission,
    selectLocation,
    resetToGps,
    conditions: intelligence?.conditions ?? null,
    weather: intelligence?.weather ?? null,
    pfzZones: intelligence?.pfz?.zones ?? [],
    risk: intelligence?.risk ?? null,
    safeRoutes: intelligence?.safe_routes ?? [],
    alerts: intelligence?.alerts ?? [],
    isLoading,
    lastUpdated,
    refresh,
  };
};
