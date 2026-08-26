import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  Layers,
  Compass,
  Navigation,
  Fish,
  ShieldCheck,
  Thermometer,
  Waves,
  FlaskConical,
  Crosshair,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import { telemetryService } from '../../data/services/telemetryService';

const { width, height } = Dimensions.get('window');

type MapLayer = 'pfz' | 'chlorophyll' | 'sst' | 'waves';

export const MapScreen: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('pfz');
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(0);

  const pfzZones = telemetryService.getPfzZones();
  const vessel = telemetryService.getVessel();
  const currentZone = pfzZones[selectedZoneIndex];

  const handleLayerSwitch = (layer: MapLayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveLayer(layer);
  };

  return (
    <View style={styles.root}>
      <AtmosphericBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header & Layer Pills */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.headerTitle}>Marine Intelligence Map</Text>
            <Text style={styles.headerSubtitle}>Bay of Bengal • Continental Shelf</Text>
          </View>

          <View style={styles.gpsLockPill}>
            <Crosshair size={12} color={Colors.primary} />
            <Text style={styles.gpsLockText}>GPS 3D Fix</Text>
          </View>
        </View>

        {/* Layer Selector Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.layerBar}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleLayerSwitch('pfz')}
            style={[styles.layerPill, activeLayer === 'pfz' && styles.layerPillActive]}
          >
            <Fish size={14} color={activeLayer === 'pfz' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.layerPillText, activeLayer === 'pfz' && styles.layerPillTextActive]}>
              PFZ Zones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleLayerSwitch('chlorophyll')}
            style={[styles.layerPill, activeLayer === 'chlorophyll' && styles.layerPillActive]}
          >
            <FlaskConical size={14} color={activeLayer === 'chlorophyll' ? Colors.success : Colors.onSurfaceVariant} />
            <Text style={[styles.layerPillText, activeLayer === 'chlorophyll' && styles.layerPillTextActive]}>
              Chlorophyll
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleLayerSwitch('sst')}
            style={[styles.layerPill, activeLayer === 'sst' && styles.layerPillActive]}
          >
            <Thermometer size={14} color={activeLayer === 'sst' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.layerPillText, activeLayer === 'sst' && styles.layerPillTextActive]}>
              Sea Surface Temp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleLayerSwitch('waves')}
            style={[styles.layerPill, activeLayer === 'waves' && styles.layerPillActive]}
          >
            <Waves size={14} color={activeLayer === 'waves' ? Colors.primary : Colors.onSurfaceVariant} />
            <Text style={[styles.layerPillText, activeLayer === 'waves' && styles.layerPillTextActive]}>
              Wave Vectors
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Main Geospatial Intelligence Map Canvas */}
        <View style={styles.mapCanvasWrapper}>
          <Svg width={width} height={height * 0.46}>
            <Defs>
              <LinearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#06192c" />
                <Stop offset="50%" stopColor="#03101e" />
                <Stop offset="100%" stopColor="#010811" />
              </LinearGradient>
              <LinearGradient id="pfzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#34d399" stopOpacity="0.15" />
              </LinearGradient>
              <LinearGradient id="chloroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <Stop offset="100%" stopColor="#064e3b" stopOpacity="0.1" />
              </LinearGradient>
            </Defs>

            {/* Base Ocean Map */}
            <Rect width={width} height={height * 0.46} fill="url(#mapBg)" />

            {/* Depth Grid Lines */}
            <Path d="M 0 80 L 400 80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <Path d="M 0 160 L 400 160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <Path d="M 0 240 L 400 240" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <Path d="M 100 0 L 100 400" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <Path d="M 200 0 L 200 400" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <Path d="M 300 0 L 300 400" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

            {/* Bathymetry Contours */}
            <Path
              d="M -20 100 Q 150 140, 260 70 T 450 110"
              fill="none"
              stroke="rgba(138, 235, 255, 0.1)"
              strokeWidth="1"
            />
            <Path
              d="M -20 180 Q 120 220, 280 150 T 450 200"
              fill="none"
              stroke="rgba(138, 235, 255, 0.07)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <Path
              d="M -20 260 Q 170 300, 310 210 T 450 280"
              fill="none"
              stroke="rgba(99, 102, 241, 0.08)"
              strokeWidth="1"
            />

            {/* Layer-Specific Overlays */}
            {activeLayer === 'chlorophyll' && (
              <Path
                d="M 140 60 Q 240 40, 320 120 T 190 220 Z"
                fill="url(#chloroGrad)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="2 4"
              />
            )}

            {/* PFZ High-Probability Polygon 1 */}
            <Path
              d="M 180 60 L 280 40 L 320 130 L 230 160 L 160 120 Z"
              fill="url(#pfzGrad)"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <Circle cx="240" cy="100" r="6" fill="#22d3ee" />
            <Circle cx="240" cy="100" r="16" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />

            {/* PFZ Zone 2 (Moderate) */}
            <Path
              d="M 80 200 L 140 180 L 160 230 L 100 250 Z"
              fill="rgba(99, 102, 241, 0.15)"
              stroke="#c0c1ff"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <Circle cx="120" cy="215" r="4" fill="#c0c1ff" />

            {/* Safe Navigation Route Vector */}
            <Path
              d="M 70 260 Q 140 210, 240 100"
              fill="none"
              stroke="#8aebff"
              strokeWidth="2.5"
              strokeDasharray="6 6"
            />

            {/* Current Vessel Position */}
            <Circle cx="70" cy="260" r="8" fill="#6366f1" />
            <Circle cx="70" cy="260" r="3" fill="#ffffff" />
            <Circle cx="70" cy="260" r="18" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />
          </Svg>

          {/* Compass Rose Floating Indicator */}
          <View style={styles.compassOverlay}>
            <Compass size={18} color={Colors.primary} />
            <Text style={styles.compassText}>N</Text>
          </View>
        </View>

        {/* Bottom Drawer: Selected PFZ Zone Detail Card */}
        <View style={styles.zoneDetailCard}>
          <View style={styles.zoneHeader}>
            <View>
              <View style={styles.zoneProbabilityRow}>
                <Text style={styles.zoneNameText}>{currentZone.name}</Text>
                <View style={styles.probBadge}>
                  <Text style={styles.probBadgeText}>{currentZone.probability} Prob</Text>
                </View>
              </View>
              <Text style={styles.zoneWindowText}>
                Best Window: {currentZone.optimalTimeWindow} • {currentZone.distanceNm} nm offshore
              </Text>
            </View>

            <View style={styles.confidenceCircle}>
              <Text style={styles.confidenceNumber}>{currentZone.confidencePercent}%</Text>
              <Text style={styles.confidenceLabel}>Confidence</Text>
            </View>
          </View>

          {/* Species & Environmental Readouts */}
          <View style={styles.zoneStatsGrid}>
            <View style={styles.zoneStatBox}>
              <Text style={styles.statLabel}>Target Species</Text>
              <Text style={styles.statValue}>{currentZone.species.join(', ')}</Text>
            </View>
            <View style={styles.zoneStatBox}>
              <Text style={styles.statLabel}>Chlorophyll</Text>
              <Text style={styles.statValueEmerald}>{currentZone.chlorophyllConcentration}</Text>
            </View>
            <View style={styles.zoneStatBox}>
              <Text style={styles.statLabel}>Shelf Depth</Text>
              <Text style={styles.statValue}>{currentZone.depthMeters} m</Text>
            </View>
          </View>

          {/* Safe Route Engagement Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={styles.engageRouteButton}
          >
            <Navigation size={16} color="#ffffff" />
            <Text style={styles.engageRouteText}>Plot Safe Route ({currentZone.bearingDeg}° Bearing)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#051424',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  gpsLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  gpsLockText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.primary,
  },
  layerBar: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 10,
  },
  layerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  layerPillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.14)',
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  layerPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  layerPillTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  mapCanvasWrapper: {
    width,
    height: height * 0.46,
    position: 'relative',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compassOverlay: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: 'rgba(5, 20, 36, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: Colors.primary,
    position: 'absolute',
    top: 2,
  },
  zoneDetailCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 96,
    backgroundColor: 'rgba(18, 33, 49, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  zoneProbabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneNameText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  probBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  probBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: Colors.success,
  },
  zoneWindowText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 3,
  },
  confidenceCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderRadius: 24,
    width: 48,
    height: 48,
  },
  confidenceNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  confidenceLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 7,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
  },
  zoneStatsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  zoneStatBox: {
    flex: 1,
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderRadius: 10,
    padding: 8,
    gap: 2,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
  },
  statValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#ffffff',
  },
  statValueEmerald: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.success,
  },
  engageRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  engageRouteText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
});
