/**
 * VARUNA MapLibre Marine Vector & Raster Style Specification
 * Integrates MapTiler Ocean & Bathymetry, Satellite Hybrid, OpenSeaMap seamarks,
 * and dynamic GeoJSON marine telemetry layers.
 */

import { ENV } from '../../../data/config/environment';

export type MarineBasemapType = 'ocean' | 'satellite' | 'dark';

export const createMapTilerMarineStyle = (
  apiKey: string = ENV.MAPTILER_API_KEY,
  basemapType: MarineBasemapType = 'ocean'
) => {
  const isSatellite = basemapType === 'satellite';
  const isDark = basemapType === 'dark';

  const baseTiles = isSatellite
    ? [
        `https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${apiKey}`,
      ]
    : isDark
    ? [
        `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${apiKey}`,
        'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      ]
    : [
        // MapTiler Ocean & Bathymetry Basemap (Underwater Contours & Trenches)
        `https://api.maptiler.com/maps/ocean/256/{z}/{x}/{y}.png?key=${apiKey}`,
      ];

  return {
    version: 8,
    name: `VARUNA Marine ${basemapType.toUpperCase()} Intelligence`,
    metadata: {
      'mapbox:autocomposite': false,
      'mapbox:type': 'template',
    },
    sources: {
      // 1. Primary Global Marine Basemap
      'maptiler-marine-base': {
        type: 'raster',
        tiles: baseTiles,
        tileSize: 256,
        attribution: '© MapTiler © OpenStreetMap contributors © GEBCO',
        maxzoom: 19,
      },
      // 2. OpenSeaMap Nautical Chart Seamarks (Buoys, Lighthouses, Channels)
      'openseamap': {
        type: 'raster',
        tiles: ['https://tiles.openseamap.org/seamap/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenSeaMap contributors',
        maxzoom: 18,
      },
      // 3. Dynamic GeoJSON sources injected at runtime
      'pfz-zones': {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
      'safe-routes': {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
      'vessels': {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
      'alerts': {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
    },
    layers: [
      // 1. Base Marine Imagery / Ocean Floor Layer
      {
        id: 'maptiler-marine-base-layer',
        type: 'raster',
        source: 'maptiler-marine-base',
        minzoom: 0,
        maxzoom: 19,
        paint: {
          'raster-opacity': 0.98,
          'raster-contrast': isDark ? 0.1 : 0.05,
        },
      },
      // 2. OpenSeaMap Nautical Seamarks Overlay
      {
        id: 'openseamap-layer',
        type: 'raster',
        source: 'openseamap',
        minzoom: 3,
        maxzoom: 18,
        paint: {
          'raster-opacity': 0.9,
        },
      },
      // 3. PFZ Polygons Fill
      {
        id: 'pfz-polygons-fill',
        type: 'fill',
        source: 'pfz-zones',
        paint: {
          'fill-color': '#00e5ff',
          'fill-opacity': 0.22,
        },
      },
      // 4. PFZ Polygons Glow Border
      {
        id: 'pfz-polygons-border',
        type: 'line',
        source: 'pfz-zones',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 2.4,
          'line-dasharray': [3, 2],
        },
      },
      // 5. Safe Route Polylines
      {
        id: 'safe-routes-casing',
        type: 'line',
        source: 'safe-routes',
        paint: {
          'line-color': '#00e5ff',
          'line-width': 5,
          'line-opacity': 0.35,
          'line-blur': 3,
        },
      },
      {
        id: 'safe-routes-core',
        type: 'line',
        source: 'safe-routes',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.5,
          'line-dasharray': [4, 3],
        },
      },
      // 6. Hazard / Alert Points
      {
        id: 'alert-points-glow',
        type: 'circle',
        source: 'alerts',
        paint: {
          'circle-radius': 14,
          'circle-color': '#ef4444',
          'circle-opacity': 0.3,
          'circle-blur': 1,
        },
      },
      {
        id: 'alert-points-core',
        type: 'circle',
        source: 'alerts',
        paint: {
          'circle-radius': 6,
          'circle-color': '#f87171',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      },
      // 7. Vessel Live Position Marker
      {
        id: 'vessel-marker-pulse',
        type: 'circle',
        source: 'vessels',
        paint: {
          'circle-radius': 18,
          'circle-color': '#00e5ff',
          'circle-opacity': 0.25,
          'circle-blur': 1,
        },
      },
      {
        id: 'vessel-marker-core',
        type: 'circle',
        source: 'vessels',
        paint: {
          'circle-radius': 7,
          'circle-color': '#00e5ff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      },
    ],
  };
};

export const VARUNA_MAPLIBRE_STYLE = createMapTilerMarineStyle(ENV.MAPTILER_API_KEY, 'ocean');
