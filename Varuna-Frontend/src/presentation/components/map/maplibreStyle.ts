/**
 * VARUNA MapLibre Marine Vector & Raster Style Specification
 * Dark cybernetic ocean style matching the Varuna luxury aesthetic
 * with OpenSeaMap nautical seamarks and bathymetry depth lines.
 */

export const VARUNA_MAPLIBRE_STYLE = {
  version: 8,
  name: 'VARUNA Marine Dark Intelligence',
  metadata: {
    'mapbox:autocomposite': false,
    'mapbox:type': 'template',
  },
  sources: {
    // Dark Matter OpenStreetMap Basemap
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CARTO',
      maxzoom: 19,
    },
    // OpenSeaMap Nautical Chart Seamarks (Buoys, Lighthouses, Channels)
    'openseamap': {
      type: 'raster',
      tiles: ['https://tiles.openseamap.org/seamap/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenSeaMap contributors',
      maxzoom: 18,
    },
    // Dynamic GeoJSON sources injected at runtime
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
    // 1. Dark Basemap Layer
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.95,
        'raster-contrast': 0.1,
        'raster-brightness-min': 0.05,
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
        'raster-opacity': 0.85,
      },
    },
    // 3. PFZ Polygons Fill
    {
      id: 'pfz-polygons-fill',
      type: 'fill',
      source: 'pfz-zones',
      paint: {
        'fill-color': '#00e5ff',
        'fill-opacity': 0.18,
      },
    },
    // 4. PFZ Polygons Glow Border
    {
      id: 'pfz-polygons-border',
      type: 'line',
      source: 'pfz-zones',
      paint: {
        'line-color': '#00e5ff',
        'line-width': 2.2,
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
        'line-opacity': 0.3,
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
        'circle-opacity': 0.25,
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
        'circle-opacity': 0.22,
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
