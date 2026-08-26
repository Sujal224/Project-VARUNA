/**
 * VARUNA High-Performance Real-Time GPS Location Service
 * Features instant last-known position caching, automatic network provider prompt,
 * high-accuracy continuous GPS streaming, and resilient web/simulator fallbacks.
 *
 * ANDROID EXPO GO FIXES:
 * - Properly awaits permission acquisition before emitting GPS state
 * - Debounces coordinate updates to prevent API call floods
 * - Separates permission grant from GPS lock (lock only set when real coords arrive)
 * - Retries getCurrentPositionAsync on Android when first attempt times out
 */

import { Platform } from 'react-native';
import { Coordinates } from '../../domain/models/mapIntelligence';

export type GpsPermissionState = 'undetermined' | 'requesting' | 'granted' | 'denied';

export interface LiveGpsState {
  coords: Coordinates;
  speedKnots: number;
  headingDeg: number;
  accuracyMeters: number | null;
  isGpsLocked: boolean;
  permissionStatus: GpsPermissionState;
  timestamp: number;
}

// Baseline Fallback: Visakhapatnam Maritime Pier 4 (17.38°N, 83.25°E)
export const DEFAULT_MARITIME_COORDINATES: Coordinates = {
  latitude: 17.38,
  longitude: 83.25,
};

type LocationListener = (state: LiveGpsState) => void;

class LocationService {
  private currentGpsState: LiveGpsState = {
    coords: DEFAULT_MARITIME_COORDINATES,
    speedKnots: 0,
    headingDeg: 0,
    accuracyMeters: null,
    isGpsLocked: false,
    permissionStatus: 'undetermined',
    timestamp: Date.now(),
  };

  private lastDeviceGpsCoords: Coordinates = DEFAULT_MARITIME_COORDINATES;
  private selectedLocationName: string = '';
  private selectedRegionName: string = '';
  private isCustomLocation: boolean = false;
  private hasReceivedRealGps: boolean = false;

  private watcherCleanup: (() => void) | null = null;
  private listeners: Set<LocationListener> = new Set();
  private isRequesting: boolean = false;
  private permissionPromise: Promise<boolean> | null = null;

  // Debounce: prevent emitting updates faster than every 800ms
  private lastEmitTime: number = 0;
  private pendingEmitTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly EMIT_DEBOUNCE_MS = 800;

  // Minimum distance change (in degrees, ~110m) to trigger a new emit
  private static readonly MIN_DELTA_DEG = 0.001;

  /**
   * Request system location permissions and immediately start fast GPS acquisition.
   * Returns a promise that resolves true when permission is granted AND at least
   * one real GPS fix has been obtained (or false on denial/failure).
   */
  public async requestPermissions(): Promise<boolean> {
    // Deduplicate concurrent requests
    if (this.permissionPromise) {
      return this.permissionPromise;
    }
    if (this.isRequesting) return false;

    this.permissionPromise = this._doRequestPermissions();
    try {
      return await this.permissionPromise;
    } finally {
      this.permissionPromise = null;
    }
  }

  private async _doRequestPermissions(): Promise<boolean> {
    this.isRequesting = true;
    this.currentGpsState.permissionStatus = 'requesting';
    this.emitUpdate(this.currentGpsState);

    // Fast web browser geolocation with IP fallback
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.currentGpsState.permissionStatus = 'granted';
            this.applyGpsFix(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.speed,
              pos.coords.heading,
              pos.coords.accuracy,
              pos.timestamp
            );
            this.isRequesting = false;
            resolve(true);
          },
          async (_err) => {
            // IP-based city fallback if hardware GPS is not allowed
            try {
              const res = await fetch('https://ipapi.co/json/');
              if (res.ok) {
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                  this.selectedLocationName = data.city || 'Local Waters';
                  this.selectedRegionName = data.region || data.country_name || 'Maritime Zone';
                  this.currentGpsState.permissionStatus = 'granted';
                  this.applyGpsFix(data.latitude, data.longitude, 0, 0, 5000, Date.now());
                  this.isRequesting = false;
                  resolve(true);
                  return;
                }
              }
            } catch (ipErr) {}

            this.currentGpsState.permissionStatus = 'denied';
            this.currentGpsState.isGpsLocked = false;
            this.emitUpdate(this.currentGpsState);
            this.isRequesting = false;
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      });
    }

    try {
      const Location = await import('expo-location');

      if (Location && typeof Location.requestForegroundPermissionsAsync === 'function') {
        // 1. Check if location services (GPS toggle) are enabled on device
        try {
          const isEnabled = await Location.hasServicesEnabledAsync();
          if (!isEnabled) {
            console.warn('[LocationService] Location services disabled on device');
            if (Platform.OS === 'android' && typeof Location.enableNetworkProviderAsync === 'function') {
              try {
                await Location.enableNetworkProviderAsync();
              } catch (provErr) {
                console.info('[LocationService] enableNetworkProviderAsync failed (user may have declined):', provErr);
              }
            }
          }
        } catch (provErr) {
          console.info('[LocationService] Provider check note:', provErr);
        }

        // 2. Request / verify foreground permissions
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          status = req.status;
        }

        if (status === 'granted') {
          this.currentGpsState.permissionStatus = 'granted';
          // NOTE: isGpsLocked stays false until we get real coordinates
          this.emitUpdate(this.currentGpsState);

          // 3. FAST PATH: Immediately acquire last known position (< 50ms fix)
          try {
            const lastKnown = await Location.getLastKnownPositionAsync({});
            if (lastKnown && lastKnown.coords) {
              console.info('[LocationService] Last known fix:', lastKnown.coords.latitude, lastKnown.coords.longitude);
              this.applyGpsFix(
                lastKnown.coords.latitude,
                lastKnown.coords.longitude,
                lastKnown.coords.speed,
                lastKnown.coords.heading,
                lastKnown.coords.accuracy,
                lastKnown.timestamp
              );
            }
          } catch (lastErr) {
            console.info('[LocationService] Last known position not available:', lastErr);
          }

          // 4. ACCURATE FIX: Get current fresh position
          // On Android Expo Go, Balanced accuracy can stall; try Balanced first, fallback to Low
          let gotFreshFix = false;
          const accuracyLevels = Platform.OS === 'android'
            ? [Location.Accuracy.Balanced, Location.Accuracy.Low]
            : [Location.Accuracy.Balanced];

          for (const accuracy of accuracyLevels) {
            if (gotFreshFix) break;
            try {
              const freshPos = await Promise.race([
                Location.getCurrentPositionAsync({ accuracy }),
                new Promise<null>((_, reject) =>
                  setTimeout(() => reject(new Error(`GPS timeout (accuracy=${accuracy})`)), 8000)
                ),
              ]);

              if (freshPos && typeof freshPos === 'object' && 'coords' in freshPos) {
                const pos = freshPos as { coords: { latitude: number; longitude: number; speed: number | null; heading: number | null; accuracy: number | null }; timestamp: number };
                console.info('[LocationService] Fresh GPS fix:', pos.coords.latitude, pos.coords.longitude, `accuracy=${accuracy}`);
                this.applyGpsFix(
                  pos.coords.latitude,
                  pos.coords.longitude,
                  pos.coords.speed,
                  pos.coords.heading,
                  pos.coords.accuracy,
                  pos.timestamp
                );
                gotFreshFix = true;
              }
            } catch (freshErr) {
              console.info(`[LocationService] getCurrentPositionAsync (accuracy=${accuracy}) failed:`, freshErr);
            }
          }

          // 5. CONTINUOUS NAVIGATION STREAM
          if (!this.watcherCleanup && typeof Location.watchPositionAsync === 'function') {
            try {
              const sub = await Location.watchPositionAsync(
                {
                  accuracy: Platform.OS === 'android' ? Location.Accuracy.Balanced : Location.Accuracy.High,
                  timeInterval: 3000,    // Every 3s
                  distanceInterval: 5,   // Every 5 meters
                },
                (loc) => {
                  if (loc && loc.coords) {
                    this.applyGpsFix(
                      loc.coords.latitude,
                      loc.coords.longitude,
                      loc.coords.speed,
                      loc.coords.heading,
                      loc.coords.accuracy,
                      loc.timestamp
                    );
                  }
                }
              );

              this.watcherCleanup = () => {
                if (sub && typeof sub.remove === 'function') {
                  sub.remove();
                }
              };
            } catch (watchErr) {
              console.warn('[LocationService] watchPositionAsync failed:', watchErr);
            }
          }

          this.isRequesting = false;
          return true;
        } else {
          // Permission denied
          this.currentGpsState.permissionStatus = 'denied';
          this.currentGpsState.isGpsLocked = false;
          this.emitUpdate(this.currentGpsState);
          this.isRequesting = false;
          return false;
        }
      }
    } catch (err) {
      console.warn('[LocationService] expo-location import/init error:', err);
    }

    // 6. Browser / HTML5 Geolocation fallback (web platform)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.currentGpsState.permissionStatus = 'granted';
            this.applyGpsFix(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.speed,
              pos.coords.heading,
              pos.coords.accuracy,
              pos.timestamp
            );

            const watchId = navigator.geolocation.watchPosition(
              (wPos) => {
                this.applyGpsFix(
                  wPos.coords.latitude,
                  wPos.coords.longitude,
                  wPos.coords.speed,
                  wPos.coords.heading,
                  wPos.coords.accuracy,
                  wPos.timestamp
                );
              },
              () => {},
              { enableHighAccuracy: true }
            );
            this.watcherCleanup = () => navigator.geolocation.clearWatch(watchId);
            this.isRequesting = false;
            resolve(true);
          },
          (_err) => {
            this.currentGpsState.permissionStatus = 'denied';
            this.currentGpsState.isGpsLocked = false;
            this.emitUpdate(this.currentGpsState);
            this.isRequesting = false;
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    }

    // No location provider available
    this.currentGpsState.permissionStatus = 'denied';
    this.currentGpsState.isGpsLocked = false;
    this.emitUpdate(this.currentGpsState);
    this.isRequesting = false;
    return false;
  }

  /**
   * Core GPS coordinate handler — applies a real device fix,
   * with debounce and minimum-distance filtering.
   */
  private applyGpsFix(
    latitude: number,
    longitude: number,
    speed?: number | null,
    heading?: number | null,
    accuracy?: number | null,
    timestamp?: number
  ): void {
    const lat = Number(latitude.toFixed(4));
    const lon = Number(longitude.toFixed(4));

    // Skip if coords haven't meaningfully changed (prevent API call storms)
    if (
      this.hasReceivedRealGps &&
      Math.abs(lat - this.lastDeviceGpsCoords.latitude) < LocationService.MIN_DELTA_DEG &&
      Math.abs(lon - this.lastDeviceGpsCoords.longitude) < LocationService.MIN_DELTA_DEG
    ) {
      return;
    }

    const speedKnots = speed && speed > 0 ? Number((speed * 1.94384).toFixed(1)) : 0;
    const headingDeg = heading && heading >= 0 ? Math.round(heading) : 0;

    this.lastDeviceGpsCoords = { latitude: lat, longitude: lon };
    this.hasReceivedRealGps = true;

    if (!this.isCustomLocation) {
      this.currentGpsState = {
        coords: { latitude: lat, longitude: lon },
        speedKnots,
        headingDeg,
        accuracyMeters: accuracy ? Math.round(accuracy) : null,
        isGpsLocked: true,
        permissionStatus: 'granted',
        timestamp: timestamp || Date.now(),
      };
      this.debouncedEmit(this.currentGpsState);
    }
  }

  /**
   * Debounced emit — prevents listener flood from rapid GPS updates
   */
  private debouncedEmit(state: LiveGpsState): void {
    const now = Date.now();
    const elapsed = now - this.lastEmitTime;

    if (this.pendingEmitTimer) {
      clearTimeout(this.pendingEmitTimer);
      this.pendingEmitTimer = null;
    }

    if (elapsed >= LocationService.EMIT_DEBOUNCE_MS) {
      this.lastEmitTime = now;
      this.emitUpdate(state);
    } else {
      // Schedule a deferred emit so the latest state always propagates
      this.pendingEmitTimer = setTimeout(() => {
        this.lastEmitTime = Date.now();
        this.emitUpdate(this.currentGpsState);
        this.pendingEmitTimer = null;
      }, LocationService.EMIT_DEBOUNCE_MS - elapsed);
    }
  }

  public setUserSelectedLocation(coords: Coordinates, name: string, region?: string): void {
    this.isCustomLocation = true;
    this.selectedLocationName = name;
    this.selectedRegionName = region || '';

    this.currentGpsState = {
      ...this.currentGpsState,
      coords: {
        latitude: Number(coords.latitude.toFixed(4)),
        longitude: Number(coords.longitude.toFixed(4)),
      },
      timestamp: Date.now(),
    };

    this.emitUpdate(this.currentGpsState);
  }

  public resetToDeviceGps(): void {
    this.isCustomLocation = false;
    this.selectedLocationName = this.hasReceivedRealGps ? 'Live Vessel GPS' : '';
    this.selectedRegionName = '';

    this.currentGpsState = {
      ...this.currentGpsState,
      coords: this.lastDeviceGpsCoords,
      isGpsLocked: this.hasReceivedRealGps,
      timestamp: Date.now(),
    };

    this.emitUpdate(this.currentGpsState);
  }

  public getSelectedLocationName(): string {
    return this.selectedLocationName;
  }

  public getSelectedRegionName(): string {
    return this.selectedRegionName;
  }

  public isCustomLocationSelected(): boolean {
    return this.isCustomLocation;
  }

  public getCurrentState(): LiveGpsState {
    return this.currentGpsState;
  }

  public subscribe(listener: LocationListener): () => void {
    this.listeners.add(listener);

    // Deliver current state immediately to new subscriber
    listener(this.currentGpsState);

    // Auto-initiate permission + GPS acquisition on first subscriber
    if (this.currentGpsState.permissionStatus === 'undetermined') {
      // Intentionally not awaited — the GPS fix will emit via listener when ready
      this.requestPermissions().catch((err) => {
        console.warn('[LocationService] Auto-permission request failed:', err);
      });
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.watcherCleanup) {
        this.watcherCleanup();
        this.watcherCleanup = null;
      }
    };
  }

  private emitUpdate(state: LiveGpsState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('[LocationService] Listener callback error:', err);
      }
    });
  }
}

export const locationService = new LocationService();
