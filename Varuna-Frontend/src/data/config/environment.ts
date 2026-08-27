/**
 * VARUNA Environment & Centralized API Configuration
 * Auto-discovers backend IP for seamless physical device (LAN / Wi-Fi),
 * emulator, and web connectivity with zero manual config.
 */

import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_V1_PREFIX: string;
  API_TIMEOUT_MS: number;
  USE_MOCK_DATA_FALLBACK: boolean;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  MAPTILER_API_KEY: string;
  MAP_TILE_SERVER_URL: string;
  OPEN_SEA_MAP_URL: string;
  MAPTILER_OCEAN_STYLE_URL: string;
  MAPTILER_SATELLITE_STYLE_URL: string;
  MAPTILER_DARK_STYLE_URL: string;
  IS_PRODUCTION: boolean;
}

const extractIpFromHost = (host: string | null | undefined): string | null => {
  if (!host) return null;
  // Format could be "192.168.1.5:8081" or "exp://192.168.1.5:8081" or "http://192.168.1.5:8081"
  const clean = host.replace(/^[a-zA-Z]+:\/\//, '');
  const ip = clean.split(':')[0].split('/')[0];
  if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
    return ip;
  }
  return null;
};

const resolveBackendBaseUrl = (): string => {
  // 1. If explicit environment variable is set
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // 2. Extract from NativeModules SourceCode (bundle download URL on Android/iOS)
  const scriptUrl: string | undefined = NativeModules.SourceCode?.scriptURL;
  if (scriptUrl) {
    const ip = extractIpFromHost(scriptUrl);
    if (ip) {
      return `http://${ip}:8000`;
    }
  }

  // 3. Auto-detect host IP from Expo Metro bundler connection across all Expo SDK variants
  const possibleHosts = [
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).expoGoConfig?.developer?.debuggerHost,
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any).manifest2?.extra?.expoClient?.hostUri,
    Constants.expoConfig?.hostUri,
    (Constants as any).experienceUrl,
    (Constants as any).linkingUri,
    (Constants as any).manifest?.debuggerHost,
  ];

  for (const host of possibleHosts) {
    const ip = extractIpFromHost(host);
    if (ip) {
      return `http://${ip}:8000`;
    }
  }

  // 4. Fallback for Web vs Android vs iOS
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  // 5. Default physical LAN IP of the host development machine
  // Fallback to active Wi-Fi subnet IP 10.19.192.22
  return 'http://10.19.192.22:8000';
};

const getEnvVar = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const MAPTILER_KEY = getEnvVar('EXPO_PUBLIC_MAPTILER_KEY', 'QNyvsXNdaNX1BMZUMwQB');

export const ENV: EnvironmentConfig = {
  API_BASE_URL: resolveBackendBaseUrl(),
  API_V1_PREFIX: '/api/v1',
  API_TIMEOUT_MS: 10000,
  USE_MOCK_DATA_FALLBACK: getEnvVar('EXPO_PUBLIC_USE_MOCK_FALLBACK', 'true') === 'true',
  FIREBASE_API_KEY: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY', 'AIzaSyMockKeyForDevOnly_Varuna'),
  FIREBASE_AUTH_DOMAIN: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'project-varuna.firebaseapp.com'),
  FIREBASE_PROJECT_ID: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'project-varuna'),
  FIREBASE_STORAGE_BUCKET: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'project-varuna.appspot.com'),
  MAPTILER_API_KEY: MAPTILER_KEY,
  MAP_TILE_SERVER_URL: `https://api.maptiler.com/maps/ocean/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  OPEN_SEA_MAP_URL: getEnvVar('EXPO_PUBLIC_OPENSEAMAP_URL', 'https://tiles.openseamap.org/seamap/{z}/{x}/{y}.png'),
  MAPTILER_OCEAN_STYLE_URL: `https://api.maptiler.com/maps/ocean/style.json?key=${MAPTILER_KEY}`,
  MAPTILER_SATELLITE_STYLE_URL: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
  MAPTILER_DARK_STYLE_URL: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${ENV.API_BASE_URL}${ENV.API_V1_PREFIX}${cleanEndpoint}`;
};
