/**
 * VARUNA Real-Time Marine Map & Intelligence Engine
 * Clean, modern, minimalist dark nautical map engine.
 * Renders real WebGL MapLibre GL on Web,
 * and 100% visible, jet-black obsidian interactive tile map on Android Expo Go & iOS.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crosshair,
  Layers,
} from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';
import { MapMarkerLocation } from './InteractiveOceanMap';
import { mapRepository } from '../../../data/repositories/mapRepository';
import { MapIntelligenceResponse, Coordinates } from '../../../domain/models/mapIntelligence';
import { vesselsApi } from '../../../data/api/vessels';
import { VesselRadarResponse } from '../../../domain/models/vessel';
import { ENV } from '../../../data/config/environment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 460;

export interface VarunaMapLibreEngineProps {
  activeLayer: 'layers' | 'vessels' | 'heatmap' | 'more';
  selectedLocation: MapMarkerLocation;
  onSelectLocation: (loc: MapMarkerLocation) => void;
  zoomLevel: number;
  onLocateMe?: () => void;
  userCoordinates?: Coordinates;
  speedKnots?: number;
  headingDeg?: number;
}

export const VarunaMapLibreEngine: React.FC<VarunaMapLibreEngineProps> = ({
  activeLayer,
  selectedLocation,
  onSelectLocation,
  zoomLevel,
  userCoordinates,
  speedKnots,
  headingDeg,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const webViewRef = useRef<WebView | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const [mapIntel, setMapIntel] = useState<MapIntelligenceResponse | null>(null);
  const [radarData, setRadarData] = useState<VesselRadarResponse | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const centerLat = userCoordinates?.latitude ?? 17.68;
  const centerLng = userCoordinates?.longitude ?? 83.21;
  const liveSpeed = speedKnots ?? 8.4;
  const liveCourse = headingDeg ?? 120;

  // 1. Fetch live map intelligence and AIS radar from backend
  useEffect(() => {
    mapRepository
      .getMapIntelligence({ latitude: centerLat, longitude: centerLng })
      .then((data) => setMapIntel(data))
      .catch((e) => console.warn('[VarunaMap] Intel fetch error:', e));

    vesselsApi
      .getVesselRadar(centerLat, centerLng, 45, liveSpeed, liveCourse)
      .then((res) => setRadarData(res))
      .catch((e) => console.warn('[VarunaMap] Radar fetch error:', e));
  }, [centerLat, centerLng, liveSpeed, liveCourse]);

  // 2. React to dynamic location selection and zoom changes in Native WebView
  useEffect(() => {
    if (Platform.OS === 'web' || !webViewRef.current) return;

    const targetLat = selectedLocation?.lat ?? centerLat;
    const targetLng = selectedLocation?.lng ?? centerLng;
    // Dynamic zoom mapping: 1.0 -> 13, 1.15 -> 14, 1.3 -> 15, 1.45 -> 16, 0.85 -> 12
    const targetZoom = Math.max(9, Math.min(18, Math.round(13 * (zoomLevel || 1.0))));

    const js = `
      if (window.mapInstance) {
        window.mapInstance.flyTo([${targetLat}, ${targetLng}], ${targetZoom}, {
          animate: true,
          duration: 0.8
        });
      }
      true;
    `;
    webViewRef.current.injectJavaScript(js);
  }, [selectedLocation?.lat, selectedLocation?.lng, zoomLevel, centerLat, centerLng]);

  // 3. Web MapLibre GL instance on Web platform
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapContainerRef.current) return;

    let isCancelled = false;

    if (typeof document !== 'undefined' && !document.getElementById('maplibre-gl-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-gl-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }

    const initMapInstance = (maplibregl: any) => {
      if (isCancelled || !mapContainerRef.current || !maplibregl) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const key = ENV.MAPTILER_API_KEY;
      let styleUrl = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${key}`;
      if (activeLayer === 'heatmap') {
        styleUrl = `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
      } else if (activeLayer === 'more') {
        styleUrl = `https://api.maptiler.com/maps/ocean/style.json?key=${key}`;
      }

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [centerLng, centerLat],
        zoom: 12.5,
        pitch: 18,
        bearing: 0,
        attributionControl: false,
      });

      map.on('load', () => {
        if (!isCancelled) {
          setMapLoaded(true);

          try {
            if (!map.getSource('openseamap')) {
              map.addSource('openseamap', {
                type: 'raster',
                tiles: [ENV.OPEN_SEA_MAP_URL],
                tileSize: 256,
              });

              map.addLayer({
                id: 'openseamap-layer',
                type: 'raster',
                source: 'openseamap',
                minzoom: 6,
                maxzoom: 18,
                paint: { 'raster-opacity': 0.85 },
              });
            }
          } catch (e) {
            console.warn('[VarunaMap] OpenSeaMap load error:', e);
          }
        }
      });

      mapInstanceRef.current = map;
    };

    if (typeof window !== 'undefined' && (window as any).maplibregl) {
      initMapInstance((window as any).maplibregl);
    } else {
      import('maplibre-gl').then((mod) => {
        const maplibregl = (mod as any).default || mod;
        if (typeof window !== 'undefined') {
          (window as any).maplibregl = maplibregl;
        }
        initMapInstance(maplibregl);
      }).catch((err) => {
        console.warn('[VarunaMap] Error loading maplibre-gl:', err);
      });
    }

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLayer]);

  // 4. Generate 100% visible, fully interactive Leaflet HTML for Android / iOS WebView
  const leafletHtml = useMemo(() => {
    const pfzZonesJson = JSON.stringify(mapIntel?.pfz?.zones || []);
    const safeRoutesJson = JSON.stringify(mapIntel?.safe_routes || []);
    const vesselsJson = JSON.stringify(radarData?.vessels || []);
    const seaTemp = mapIntel?.conditions?.sea_temperature ?? 28.4;
    const waveHeight = mapIntel?.conditions?.wave_height ?? 1.2;
    const windSpeed = mapIntel?.conditions?.wave_speed ?? 14;
    const initialZoom = Math.max(9, Math.min(18, Math.round(13 * (zoomLevel || 1.0))));

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>VARUNA Nautical Engine</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background-color: #02060e; overflow: hidden; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }

    /* VARUNA Luminous Oceanic Filter: Bright, crystal-clear roads, vivid water, rich marine indigo terrain */
    .nautical-dark-tiles {
      filter: invert(100%) hue-rotate(185deg) brightness(120%) contrast(92%) saturate(1.4);
      -webkit-filter: invert(100%) hue-rotate(185deg) brightness(120%) contrast(92%) saturate(1.4);
    }

    /* Command Vessel GPS Beacon */
    .user-beacon-wrapper {
      position: relative;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .user-pulse-ring {
      position: absolute;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(0, 229, 255, 0.22);
      border: 1.5px solid rgba(0, 229, 255, 0.7);
      animation: sonarPing 2.2s infinite ease-out;
    }
    @keyframes sonarPing {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .user-core-circle {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #081d33;
      border: 2px solid #00e5ff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px rgba(0, 229, 255, 0.85);
      z-index: 10;
    }
    .user-gps-badge {
      position: absolute;
      bottom: -16px;
      background: rgba(0, 229, 255, 0.95);
      color: #02060e;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.5px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
      letter-spacing: 0.2px;
      z-index: 20;
    }

    /* PFZ Floating Badges */
    .pfz-marker-pill {
      background: rgba(6, 24, 44, 0.94);
      border: 1.4px solid #00e5ff;
      color: #00e5ff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 229, 255, 0.4);
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      cursor: pointer;
    }

    /* AIS Fleet Chevrons */
    .vessel-radar-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
      cursor: pointer;
    }
  </style>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
  <div id="map"></div>

  <script>
    function initializeVarunaMap() {
      if (typeof L === 'undefined') {
        setTimeout(initializeVarunaMap, 50);
        return;
      }

      var centerLat = ${centerLat};
      var centerLng = ${centerLng};
      var activeLayer = "${activeLayer}";
      var liveSpeed = ${liveSpeed};
      var liveCourse = ${liveCourse};
      var seaTemp = ${seaTemp};
      var waveHeight = ${waveHeight};
      var windSpeed = ${windSpeed};
      var pfzZones = ${pfzZonesJson};
      var safeRoutes = ${safeRoutesJson};
      var vessels = ${vesselsJson};
      var initialZoom = ${initialZoom};

      // 1. Initialize Leaflet Map Instance (Stored in window.mapInstance for dynamic React Native control)
      var map = L.map('map', {
        center: [centerLat, centerLng],
        zoom: initialZoom,
        minZoom: 3,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false
      });
      window.mapInstance = map;

      // 2. Add Base Tile Layers (with maxNativeZoom so zooming to maximum upscales smoothly without black tiles)
      if (activeLayer === 'heatmap') {
        // Satellite Imagery + Place Labels
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          minZoom: 3,
          maxZoom: 20,
          maxNativeZoom: 18
        }).addTo(map);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          minZoom: 3,
          maxZoom: 20,
          maxNativeZoom: 18,
          opacity: 0.9
        }).addTo(map);
      } else if (activeLayer === 'more') {
        // Ocean Bathymetry + Ocean Reference
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
          minZoom: 3,
          maxZoom: 20,
          maxNativeZoom: 18
        }).addTo(map);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}', {
          minZoom: 3,
          maxZoom: 20,
          maxNativeZoom: 18,
          opacity: 0.85
        }).addTo(map);
      } else {
        // 100% Free, Permanent Zero-Watermark OpenStreetMap Basemap with Maritime Dark Filter
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          minZoom: 3,
          maxZoom: 20,
          maxNativeZoom: 18,
          className: 'nautical-dark-tiles'
        }).addTo(map);
      }

      // OpenSeaMap Nautical Seamarks & Depth Markings
      L.tileLayer('https://tiles.openseamap.org/seamap/{z}/{x}/{y}.png', {
        minZoom: 3,
        maxZoom: 20,
        maxNativeZoom: 18,
        opacity: 0.85
      }).addTo(map);

      // Bridge: Send marker selection event to React Native
      function notifyReactNative(payload) {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }

      // 3. User Command Vessel Beacon
      var userIcon = L.divIcon({
        className: 'user-beacon-icon-wrapper',
        html: '<div class="user-beacon-wrapper">' +
                '<div class="user-pulse-ring"></div>' +
                '<div class="user-core-circle">' +
                  '<div style="transform: rotate(' + liveCourse + 'deg); display: flex; align-items: center; justify-content: center;">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="#00e5ff" stroke="#00e5ff" stroke-width="1.5"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>' +
                  '</div>' +
                '</div>' +
                '<div class="user-gps-badge">YOU (GPS)</div>' +
              '</div>',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      var userMarker = L.marker([centerLat, centerLng], { icon: userIcon }).addTo(map);
      userMarker.on('click', function() {
        notifyReactNative({
          id: 'vessel-varuna',
          type: 'vessel',
          name: 'Matsya Setu IV (Command)',
          region: 'Live Vessel Position',
          coordinates: centerLat.toFixed(4) + '°N, ' + centerLng.toFixed(4) + '°E',
          lat: centerLat,
          lng: centerLng,
          condition: 'Safe Navigation (' + liveSpeed + ' kts)',
          metrics: {
            seaTemp: seaTemp + ' °C',
            tempTrend: 'Live Telemetry',
            waveHeight: waveHeight + ' m',
            waveStatus: '• Stable',
            windSpeed: windSpeed + ' km/h',
            windStatus: '↓ Optimal',
            chlorophyll: '2.4 mg/m³',
            chloroStatus: '• High'
          },
          alerts: [
            { id: 'a1', title: 'Command Vessel • Safe Channel', severity: 'Low Risk', type: 'advisory' }
          ]
        });
      });

      // 4. Render PFZ Polygons and Centroid Badges
      if (pfzZones && pfzZones.length > 0) {
        pfzZones.forEach(function(zone) {
          if (zone.boundary_polygon && zone.boundary_polygon.length > 0) {
            var polyCoords = zone.boundary_polygon.map(function(p) { return [p.latitude, p.longitude]; });
            L.polygon(polyCoords, {
              color: '#00e5ff',
              weight: 2.0,
              dashArray: '5, 5',
              fillColor: '#00e5ff',
              fillOpacity: 0.18
            }).addTo(map);
          }

          var pfzIcon = L.divIcon({
            className: 'pfz-badge-icon',
            html: '<div class="pfz-marker-pill">🐟 PFZ ' + zone.confidence_percent + '%</div>',
            iconSize: [80, 24],
            iconAnchor: [40, 12]
          });

          var pfzMarker = L.marker([zone.coordinates.latitude, zone.coordinates.longitude], { icon: pfzIcon }).addTo(map);
          pfzMarker.on('click', function() {
            notifyReactNative({
              id: zone.id,
              type: 'pfz',
              name: zone.name,
              region: 'Thermal Front Upwelling',
              coordinates: zone.coordinates.latitude.toFixed(2) + '°N, ' + zone.coordinates.longitude.toFixed(2) + '°E',
              lat: zone.coordinates.latitude,
              lng: zone.coordinates.longitude,
              condition: 'Optimal Window (' + (zone.optimal_time_window || '06:00 - 10:30') + ')',
              metrics: {
                seaTemp: (zone.sea_temp_c || seaTemp) + ' °C',
                tempTrend: 'Thermal Front',
                waveHeight: waveHeight + ' m',
                waveStatus: '• Stable',
                windSpeed: windSpeed + ' km/h',
                windStatus: '↓ Optimal',
                chlorophyll: (zone.chlorophyll_mg_m3 || '2.4') + ' mg/m³',
                chloroStatus: '• High Bloom'
              },
              alerts: [
                {
                  id: 'alert-' + zone.id,
                  title: 'Target Species: ' + (zone.target_species ? zone.target_species.slice(0, 3).join(', ') : 'Tuna, Mackerel'),
                  severity: 'Low Risk',
                  type: 'advisory'
                }
              ]
            });
          });
        });
      }

      // 5. Render Safe Routes Polyline
      if (safeRoutes && safeRoutes.length > 0 && safeRoutes[0].waypoints) {
        var routeCoords = safeRoutes[0].waypoints.map(function(wp) { return [wp.latitude, wp.longitude]; });
        L.polyline(routeCoords, {
          color: '#00e5ff',
          weight: 2.8,
          dashArray: '6, 6',
          opacity: 0.9
        }).addTo(map);
      }

      // 6. Render AIS Fleet Vessels
      if ((activeLayer === 'vessels' || activeLayer === 'layers') && vessels && vessels.length > 0) {
        vessels.forEach(function(vessel) {
          var isDanger = vessel.collision_risk && vessel.collision_risk.level === 'DANGER';
          var isCaution = vessel.collision_risk && vessel.collision_risk.level === 'CAUTION';
          var color = isDanger ? '#ef4444' : isCaution ? '#f59e0b' : '#38bdf8';
          var bg = isDanger ? '#2d0a0f' : isCaution ? '#2d1808' : '#081a2e';

          var vIcon = L.divIcon({
            className: 'vessel-icon-wrapper',
            html: '<div class="vessel-radar-dot" style="background: ' + bg + '; border: 1.5px solid ' + color + ';">' +
                    '<div style="transform: rotate(' + (vessel.heading_deg || 0) + 'deg); display: flex; align-items: center; justify-content: center;">' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="' + color + '" stroke="' + color + '" stroke-width="1"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>' +
                    '</div>' +
                  '</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          var vMarker = L.marker([vessel.latitude, vessel.longitude], { icon: vIcon }).addTo(map);
          vMarker.on('click', function() {
            notifyReactNative({
              id: 'ais-' + vessel.mmsi,
              type: 'vessel',
              name: vessel.name,
              region: (vessel.ship_type || 'Vessel') + ' • Flag: ' + (vessel.flag_country || 'IN'),
              coordinates: vessel.latitude.toFixed(2) + '°N, ' + vessel.longitude.toFixed(2) + '°E',
              lat: vessel.latitude,
              lng: vessel.longitude,
              condition: 'AIS Live • CPA: ' + (vessel.collision_risk ? vessel.collision_risk.cpa_nm : '4.2') + ' NM',
              metrics: {
                seaTemp: seaTemp + ' °C',
                tempTrend: 'Live Telemetry',
                waveHeight: vessel.speed_knots + ' kts',
                waveStatus: '• Course ' + vessel.course_deg + '°',
                windSpeed: 'CPA ' + (vessel.collision_risk ? vessel.collision_risk.cpa_nm : '4.2') + ' NM',
                windStatus: (vessel.collision_risk ? vessel.collision_risk.level : 'SAFE'),
                chlorophyll: 'MMSI ' + vessel.mmsi,
                chloroStatus: '• ' + (vessel.nav_status || 'Underway')
              },
              alerts: [
                {
                  id: 'ais-alert-' + vessel.mmsi,
                  title: vessel.collision_risk ? vessel.collision_risk.description : 'Standard Navigation',
                  severity: isDanger ? 'High' : isCaution ? 'Moderate' : 'Low Risk',
                  type: 'advisory'
                }
              ]
            });
          });
        });
      }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      initializeVarunaMap();
    } else {
      window.addEventListener('DOMContentLoaded', initializeVarunaMap);
      window.addEventListener('load', initializeVarunaMap);
    }
  </script>
</body>
</html>
    `;
  }, [centerLat, centerLng, activeLayer, liveSpeed, liveCourse, mapIntel, radarData, zoomLevel]);

  // Handle messages from WebView to React Native
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.id) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelectLocation(data);
      }
    } catch (err) {
      console.warn('[VarunaMap] WebView message parse error:', err);
    }
  };

  return (
    <View style={styles.mapContainer}>
      {/* 1. Real WebGL MapLibre on Web / 100% Real Interactive Leaflet Tile Map on Native */}
      {Platform.OS === 'web' ? (
        <div
          ref={mapContainerRef as any}
          style={{
            width: '100%',
            height: `${MAP_HEIGHT}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#030712',
          }}
        />
      ) : (
        <View style={styles.nativeWebViewWrapper}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: leafletHtml }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            scalesPageToFit={false}
            scrollEnabled={false}
            bounces={false}
            onMessage={handleWebViewMessage}
          />
        </View>
      )}

      {/* 2. Top Obsidian Dissolve */}
      <LinearGradient
        colors={['#02060e', 'rgba(2, 6, 14, 0.4)', 'transparent']}
        locations={[0, 0.4, 1]}
        style={styles.topVignette}
        pointerEvents="none"
      />

      {/* 3. Bottom Obsidian Dissolve */}
      <LinearGradient
        colors={['transparent', 'rgba(2, 6, 14, 0.5)', '#02060e']}
        locations={[0, 0.6, 1]}
        style={styles.bottomVignette}
        pointerEvents="none"
      />

      {/* 4. Top-Left Coordinates HUD */}
      <View style={styles.telemetryHudPill}>
        <Crosshair size={11} color="#00e5ff" />
        <Text style={styles.telemetryHudText}>
          {centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E
        </Text>
      </View>

      {/* 5. Top-Right Active Layer Tag */}
      <View style={styles.layerTagPill}>
        <Layers size={11} color="#00e5ff" />
        <Text style={styles.layerTagText}>
          {activeLayer === 'layers'
            ? 'Nautical Dark'
            : activeLayer === 'vessels'
            ? `AIS Radar (${radarData?.vessels?.length ?? 7} Ships)`
            : activeLayer === 'heatmap'
            ? 'Satellite Hybrid'
            : 'Seamarks & Bathymetry'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: MAP_HEIGHT,
    position: 'relative',
    backgroundColor: '#030712',
    overflow: 'hidden',
  },
  nativeWebViewWrapper: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#030712',
  },
  webView: {
    width: SCREEN_WIDTH,
    height: MAP_HEIGHT,
    backgroundColor: '#030712',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    zIndex: 10,
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    zIndex: 10,
  },
  telemetryHudPill: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 18, 34, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 50,
  },
  telemetryHudText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#38bdf8',
  },
  layerTagPill: {
    position: 'absolute',
    top: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 18, 34, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 50,
  },
  layerTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#e2edfd',
  },
});
