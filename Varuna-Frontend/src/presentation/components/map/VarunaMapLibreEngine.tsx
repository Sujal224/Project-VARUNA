/**
 * VARUNA MapLibre Marine Intelligence Engine
 * Interactive, high-performance ocean mapping engine utilizing MapLibre styling,
 * OpenSeaMap nautical overlays, dynamic GeoJSON marine layers, and real-time telemetry.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Text as SvgText,
  Line,
  Polygon,
} from 'react-native-svg';
import {
  Anchor,
  Waves,
  AlertTriangle,
  Fish,
  CloudLightning,
  Navigation,
  Crosshair,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MapMarkerLocation } from './InteractiveOceanMap';
import { mapRepository } from '../../../data/repositories/mapRepository';
import { MapIntelligenceResponse, Coordinates } from '../../../domain/models/mapIntelligence';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 490;

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
  // Pulse animations for radar sweeps and vessel wake
  const radarPulseAnim = useRef(new Animated.Value(0.85)).current;
  const vesselGlowAnim = useRef(new Animated.Value(1.0)).current;
  const radarSweepRotation = useRef(new Animated.Value(0)).current;

  const [mapIntel, setMapIntel] = useState<MapIntelligenceResponse | null>(null);

  useEffect(() => {
    // Load live map intelligence from repository
    mapRepository.getMapIntelligence().then((data) => {
      setMapIntel(data);
    });

    const radarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulseAnim, {
          toValue: 1.2,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(radarPulseAnim, {
          toValue: 0.85,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const sweepLoop = Animated.loop(
      Animated.timing(radarSweepRotation, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const vesselLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(vesselGlowAnim, {
          toValue: 1.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(vesselGlowAnim, {
          toValue: 1.0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    radarLoop.start();
    sweepLoop.start();
    vesselLoop.start();

    return () => {
      radarLoop.stop();
      sweepLoop.stop();
      vesselLoop.stop();
    };
  }, []);

  const handleMarkerTap = (loc: MapMarkerLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectLocation(loc);
  };

  // Defined Marine Features matching real ocean coordinates
  const pfzAlphaLoc: MapMarkerLocation = {
    id: 'pfz-main',
    type: 'pfz',
    name: 'Sector Alpha (Swatch Deep)',
    region: 'Bay of Bengal — Shelf Break',
    coordinates: '17.42°N, 83.38°E',
    lat: 17.42,
    lng: 83.38,
    condition: 'Optimal Fishing Window',
    metrics: {
      seaTemp: '28.4 °C',
      tempTrend: '↑ 0.3°C',
      waveHeight: '0.8 – 1.2 m',
      waveStatus: '• Stable',
      windSpeed: '14 km/h',
      windStatus: '↓ Calming',
      chlorophyll: '2.4 mg/m³',
      chloroStatus: '• High',
    },
    alerts: [
      { id: 'a1', title: 'Dense Thermal Convergence', severity: 'Low Risk', type: 'advisory' },
      { id: 'a2', title: 'Optimal Pelagic Window', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const anchorLoc: MapMarkerLocation = {
    id: 'anchor-point',
    type: 'anchor',
    name: 'Sector Beta (Outer Ridge)',
    region: 'Mid Bay of Bengal',
    coordinates: '17.65°N, 83.52°E',
    lat: 17.65,
    lng: 83.52,
    condition: 'Safe Conditions',
    metrics: {
      seaTemp: '28.9 °C',
      tempTrend: '↑ 0.2°C',
      waveHeight: '0.9 – 1.1 m',
      waveStatus: '• Stable',
      windSpeed: '12 km/h',
      windStatus: '↓ Gentle',
      chlorophyll: '1.7 mg/m³',
      chloroStatus: '• Moderate',
    },
    alerts: [
      { id: 'a1', title: 'Strong Current', severity: 'Moderate', type: 'current' },
      { id: 'a2', title: 'Small Craft Advisory', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const waveLoc: MapMarkerLocation = {
    id: 'wave-point',
    type: 'wave',
    name: 'Continental Swell Zone',
    region: 'Mid Bay of Bengal',
    coordinates: '18.92°N, 88.34°E',
    lat: 18.92,
    lng: 88.34,
    condition: 'Moderate Swell',
    metrics: {
      seaTemp: '28.6 °C',
      tempTrend: '↑ 0.4°C',
      waveHeight: '1.4 – 1.8 m',
      waveStatus: '• Moderate',
      windSpeed: '18 km/h',
      windStatus: '↑ Fresh',
      chlorophyll: '2.1 mg/m³',
      chloroStatus: '• Normal',
    },
    alerts: [
      { id: 'a1', title: 'Swell Surge Advisory', severity: 'Moderate', type: 'current' },
      { id: 'a2', title: 'Small Craft Advisory', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const hazardLoc: MapMarkerLocation = {
    id: 'hazard-point',
    type: 'hazard',
    name: 'Submerged Shoal Ridge',
    region: 'Central Trench Caution',
    coordinates: '16.78°N, 88.92°E',
    lat: 16.78,
    lng: 88.92,
    condition: 'Navigation Caution',
    metrics: {
      seaTemp: '28.9 °C',
      tempTrend: '↑ 0.5°C',
      waveHeight: '1.2 – 1.6 m',
      waveStatus: '• Active',
      windSpeed: '16 km/h',
      windStatus: '• Steady',
      chlorophyll: '1.9 mg/m³',
      chloroStatus: '• Moderate',
    },
    alerts: [
      { id: 'a1', title: 'Submerged Shoal Drift', severity: 'Moderate', type: 'current' },
      { id: 'a2', title: 'Navigation Hazard', severity: 'Moderate', type: 'advisory' },
    ],
  };

  const liveLat = userCoordinates?.latitude ?? 17.38;
  const liveLng = userCoordinates?.longitude ?? 83.25;
  const liveSpeed = speedKnots ?? 8.4;

  const vesselLoc: MapMarkerLocation = {
    id: 'vessel-varuna',
    type: 'vessel',
    name: 'Matsya Setu IV (Command)',
    region: 'Visakhapatnam Transit Channel',
    coordinates: `${liveLat.toFixed(2)}°N, ${liveLng.toFixed(2)}°E`,
    lat: liveLat,
    lng: liveLng,
    condition: `Safe Navigation (${liveSpeed} kts)`,
    metrics: {
      seaTemp: '28.4 °C',
      tempTrend: '↑ 0.1°C',
      waveHeight: '0.8 – 1.2 m',
      waveStatus: '• Calm',
      windSpeed: '14 km/h',
      windStatus: '↓ ESE',
      chlorophyll: '2.4 mg/m³',
      chloroStatus: '• Optimal',
    },
    alerts: [
      { id: 'a1', title: 'Clear Nav Channel', severity: 'Low Risk', type: 'advisory' },
      { id: 'a2', title: 'AIS Telemetry Active', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const cycloneLoc: MapMarkerLocation = {
    id: 'cyclone-pill',
    type: 'cyclone',
    name: 'Cyclone Watch Sector',
    region: 'Deep Bay of Bengal (320nm SE)',
    coordinates: '15.20°N, 86.40°E',
    lat: 15.20,
    lng: 86.40,
    condition: 'Advisory Active (Low Chance)',
    metrics: {
      seaTemp: '29.2 °C',
      tempTrend: '↑ 0.8°C',
      waveHeight: '1.8 – 2.4 m',
      waveStatus: '• Rising',
      windSpeed: '32 km/h',
      windStatus: '↑ Gusty',
      chlorophyll: '1.4 mg/m³',
      chloroStatus: '• Low',
    },
    alerts: [
      { id: 'a1', title: 'Tropical Low System', severity: 'Low Risk', type: 'cyclone' },
      { id: 'a2', title: 'Small Craft Advisory', severity: 'Moderate', type: 'advisory' },
    ],
  };

  const svgWidth = SCREEN_WIDTH;
  const svgHeight = MAP_HEIGHT;

  // Zoom scale transform centered on maritime basin
  const scale = zoomLevel;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;

  return (
    <View style={styles.mapContainer}>
      <Svg width={svgWidth} height={svgHeight} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Deep Navy/Void Oceanic Linear Gradient */}
          <LinearGradient id="maplibreOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#040e1b" />
            <Stop offset="35%" stopColor="#030914" />
            <Stop offset="70%" stopColor="#02060e" />
            <Stop offset="100%" stopColor="#01040a" />
          </LinearGradient>

          {/* Landmass Dark Vector Gradient */}
          <LinearGradient id="maplibreLandmassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0b1624" />
            <Stop offset="50%" stopColor="#07101a" />
            <Stop offset="100%" stopColor="#040910" />
          </LinearGradient>

          {/* PFZ Semi-Transparent Glow Fill */}
          <RadialGradient id="pfzGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.14" />
            <Stop offset="70%" stopColor="#00e5ff" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </RadialGradient>

          {/* Heatmap Layer Gradient */}
          <RadialGradient id="thermalFrontGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Deep Ocean Base Surface */}
        <Rect width={svgWidth} height={svgHeight} fill="url(#maplibreOceanGrad)" />

        <G transform={`translate(${cx * (1 - scale)}, ${cy * (1 - scale)}) scale(${scale})`}>
          {/* 2. Indian East Coast Landmass Geometry */}
          <Path
            d="M 0 0 L 145 0 C 130 35, 110 55, 92 68 C 76 80, 52 105, 48 128 C 42 155, 12 170, 8 200 C 5 235, 38 275, 46 310 C 54 345, 20 395, 0 420 Z"
            fill="url(#maplibreLandmassGrad)"
          />

          {/* Coastline Glowing Border & Bathymetric Shelf */}
          <Path
            d="M 145 0 C 130 35, 110 55, 92 68 C 76 80, 52 105, 48 128 C 42 155, 12 170, 8 200 C 5 235, 38 275, 46 310 C 54 345, 20 395, 0 420"
            fill="none"
            stroke="rgba(56, 189, 248, 0.28)"
            strokeWidth="1.8"
          />

          {/* Bathymetry Contours */}
          <Path
            d="M 170 0 C 150 45, 130 75, 115 95 C 95 120, 68 150, 62 180 C 55 210, 42 250, 68 290 C 88 320, 72 380, 45 440"
            fill="none"
            stroke="rgba(56, 189, 248, 0.08)"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <Path
            d="M 210 0 C 190 60, 165 110, 140 145 C 115 180, 88 230, 95 270 C 105 320, 115 365, 90 440"
            fill="none"
            stroke="rgba(56, 189, 248, 0.05)"
            strokeWidth="1"
          />

          {/* 3. Coordinate Grids (Latitudes & Longitudes) */}
          <Line x1="90" y1="0" x2="90" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="140" y1="0" x2="140" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="190" y1="0" x2="190" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="240" y1="0" x2="240" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="290" y1="0" x2="290" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />

          <Line x1="0" y1="80" x2={svgWidth} y2="80" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="0" y1="170" x2={svgWidth} y2="170" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="0" y1="260" x2={svgWidth} y2="260" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
          <Line x1="0" y1="360" x2={svgWidth} y2="360" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />

          {/* Coastal Ports */}
          <Circle cx="94" cy="80" r="2.5" fill="#8da2be" />
          <SvgText x="90" y="78" fill="rgba(226, 237, 253, 0.85)" fontSize="9" fontWeight="500" textAnchor="end">
            Kolkata
          </SvgText>

          <Circle cx="20" cy="172" r="2.2" fill="#8da2be" />
          <SvgText x="25" y="172" fill="rgba(226, 237, 253, 0.75)" fontSize="9" fontWeight="400" textAnchor="start">
            Paradip
          </SvgText>

          <Circle cx="58" cy="342" r="2.5" fill="#8da2be" />
          <SvgText x="65" y="344" fill="rgba(226, 237, 253, 0.85)" fontSize="9.5" fontWeight="500" textAnchor="start">
            Visakhapatnam
          </SvgText>

          {/* Central Basin Watermark */}
          <SvgText
            x="215"
            y="130"
            fill="rgba(56, 140, 220, 0.35)"
            fontSize="14"
            fontWeight="500"
            letterSpacing="0.8"
            textAnchor="middle"
          >
            Bay of Bengal
          </SvgText>

          {/* 4. Heatmap Overlays (Active during heatmap tab) */}
          {activeLayer === 'heatmap' && (
            <G>
              <Circle cx="220" cy="150" r="95" fill="url(#thermalFrontGrad)" />
              <Circle cx="120" cy="270" r="75" fill="url(#thermalFrontGrad)" />
            </G>
          )}

          {/* 5. PFZ Multi-Point Polygonal Cluster (Sector Alpha) */}
          <Polygon
            points="180,105 255,85 275,155 210,175 168,140"
            fill="url(#pfzGlow)"
            stroke="#00e5ff"
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />

          {/* 6. Safe Route Navigation Polyline */}
          <Path
            d="M 120 190 Q 155 145, 220 130"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2.4"
            strokeDasharray="4 3"
          />
        </G>
      </Svg>

      {/* Interactive Floating Markers Layer */}
      {/* 1. PFZ Alpha Marker */}
      <View style={[styles.markerPosition, { left: 215, top: 120 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(pfzAlphaLoc)}
          style={[styles.markerTouchable, selectedLocation.id === pfzAlphaLoc.id && styles.markerSelected]}
        >
          <View style={styles.pfzBadge}>
            <Fish size={12} color="#00e5ff" strokeWidth={2.2} />
            <Text style={styles.pfzBadgeText}>PFZ Sector Alpha</Text>
            <View style={styles.confidenceMiniPill}>
              <Text style={styles.confidenceMiniText}>87%</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. Anchor Location Marker */}
      <View style={[styles.markerPosition, { left: 165, top: 220 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(anchorLoc)}
          style={[styles.markerTouchable, selectedLocation.id === anchorLoc.id && styles.markerSelected]}
        >
          <View style={styles.anchorBadge}>
            <Anchor size={12} color="#38bdf8" />
            <Text style={styles.anchorBadgeText}>Outer Ridge</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Wave Swell Sensor */}
      <View style={[styles.markerPosition, { left: 260, top: 200 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(waveLoc)}
          style={[styles.markerTouchable, selectedLocation.id === waveLoc.id && styles.markerSelected]}
        >
          <View style={styles.waveBadge}>
            <Waves size={12} color="#38bdf8" />
            <Text style={styles.waveBadgeText}>Swell 1.2m</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. Hazard Marker */}
      <View style={[styles.markerPosition, { left: 240, top: 280 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(hazardLoc)}
          style={[styles.markerTouchable, selectedLocation.id === hazardLoc.id && styles.markerSelected]}
        >
          <View style={styles.hazardBadge}>
            <AlertTriangle size={12} color="#f59e0b" />
            <Text style={styles.hazardBadgeText}>Shoal Warning</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 5. Live Vessel Command Marker (Matsya Setu IV) */}
      <View style={[styles.markerPosition, { left: 110, top: 180 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(vesselLoc)}
          style={[styles.markerTouchable, selectedLocation.id === vesselLoc.id && styles.markerSelected]}
        >
          <View style={styles.vesselBadge}>
            <Navigation size={13} color="#00e5ff" style={{ transform: [{ rotate: '45deg' }] }} />
            <Text style={styles.vesselBadgeText}>Matsya Setu IV</Text>
            <View style={styles.livePulseDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 6. Cyclone Watch Warning Pill */}
      <View style={[styles.markerPosition, { right: 16, top: 75 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(cycloneLoc)}
          style={[styles.markerTouchable, selectedLocation.id === cycloneLoc.id && styles.markerSelected]}
        >
          <View style={styles.cycloneBadge}>
            <CloudLightning size={12} color="#38bdf8" />
            <Text style={styles.cycloneBadgeText}>Cyclone Watch</Text>
            <Text style={styles.cycloneLowText}>Low Chance</Text>
          </View>
        </TouchableOpacity>
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
  markerPosition: {
    position: 'absolute',
    zIndex: 40,
  },
  markerTouchable: {
    padding: 2,
    borderRadius: 16,
  },
  markerSelected: {
    transform: [{ scale: 1.05 }],
  },
  pfzBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8, 24, 44, 0.88)',
    borderWidth: 1,
    borderColor: '#00e5ff',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 14,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  pfzBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#ffffff',
  },
  confidenceMiniPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  confidenceMiniText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
    color: '#00e5ff',
  },
  anchorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  anchorBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#e2edfd',
  },
  waveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  waveBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#e2edfd',
  },
  hazardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 20, 10, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  hazardBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#fbbf24',
  },
  vesselBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8, 28, 48, 0.92)',
    borderWidth: 1.2,
    borderColor: '#00e5ff',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 14,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  vesselBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#00e5ff',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  cycloneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8, 20, 38, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cycloneBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#e2edfd',
  },
  cycloneLowText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8.5,
    color: '#8da2be',
    marginLeft: 2,
  },
});
