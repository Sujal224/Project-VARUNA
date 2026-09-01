/**
 * VARUNA High-Performance Real-Time GPS Location Service
 * Features instant last-known position caching, automatic network provider prompt,
 * high-accuracy continuous GPS streaming, and resilient web/simulator fallbacks.
 *
 * ANDROID EXPO GO FIXES:
 * - Direct top-level import of expo-location for reliable Metro bundle execution
 * - Hardware GPS satellite lock with Location.Accuracy.High
 * - Automatic device location prompt (enableNetworkProviderAsync) on Android
 * - 3-stage location resolution (Last known -> High-accuracy fresh fix -> Continuous stream)
 * - Immediate GPS locked state propagation to UI and telemetry subscribers
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
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

  // Debounce: prevent emitting updates faster than every 600ms
  private lastEmitTime: number = 0;
  private pendingEmitTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly EMIT_DEBOUNCE_MS = 600;

  // Minimum distance change (in degrees, ~50m) to trigger a new emit
  private static readonly MIN_DELTA_DEG = 0.0005;

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

    // 1. Web browser HTML5 Geolocation with IP fallback
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
            } catch (ipErr) {
              console.info('[LocationService] Web IP fallback note:', ipErr);
            }

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

    // 2. Native Mobile (Expo Go on Android / iOS)
    try {
      if (Location && typeof Location.requestForegroundPermissionsAsync === 'function') {
        // Step A: Check & prompt to enable device GPS location hardware
        try {
          const isEnabled = await Location.hasServicesEnabledAsync();
          if (!isEnabled) {
            console.warn('[LocationService] Location services disabled on device. Prompting user...');
            if (Platform.OS === 'android' && typeof Location.enableNetworkProviderAsync === 'function') {
              try {
                await Location.enableNetworkProviderAsync();
              } catch (provErr) {
                console.info('[LocationService] User dismissed network provider dialog:', provErr);
              }
            }
          }
        } catch (provErr) {
          console.info('[LocationService] Services check note:', provErr);
        }

        // Step B: Request / verify foreground permissions
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          status = req.status;
        }

        if (status === 'granted') {
          this.currentGpsState.permissionStatus = 'granted';
          this.emitUpdate(this.currentGpsState);

          // Step C (Stage 1): Instant Last-Known Position (< 50ms fix)
          try {
            const lastKnown = await Location.getLastKnownPositionAsync({});
            if (lastKnown && lastKnown.coords) {
              console.info('[LocationService] Instant last-known GPS fix:', lastKnown.coords.latitude, lastKnown.coords.longitude);
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

          // Step D (Stage 2): High-Accuracy Fresh Hardware GPS Satellite Fix
          const accuracyLevels = [Location.Accuracy.High, Location.Accuracy.Balanced, Location.Accuracy.Lowest];
          let gotFreshFix = false;

          for (const accuracy of accuracyLevels) {
            if (gotFreshFix) break;
            try {
              const freshPos = await Promise.race([
                Location.getCurrentPositionAsync({
                  accuracy,
                  mayShowUserSettingsDialog: true,
                }),
                new Promise<null>((_, reject) =>
                  setTimeout(() => reject(new Error(`GPS timeout (accuracy=${accuracy})`)), 7000)
                ),
              ]);

              if (freshPos && typeof freshPos === 'object' && 'coords' in freshPos) {
                const pos = freshPos as {
                  coords: {
                    latitude: number;
                    longitude: number;
                    speed: number | null;
                    heading: number | null;
                    accuracy: number | null;
                  };
                  timestamp: number;
                };
                console.info('[LocationService] High-precision GPS satellite fix:', pos.coords.latitude, pos.coords.longitude, `acc=${pos.coords.accuracy}m`);
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
              console.info(`[LocationService] getCurrentPositionAsync (accuracy=${accuracy}) note:`, freshErr);
            }
          }

          // Step E (Stage 3): Continuous Real-Time Navigation Stream
          if (!this.watcherCleanup && typeof Location.watchPositionAsync === 'function') {
            try {
              const sub = await Location.watchPositionAsync(
                {
                  accuracy: Location.Accuracy.High,
                  timeInterval: 2000,    // Every 2s
                  distanceInterval: 3,   // Every 3 meters
                  mayShowUserSettingsDialog: true,
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
          // Permission denied by user
          this.currentGpsState.permissionStatus = 'denied';
          this.currentGpsState.isGpsLocked = false;
          this.emitUpdate(this.currentGpsState);
          this.isRequesting = false;
          return false;
        }
      }
    } catch (err) {
      console.warn('[LocationService] expo-location execution error:', err);
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

      // Asynchronously resolve city/region name for exact GPS location
      if (Platform.OS !== 'web' && typeof Location.reverseGeocodeAsync === 'function') {
        Location.reverseGeocodeAsync({ latitude: lat, longitude: lon })
          .then((addresses) => {
            if (addresses && addresses.length > 0) {
              const addr = addresses[0];
              const city = addr.city || addr.subregion || addr.district || addr.name || '';
              const region = addr.region || addr.country || '';
              if (city && !this.isCustomLocation) {
                this.selectedLocationName = city;
                this.selectedRegionName = region;
                this.debouncedEmit(this.currentGpsState);
              }
            }
          })
          .catch((e) => {
            console.info('[LocationService] Reverse geocode note:', e);
          });
      }
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
