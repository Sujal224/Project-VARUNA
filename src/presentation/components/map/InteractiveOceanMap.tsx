import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
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
} from 'react-native-svg';
import {
  Anchor,
  Waves,
  AlertTriangle,
  Fish,
  CloudLightning,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = 490;

export interface MapMarkerLocation {
  id: string;
  type: 'pfz' | 'anchor' | 'wave' | 'hazard' | 'vessel' | 'cyclone';
  name: string;
  region: string;
  coordinates: string;
  lat: number;
  lng: number;
  condition: string;
  metrics: {
    seaTemp: string;
    tempTrend: string;
    waveHeight: string;
    waveStatus: string;
    windSpeed: string;
    windStatus: string;
    chlorophyll: string;
    chloroStatus: string;
  };
  alerts: Array<{
    id: string;
    title: string;
    severity: 'Moderate' | 'Low Risk' | 'High';
    type: 'current' | 'advisory' | 'cyclone';
  }>;
}

interface InteractiveOceanMapProps {
  activeLayer: 'layers' | 'vessels' | 'heatmap' | 'more';
  selectedLocation: MapMarkerLocation;
  onSelectLocation: (loc: MapMarkerLocation) => void;
  zoomLevel: number;
}

export const InteractiveOceanMap: React.FC<InteractiveOceanMapProps> = ({
  activeLayer,
  selectedLocation,
  onSelectLocation,
  zoomLevel,
}) => {
  // Pulse animation for vessel radar wake and marker glows
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const vesselGlow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const vesselLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(vesselGlow, {
          toValue: 1.25,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(vesselGlow, {
          toValue: 1.0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    vesselLoop.start();

    return () => {
      pulseLoop.stop();
      vesselLoop.stop();
    };
  }, []);

  const handleMarkerTap = (loc: MapMarkerLocation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectLocation(loc);
  };

  // Locations data matching real Bay of Bengal coordinates
  const anchorLoc: MapMarkerLocation = {
    id: 'anchor-point',
    type: 'anchor',
    name: 'Sector Alpha Deep',
    region: 'North Bay of Bengal',
    coordinates: '21.14°N, 87.82°E',
    lat: 21.14,
    lng: 87.82,
    condition: 'Safe Conditions',
    metrics: {
      seaTemp: '28.1 °C',
      tempTrend: '↑ 0.2°C',
      waveHeight: '0.9 – 1.1 m',
      waveStatus: '• Stable',
      windSpeed: '12 km/h',
      windStatus: '↓ Gentle',
      chlorophyll: '2.8 mg/m³',
      chloroStatus: '• Very High',
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
    name: 'Submerged Ridge Shoal',
    region: 'Central Trench Warning',
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

  const pfzLoc: MapMarkerLocation = {
    id: 'pfz-main',
    type: 'pfz',
    name: 'Potential Fishing Zone',
    region: 'Bay of Bengal',
    coordinates: '14.23°N, 88.57°E',
    lat: 14.23,
    lng: 88.57,
    condition: 'Safe Conditions',
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
      { id: 'a1', title: 'Strong Current', severity: 'Moderate', type: 'current' },
      { id: 'a2', title: 'Small Craft Advisory', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const vesselLoc: MapMarkerLocation = {
    id: 'vessel-varuna',
    type: 'vessel',
    name: 'Matsya Setu IV (Vessel)',
    region: 'Eastern Transit Corridor',
    coordinates: '16.12°N, 91.45°E',
    lat: 16.12,
    lng: 91.45,
    condition: 'Safe Navigation',
    metrics: {
      seaTemp: '28.3 °C',
      tempTrend: '↑ 0.1°C',
      waveHeight: '0.7 – 1.0 m',
      waveStatus: '• Calm',
      windSpeed: '11 km/h',
      windStatus: '↓ Light',
      chlorophyll: '2.2 mg/m³',
      chloroStatus: '• Optimal',
    },
    alerts: [
      { id: 'a1', title: 'Clear Nav Channel', severity: 'Low Risk', type: 'advisory' },
      { id: 'a2', title: 'Traffic Monitor', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const cycloneLoc: MapMarkerLocation = {
    id: 'cyclone-pill',
    type: 'cyclone',
    name: 'Cyclone Watch Sector',
    region: 'Andaman & Nicobar Trench',
    coordinates: '19.85°N, 93.10°E',
    lat: 19.85,
    lng: 93.10,
    condition: 'Advisory Active',
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

  // SVG dimensions
  const svgWidth = SCREEN_WIDTH;
  const svgHeight = MAP_HEIGHT;

  return (
    <View style={styles.mapContainer}>
      <Svg width={svgWidth} height={svgHeight} style={StyleSheet.absoluteFillObject}>
        <Defs>
          {/* Deep Navy/Void Oceanic Linear Gradient */}
          <LinearGradient id="oceanDeepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#05101f" />
            <Stop offset="30%" stopColor="#030c18" />
            <Stop offset="70%" stopColor="#020814" />
            <Stop offset="100%" stopColor="#01050d" />
          </LinearGradient>

          {/* Landmass Realistic Dark Gradient */}
          <LinearGradient id="landmassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0d1827" />
            <Stop offset="50%" stopColor="#09121d" />
            <Stop offset="100%" stopColor="#050c15" />
          </LinearGradient>

          {/* PFZ Semi-Transparent Glow Fill */}
          <RadialGradient id="pfzGlowFill" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.10" />
            <Stop offset="65%" stopColor="#00e5ff" stopOpacity="0.04" />
            <Stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
          </RadialGradient>

          {/* Vessel Wake Glow */}
          <RadialGradient id="vesselWakeGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.35" />
            <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </RadialGradient>

          {/* Heatmap Layer Gradients */}
          <RadialGradient id="heatGradient1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
            <Stop offset="60%" stopColor="#3b82f6" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="heatGradient2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <Stop offset="70%" stopColor="#00e5ff" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Deep Ocean Base Surface */}
        <Rect width={svgWidth} height={svgHeight} fill="url(#oceanDeepGrad)" />

        {/* 2. Indian East Coast Landmass (Bengal, Odisha, Andhra Coast) */}
        <Path
          d="M 0 0 L 145 0 C 130 35, 110 55, 92 68 C 76 80, 52 105, 48 128 C 42 155, 12 170, 8 200 C 5 235, 38 275, 46 310 C 54 345, 20 395, 0 420 Z"
          fill="url(#landmassGrad)"
        />

        {/* Landmass Coastline Glowing Border & Continental Shelf Contour */}
        <Path
          d="M 145 0 C 130 35, 110 55, 92 68 C 76 80, 52 105, 48 128 C 42 155, 12 170, 8 200 C 5 235, 38 275, 46 310 C 54 345, 20 395, 0 420"
          fill="none"
          stroke="rgba(56, 189, 248, 0.22)"
          strokeWidth="1.8"
        />

        {/* Outer Continental Shelf Bathymetric Contours */}
        <Path
          d="M 170 0 C 150 45, 130 75, 115 95 C 95 120, 68 150, 62 180 C 55 210, 42 250, 68 290 C 88 320, 72 380, 45 440"
          fill="none"
          stroke="rgba(56, 189, 248, 0.07)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        <Path
          d="M 210 0 C 190 60, 165 110, 140 145 C 115 180, 88 230, 95 270 C 105 320, 115 365, 90 440"
          fill="none"
          stroke="rgba(56, 189, 248, 0.04)"
          strokeWidth="1"
        />

        {/* 3. Coordinate Grids (Latitudes & Longitudes) */}
        {/* Longitude Grid Lines */}
        <Line x1="90" y1="0" x2="90" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="140" y1="0" x2="140" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="190" y1="0" x2="190" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="240" y1="0" x2="240" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="290" y1="0" x2="290" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="340" y1="0" x2="340" y2={svgHeight} stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />

        {/* Latitude Grid Lines */}
        <Line x1="0" y1="80" x2={svgWidth} y2="80" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="0" y1="170" x2={svgWidth} y2="170" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="0" y1="260" x2={svgWidth} y2="260" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />
        <Line x1="0" y1="360" x2={svgWidth} y2="360" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="0.8" strokeDasharray="3 5" />

        {/* Latitude Labels along the right edge */}
        <SvgText x={svgWidth - 16} y="84" fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="end">
          22°N
        </SvgText>
        <SvgText x={svgWidth - 16} y="174" fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="end">
          18°N
        </SvgText>
        <SvgText x={svgWidth - 16} y="264" fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="end">
          16°N
        </SvgText>
        <SvgText x={svgWidth - 16} y="364" fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="end">
          12°N
        </SvgText>

        {/* Longitude Labels along the bottom */}
        <SvgText x="90" y={svgHeight - 16} fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="middle">
          84°E
        </SvgText>
        <SvgText x="140" y={svgHeight - 16} fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="middle">
          86°E
        </SvgText>
        <SvgText x="190" y={svgHeight - 16} fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="middle">
          88°E
        </SvgText>
        <SvgText x="240" y={svgHeight - 16} fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="middle">
          90°E
        </SvgText>
        <SvgText x="290" y={svgHeight - 16} fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="middle">
          92°E
        </SvgText>
        <SvgText x="340" y={svgHeight - 16} fill="rgba(141, 162, 190, 0.55)" fontSize="9" fontWeight="500" textAnchor="middle">
          94°E
        </SvgText>

        {/* 4. Coastal City Markers & Labels */}
        {/* Kolkata */}
        <Circle cx="94" cy="80" r="2.5" fill="#8da2be" />
        <SvgText x="90" y="78" fill="rgba(226, 237, 253, 0.85)" fontSize="9.5" fontWeight="500" textAnchor="end">
          Kolkata
        </SvgText>

        {/* Digha */}
        <Circle cx="64" cy="115" r="2.2" fill="#8da2be" />
        <SvgText x="60" y="115" fill="rgba(226, 237, 253, 0.75)" fontSize="9" fontWeight="400" textAnchor="end">
          Digha
        </SvgText>

        {/* Paradip */}
        <Circle cx="20" cy="172" r="2.2" fill="#8da2be" />
        <SvgText x="25" y="172" fill="rgba(226, 237, 253, 0.75)" fontSize="9" fontWeight="400" textAnchor="start">
          Paradip
        </SvgText>

        {/* Visakhapatnam */}
        <Circle cx="58" cy="342" r="2.5" fill="#8da2be" />
        <SvgText x="65" y="344" fill="rgba(226, 237, 253, 0.85)" fontSize="9.5" fontWeight="500" textAnchor="start">
          Visakhapatnam
        </SvgText>

        {/* 5. Central Calm Oceanic Basin Label */}
        <SvgText
          x="215"
          y="130"
          fill="rgba(56, 140, 220, 0.45)"
          fontSize="14.5"
          fontWeight="500"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          Bay of Bengal
        </SvgText>

        {/* Optional Heatmap Layer Overlay (when Heatmap tab active) */}
        {activeLayer === 'heatmap' && (
          <G>
            <Circle cx="150" cy="370" r="95" fill="url(#heatGradient1)" />
            <Circle cx="220" cy="200" r="75" fill="url(#heatGradient2)" />
          </G>
        )}

        {/* 6. Potential Fishing Zone (PFZ) Polygon Boundary */}
        {/* Soft Outer Glow Stroke */}
        <Path
          d="M 145 320 C 190 315, 205 370, 185 410 C 160 450, 105 455, 80 420 C 55 385, 70 330, 115 320 Z"
          fill="none"
          stroke="rgba(0, 229, 255, 0.2)"
          strokeWidth="5"
        />
        {/* Main Cyan PFZ Fill & Dashed Boundary */}
        <Path
          d="M 145 320 C 190 315, 205 370, 185 410 C 160 450, 105 455, 80 420 C 55 385, 70 330, 115 320 Z"
          fill="url(#pfzGlowFill)"
          stroke="#00e5ff"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />

        {/* PFZ Internal Labels */}
        <SvgText
          x="145"
          y="358"
          fill="#ffffff"
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
        >
          Potential Fishing Zone
        </SvgText>
        <SvgText
          x="145"
          y="374"
          fill="#00e5ff"
          fontSize="9.5"
          fontWeight="500"
          textAnchor="middle"
        >
          High Probability
        </SvgText>

        {/* 7. Safe Navigation Route Polyline */}
        {/* Outer Route Soft Glow Line */}
        <Path
          d="M 320 68 C 265 110, 270 210, 290 280 C 300 310, 285 365, 235 418"
          fill="none"
          stroke="rgba(0, 229, 255, 0.22)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Electric Blue Dashed Active Route Line */}
        <Path
          d="M 320 68 C 265 110, 270 210, 290 280 C 300 310, 285 365, 235 418"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.8"
          strokeDasharray="4 5"
          strokeLinecap="round"
        />

        {/* Safe Route Origin/Turn Waypoint Point (90°E) */}
        <Circle cx="235" cy="418" r="9" fill="rgba(0, 229, 255, 0.25)" />
        <Circle cx="235" cy="418" r="4.5" fill="#00e5ff" />
        <Circle cx="235" cy="418" r="2" fill="#ffffff" />
      </Svg>

      {/* ========================================================================= */}
      {/* 8. Interactive Marine Markers Overlay (React Native Floating Components)  */}
      {/* ========================================================================= */}

      {/* A. Anchor Marker (Top-center at 21°N, 87°E) */}
      <View style={[styles.markerAbsoluteWrapper, { left: 130, top: 82 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(anchorLoc)}
          style={[
            styles.markerPillTeardrop,
            styles.anchorMarkerStyle,
            selectedLocation.id === anchorLoc.id && styles.markerActiveGlow,
          ]}
        >
          <Anchor size={15} color="#00e5ff" strokeWidth={2.2} />
        </TouchableOpacity>
        {/* Cyan Glowing Base Coordinate Pin */}
        <View style={styles.anchorDotStem} />
      </View>

      {/* B. Wave Conditions Marker (Middle at 19°N, 88°E) */}
      <View style={[styles.markerAbsoluteWrapper, { left: 142, top: 165 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(waveLoc)}
          style={[
            styles.markerPillTeardrop,
            styles.waveMarkerStyle,
            selectedLocation.id === waveLoc.id && styles.markerActiveGlowPurple,
          ]}
        >
          <Waves size={15} color="#c084fc" strokeWidth={2.2} />
        </TouchableOpacity>
        {/* Purple Glowing Base Coordinate Pin */}
        <View style={styles.waveDotStem} />
      </View>

      {/* C. Hazard Warning Marker (Center at 17°N, 89°E) */}
      <View style={[styles.markerAbsoluteWrapper, { left: 182, top: 228 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleMarkerTap(hazardLoc)}
          style={[
            styles.markerPillTeardrop,
            styles.hazardMarkerStyle,
            selectedLocation.id === hazardLoc.id && styles.markerActiveGlowAmber,
          ]}
        >
          <AlertTriangle size={15} color="#f59e0b" strokeWidth={2.2} />
        </TouchableOpacity>
        {/* Amber Glowing Base Coordinate Pin */}
        <View style={styles.hazardDotStem} />
      </View>

      {/* D. Fish Marker inside PFZ Polygon */}
      <View style={[styles.markerAbsoluteWrapper, { left: 129, top: 386 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleMarkerTap(pfzLoc)}
          style={[
            styles.fishMarkerCircle,
            selectedLocation.id === pfzLoc.id && styles.markerActiveGlow,
          ]}
        >
          <Fish size={15} color="#00e5ff" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* E. High-Tech Vessel Marker along Safe Route */}
      <View style={[styles.vesselAbsoluteWrapper, { left: 265, top: 250 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleMarkerTap(vesselLoc)}
          style={styles.vesselTouchArea}
        >
          {/* Animated Radar Wake Ripple Ring */}
          <Animated.View
            style={[
              styles.vesselWakeRing,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          {/* Precision 3D Sleek Hull SVG */}
          <View style={styles.vesselHullWrapper}>
            <Svg width={30} height={42} viewBox="0 0 30 42">
              <Defs>
                <LinearGradient id="vesselHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#f8fafc" />
                  <Stop offset="45%" stopColor="#cbd5e1" />
                  <Stop offset="100%" stopColor="#64748b" />
                </LinearGradient>
                <LinearGradient id="vesselCabinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0284c7" />
                  <Stop offset="100%" stopColor="#0369a1" />
                </LinearGradient>
              </Defs>

              {/* Vessel Hull Shape */}
              <Path
                d="M 15 2 C 22 10, 26 24, 23 38 C 19 40, 11 40, 7 38 C 4 24, 8 10, 15 2 Z"
                fill="url(#vesselHullGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />

              {/* Vessel Deck & Cabin */}
              <Path
                d="M 15 8 C 19 14, 20 22, 19 28 C 17 30, 13 30, 11 28 C 10 22, 11 14, 15 8 Z"
                fill="#0f172a"
              />

              {/* Glowing Cockpit Glass */}
              <Path
                d="M 15 12 C 18 16, 18 20, 17 23 C 16 24, 14 24, 13 23 C 12 20, 12 16, 15 12 Z"
                fill="url(#vesselCabinGrad)"
              />
              <Circle cx="15" cy="16" r="2.5" fill="#38bdf8" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>

      {/* F. Cyclone Watch Floating Glass Card (Top Right at 20°N, 93°E) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleMarkerTap(cycloneLoc)}
        style={[
          styles.cycloneWatchCard,
          selectedLocation.id === cycloneLoc.id && styles.cycloneCardActive,
        ]}
      >
        <View style={styles.cycloneIconWrapper}>
          <CloudLightning size={18} color="#38bdf8" strokeWidth={2} />
        </View>
        <View style={styles.cycloneTextColumn}>
          <Text style={styles.cycloneTitle}>Cyclone Watch</Text>
          <Text style={styles.cycloneSubtitle}>Low Chance</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: MAP_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  markerAbsoluteWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  markerPillTeardrop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  anchorMarkerStyle: {
    backgroundColor: 'rgba(5, 30, 48, 0.92)',
    borderColor: '#00e5ff',
  },
  waveMarkerStyle: {
    backgroundColor: 'rgba(32, 16, 52, 0.92)',
    borderColor: '#a855f7',
  },
  hazardMarkerStyle: {
    backgroundColor: 'rgba(48, 28, 6, 0.92)',
    borderColor: '#f59e0b',
  },
  markerActiveGlow: {
    borderColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderWidth: 2,
  },
  markerActiveGlowPurple: {
    borderColor: '#c084fc',
    shadowColor: '#c084fc',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderWidth: 2,
  },
  markerActiveGlowAmber: {
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    borderWidth: 2,
  },
  anchorDotStem: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00e5ff',
    marginTop: 3,
    shadowColor: '#00e5ff',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  waveDotStem: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c084fc',
    marginTop: 3,
    shadowColor: '#c084fc',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  hazardDotStem: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f59e0b',
    marginTop: 3,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  fishMarkerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(4, 28, 44, 0.92)',
    borderWidth: 1.4,
    borderColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  vesselAbsoluteWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
  vesselTouchArea: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vesselWakeRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(0, 229, 255, 0.35)',
  },
  vesselHullWrapper: {
    transform: [{ rotate: '-22deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  cycloneWatchCard: {
    position: 'absolute',
    top: 92,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 20, 36, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    zIndex: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cycloneCardActive: {
    borderColor: 'rgba(56, 189, 248, 0.6)',
    backgroundColor: 'rgba(12, 28, 50, 0.95)',
  },
  cycloneIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycloneTextColumn: {
    gap: 1,
  },
  cycloneTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
  },
  cycloneSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#8da2be',
  },
});
