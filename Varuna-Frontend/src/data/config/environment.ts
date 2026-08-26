/**
 * VARUNA Environment & Centralized API Configuration
 * Auto-discovers backend IP for seamless physical device (LAN / Wi-Fi),
 * emulator, and web connectivity with zero manual config.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_V1_PREFIX: string;
  API_TIMEOUT_MS: number;
  USE_MOCK_DATA_FALLBACK: boolean;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  MAP_TILE_SERVER_URL: string;
  OPEN_SEA_MAP_URL: string;
  IS_PRODUCTION: boolean;
}

const resolveBackendBaseUrl = (): string => {
  // 1. If explicit environment variable is set
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // 2. Auto-detect host IP from Expo Metro bundler connection (for physical devices over Wi-Fi)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // 3. Fallback for Android emulator vs Web / iOS simulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

const getEnvVar = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const ENV: EnvironmentConfig = {
  API_BASE_URL: resolveBackendBaseUrl(),
  API_V1_PREFIX: '/api/v1',
  API_TIMEOUT_MS: 10000,
  USE_MOCK_DATA_FALLBACK: getEnvVar('EXPO_PUBLIC_USE_MOCK_FALLBACK', 'true') === 'true',
  FIREBASE_API_KEY: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY', 'AIzaSyMockKeyForDevOnly_Varuna'),
  FIREBASE_AUTH_DOMAIN: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', 'project-varuna.firebaseapp.com'),
  FIREBASE_PROJECT_ID: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'project-varuna'),
  FIREBASE_STORAGE_BUCKET: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'project-varuna.appspot.com'),
  MAP_TILE_SERVER_URL: getEnvVar('EXPO_PUBLIC_MAP_TILE_URL', 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'),
  OPEN_SEA_MAP_URL: getEnvVar('EXPO_PUBLIC_OPENSEAMAP_URL', 'https://tiles.openseamap.org/seamap/{z}/{x}/{y}.png'),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${ENV.API_BASE_URL}${ENV.API_V1_PREFIX}${cleanEndpoint}`;
};
