/**
 * VARUNA Real-Time MapTiler Marine Intelligence Engine
 * Clean, modern, minimalist dark nautical map engine.
 * Renders real MapTiler Dataviz Dark / Satellite Hybrid, OpenSeaMap nautical seamarks,
 * satellite PFZ polygons, and minimal moving AIS vessel markers without UI clutter.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Anchor,
  Waves,
  AlertTriangle,
  Fish,
  Navigation,
  Crosshair,
  Layers,
} from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';
import { MapMarkerLocation } from './InteractiveOceanMap';
import { mapRepository } from '../../../data/repositories/mapRepository';
import { MapIntelligenceResponse, Coordinates } from '../../../domain/models/mapIntelligence';
import { vesselsApi } from '../../../data/api/vessels';
import { VesselLiveItem, VesselRadarResponse } from '../../../domain/models/vessel';
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
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [mapIntel, setMapIntel] = useState<MapIntelligenceResponse | null>(null);
  const [radarData, setRadarData] = useState<VesselRadarResponse | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const centerLat = userCoordinates?.latitude ?? 17.68;
  const centerLng = userCoordinates?.longitude ?? 83.21;
  const liveSpeed = speedKnots ?? 8.4;
  const liveCourse = headingDeg ?? 120;

  // Determine MapTiler Style URL (Deep Native Dark Mode by default)
  const getStyleUrl = (layer: string) => {
    const key = ENV.MAPTILER_API_KEY;
    if (layer === 'heatmap') {
      return `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`;
    }
    if (layer === 'more') {
      return `https://api.maptiler.com/maps/ocean/style.json?key=${key}`;
    }
    // Default: Clean MapTiler Dataviz Dark (deep oceanic navy & crisp contrast)
    return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${key}`;
  };

  // 1. Fetch live map intelligence and AIS radar
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

  // 2. Initialize Real MapTiler GL on Web
  useEffect(() => {
    if (Platform.OS !== 'web' || !mapContainerRef.current) return;

    let isCancelled = false;

    // Inject MapLibre CSS if not already in document
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

      const styleUrl = getStyleUrl(activeLayer);

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [centerLng, centerLat],
        zoom: 8.5,
        pitch: 18, // Clean subtle tilt
        bearing: 0,
        attributionControl: false,
      });

      map.on('load', () => {
        if (!isCancelled) {
          setMapLoaded(true);

          // Add OpenSeaMap Nautical Chart Seamarks layer
          try {
            if (!map.getSource('openseamap')) {
              map.addSource('openseamap', {
                type: 'raster',
                tiles: ['https://tiles.openseamap.org/seamap/{z}/{x}/{y}.png'],
                tileSize: 256,
              });
              map.addLayer({
                id: 'openseamap-layer',
                type: 'raster',
                source: 'openseamap',
                minzoom: 3,
                maxzoom: 18,
                paint: { 'raster-opacity': 0.75 },
              });
            }
          } catch (err) {}
        }
      });

      mapInstanceRef.current = map;
    };

    if (typeof window !== 'undefined' && (window as any).maplibregl) {
      initMapInstance((window as any).maplibregl);
    } else if (typeof document !== 'undefined') {
      const existingScript = document.getElementById('maplibre-gl-js') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          initMapInstance((window as any).maplibregl);
        });
      } else {
        const script = document.createElement('script');
        script.id = 'maplibre-gl-js';
        script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
        script.onload = () => {
          initMapInstance((window as any).maplibregl);
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeLayer]);

  // 3. Update Camera when location or zoom changes
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.flyTo({
        center: [selectedLocation.lng || centerLng, selectedLocation.lat || centerLat],
        zoom: 8.5 * zoomLevel,
        essential: true,
        duration: 1000,
      });
    }
  }, [selectedLocation, zoomLevel, mapLoaded]);

  // 4. Inject Dynamic PFZ Polygons & Safe Routes into MapLibre GL
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !mapIntel) return;

    try {
      // 1. PFZ Polygons FeatureCollection
      const pfzFeatures = (mapIntel.pfz?.zones || []).map((zone) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [zone.boundary_polygon.map((p) => [p.longitude, p.latitude])],
        },
        properties: {
          id: zone.id,
          name: zone.name,
          confidence: zone.confidence_percent,
        },
      }));

      const pfzGeoJson = {
        type: 'FeatureCollection',
        features: pfzFeatures,
      };

      if (map.getSource('varuna-pfz-source')) {
        map.getSource('varuna-pfz-source').setData(pfzGeoJson);
      } else {
        map.addSource('varuna-pfz-source', {
          type: 'geojson',
          data: pfzGeoJson,
        });

        map.addLayer({
          id: 'varuna-pfz-fill',
          type: 'fill',
          source: 'varuna-pfz-source',
          paint: {
            'fill-color': '#00e5ff',
            'fill-opacity': 0.16,
          },
        });

        map.addLayer({
          id: 'varuna-pfz-line',
          type: 'line',
          source: 'varuna-pfz-source',
          paint: {
            'line-color': '#00e5ff',
            'line-width': 2.0,
            'line-dasharray': [3, 2],
          },
        });
      }

      // 2. Safe Routes Polyline
      const routeFeatures = (mapIntel.safe_routes || []).map((route) => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route.waypoints.map((w) => [w.longitude, w.latitude]),
        },
        properties: {
          name: route.name,
        },
      }));

      const routeGeoJson = {
        type: 'FeatureCollection',
        features: routeFeatures,
      };

      if (map.getSource('varuna-route-source')) {
        map.getSource('varuna-route-source').setData(routeGeoJson);
      } else {
        map.addSource('varuna-route-source', {
          type: 'geojson',
          data: routeGeoJson,
        });

        map.addLayer({
          id: 'varuna-route-core',
          type: 'line',
          source: 'varuna-route-source',
          paint: {
            'line-color': '#00e5ff',
            'line-width': 2.2,
            'line-dasharray': [4, 3],
          },
        });
      }
    } catch (e) {
      console.warn('[VarunaMap] Layer injection error:', e);
    }
  }, [mapIntel, mapLoaded]);

  // 5. Render Clean, Minimalist, Non-Overlapping Maritime Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || Platform.OS !== 'web') return;

    const maplibregl = typeof window !== 'undefined' ? (window as any).maplibregl : null;
    if (!maplibregl) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. User Vessel Command Beacon (Clean Glowing Navigation Beacon)
    const userMarkerEl = document.createElement('div');
    userMarkerEl.style.position = 'relative';
    userMarkerEl.style.width = '36px';
    userMarkerEl.style.height = '36px';
    userMarkerEl.style.cursor = 'pointer';
    userMarkerEl.style.display = 'flex';
    userMarkerEl.style.alignItems = 'center';
    userMarkerEl.style.justifyContent = 'center';

    userMarkerEl.innerHTML = `
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(0, 229, 255, 0.18); border: 1px solid rgba(0, 229, 255, 0.5); animation: ping 2s infinite;"></div>
      <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #081d33; border: 2px solid #00e5ff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px #00e5ff88;">
        <div style="transform: rotate(${liveCourse}deg); display: flex; align-items: center; justify-content: center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#00e5ff" stroke="#00e5ff" stroke-width="1">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `;

    userMarkerEl.onclick = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelectLocation({
        id: 'vessel-varuna',
        type: 'vessel',
        name: 'Matsya Setu IV (Command)',
        region: 'Visakhapatnam Transit Channel',
        coordinates: `${centerLat.toFixed(2)}°N, ${centerLng.toFixed(2)}°E`,
        lat: centerLat,
        lng: centerLng,
        condition: `Safe Navigation (${liveSpeed} kts)`,
        metrics: {
          seaTemp: `${mapIntel?.conditions?.sea_temperature ?? 28.4} °C`,
          tempTrend: 'Live AIS',
          waveHeight: `${mapIntel?.conditions?.wave_height ?? 1.2} m`,
          waveStatus: '• Stable',
          windSpeed: `${mapIntel?.conditions?.wave_speed ?? 14} km/h`,
          windStatus: '↓ Optimal',
          chlorophyll: `${mapIntel?.conditions?.chlorophyll ?? 2.4} mg/m³`,
          chloroStatus: '• High',
        },
        alerts: [
          { id: 'a1', title: 'Command Vessel • Safe Channel', severity: 'Low Risk', type: 'advisory' },
        ],
      });
    };

    const userMarker = new maplibregl.Marker({ element: userMarkerEl })
      .setLngLat([centerLng, centerLat])
      .addTo(map);
    markersRef.current.push(userMarker);

    // 2. PFZ Centroid Badges (Clean 28px Fish Centroid)
    (mapIntel?.pfz?.zones || []).forEach((zone) => {
      const pfzEl = document.createElement('div');
      pfzEl.style.cursor = 'pointer';
      pfzEl.style.display = 'flex';
      pfzEl.style.alignItems = 'center';
      pfzEl.style.gap = '4px';
      pfzEl.style.backgroundColor = 'rgba(6, 24, 44, 0.90)';
      pfzEl.style.border = '1px solid #00e5ff';
      pfzEl.style.padding = '3px 8px';
      pfzEl.style.borderRadius = '12px';
      pfzEl.style.boxShadow = '0 2px 8px rgba(0, 229, 255, 0.3)';

      pfzEl.innerHTML = `
        <span style="font-size: 11px;">🐟</span>
        <span style="font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; color: #00e5ff;">
          PFZ ${zone.confidence_percent}%
        </span>
      `;

      pfzEl.onclick = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelectLocation({
          id: zone.id,
          type: 'pfz',
          name: zone.name,
          region: 'Thermal Front Upwelling',
          coordinates: `${zone.coordinates.latitude.toFixed(2)}°N, ${zone.coordinates.longitude.toFixed(2)}°E`,
          lat: zone.coordinates.latitude,
          lng: zone.coordinates.longitude,
          condition: `Optimal Window (${zone.optimal_time_window})`,
          metrics: {
            seaTemp: `${zone.sea_temp_c} °C`,
            tempTrend: 'Thermal Front',
            waveHeight: `${mapIntel?.conditions?.wave_height ?? 1.2} m`,
            waveStatus: '• Stable',
            windSpeed: `${mapIntel?.conditions?.wave_speed ?? 14} km/h`,
            windStatus: '↓ Calming',
            chlorophyll: `${zone.chlorophyll_mg_m3} mg/m³`,
            chloroStatus: '• High Bloom',
          },
          alerts: [
            {
              id: `alert-${zone.id}`,
              title: `Target Species: ${zone.target_species.slice(0, 3).join(', ')}`,
              severity: 'Low Risk',
              type: 'advisory',
            },
          ],
        });
      };

      const marker = new maplibregl.Marker({ element: pfzEl })
        .setLngLat([zone.coordinates.longitude, zone.coordinates.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // 3. Moving AIS Vessel Chevrons (Clean Directional Ship Marker)
    if (radarData?.vessels) {
      radarData.vessels.forEach((vessel) => {
        const isDanger = vessel.collision_risk.level === 'DANGER';
        const isCaution = vessel.collision_risk.level === 'CAUTION';
        const color = isDanger ? '#ef4444' : isCaution ? '#f59e0b' : '#38bdf8';
        const bg = isDanger ? '#2d0a0f' : isCaution ? '#2d1808' : '#081a2e';

        const vesselEl = document.createElement('div');
        vesselEl.style.cursor = 'pointer';
        vesselEl.style.display = 'flex';
        vesselEl.style.alignItems = 'center';
        vesselEl.style.justifyContent = 'center';
        vesselEl.style.width = '24px';
        vesselEl.style.height = '24px';
        vesselEl.style.borderRadius = '50%';
        vesselEl.style.backgroundColor = bg;
        vesselEl.style.border = `1.5px solid ${color}`;
        vesselEl.style.boxShadow = `0 2px 6px ${color}44`;
        vesselEl.title = `${vessel.name} (${vessel.speed_knots} kts)`;

        const isVesselTab = activeLayer === 'vessels';
        vesselEl.innerHTML = `
          <div style="transform: rotate(${vessel.heading_deg}deg); display: flex; align-items: center; justify-content: center;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
          ${
            isVesselTab
              ? `
            <div style="position: absolute; left: 26px; white-space: nowrap; background: rgba(6, 18, 34, 0.92); border: 1px solid ${color}66; padding: 2px 6px; border-radius: 8px; font-size: 9px; font-family: system-ui, sans-serif; color: #e2edfd; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); pointer-events: none;">
              <span style="font-weight: 600;">${vessel.name}</span>
              <span style="color: ${color}; font-weight: 700;">${vessel.speed_knots} kts</span>
            </div>
          `
              : ''
          }
        `;

        vesselEl.onclick = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSelectLocation({
            id: `ais-${vessel.mmsi}`,
            type: 'vessel',
            name: vessel.name,
            region: `${vessel.ship_type} • Flag: ${vessel.flag_country}`,
            coordinates: `${vessel.latitude.toFixed(2)}°N, ${vessel.longitude.toFixed(2)}°E`,
            lat: vessel.latitude,
            lng: vessel.longitude,
            condition: `AIS Live • CPA: ${vessel.collision_risk.cpa_nm} NM (${vessel.collision_risk.level})`,
            metrics: {
              seaTemp: `${mapIntel?.conditions?.sea_temperature ?? 28.4} °C`,
              tempTrend: 'Live Telemetry',
              waveHeight: `${vessel.speed_knots} kts`,
              waveStatus: `• Course ${vessel.course_deg}°`,
              windSpeed: `CPA ${vessel.collision_risk.cpa_nm} NM`,
              windStatus: vessel.collision_risk.level,
              chlorophyll: `MMSI ${vessel.mmsi}`,
              chloroStatus: `• ${vessel.nav_status}`,
            },
            alerts: [
              {
                id: `ais-alert-${vessel.mmsi}`,
                title: vessel.collision_risk.description,
                severity: isDanger ? 'High' : isCaution ? 'Moderate' : 'Low Risk',
                type: 'advisory',
              },
            ],
          });
        };

        const marker = new maplibregl.Marker({ element: vesselEl })
          .setLngLat([vessel.longitude, vessel.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [mapIntel, radarData, mapLoaded]);

  return (
    <View style={styles.mapContainer}>
      {/* 1. Real MapTiler Dataviz Dark WebGL Container */}
      {Platform.OS === 'web' ? (
        <div
          ref={mapContainerRef as any}
          style={{
            width: '100%',
            height: `${MAP_HEIGHT}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: '#02060e',
          }}
        />
      ) : (
        <View style={styles.nativeFallback}>
          <Text style={styles.nativeFallbackText}>MapTiler Marine Map</Text>
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
          {centerLat.toFixed(2)}°N, {centerLng.toFixed(2)}°E
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
    backgroundColor: '#02060e',
    overflow: 'hidden',
  },
  nativeFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#030914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeFallbackText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#00e5ff',
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
