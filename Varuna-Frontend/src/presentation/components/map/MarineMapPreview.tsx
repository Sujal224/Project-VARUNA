import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Navigation, Compass, Fish, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { PfzZone, VesselState } from '../../../domain/models/types';

const { width } = Dimensions.get('window');

interface MarineMapPreviewProps {
  zone: PfzZone;
  vessel: VesselState;
  onExpandMap?: () => void;
}

export const MarineMapPreview: React.FC<MarineMapPreviewProps> = ({
  zone,
  vessel,
  onExpandMap,
}) => {
  const mapWidth = width - 40;
  const mapHeight = 180;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onExpandMap}
      style={[styles.container, { width: mapWidth, height: mapHeight }]}
    >
      {/* SVG Marine Bathymetry & Intelligence Vector Canvas */}
      <Svg width={mapWidth} height={mapHeight} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="oceanBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#081c30" />
            <Stop offset="100%" stopColor="#040e1a" />
          </LinearGradient>
          <LinearGradient id="pfzFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* Ocean Background */}
        <Rect width={mapWidth} height={mapHeight} fill="url(#oceanBg)" />

        {/* Bathymetric Depth Contours */}
        <Path
          d="M 0 40 Q 120 70, 240 30 T 450 60"
          fill="none"
          stroke="rgba(138, 235, 255, 0.08)"
          strokeWidth="1"
        />
        <Path
          d="M 0 100 Q 150 140, 280 90 T 450 120"
          fill="none"
          stroke="rgba(138, 235, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Potential Fishing Zone (PFZ) Polygon Boundary */}
        <Path
          d="M 180 40 L 260 25 L 290 90 L 220 110 L 170 80 Z"
          fill="url(#pfzFill)"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Safe Navigation Route Vector Line */}
        <Path
          d="M 70 135 Q 120 110, 210 70"
          fill="none"
          stroke="#8aebff"
          strokeWidth="2"
          strokeDasharray="5 5"
        />

        {/* Vessel Position Marker */}
        <Circle cx="70" cy="135" r="7" fill="#6366f1" />
        <Circle cx="70" cy="135" r="3" fill="#ffffff" />
        <Circle cx="70" cy="135" r="14" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1" />

        {/* PFZ Center Pin Marker */}
        <Circle cx="230" cy="65" r="5" fill="#22d3ee" />
        <Circle cx="230" cy="65" r="12" fill="none" stroke="rgba(34, 211, 238, 0.5)" strokeWidth="1" />
      </Svg>

      {/* Floating Zone Tag (Top-Right) */}
      <View style={styles.zoneTag}>
        <Fish size={12} color={Colors.primary} />
        <Text style={styles.zoneTagText}>PFZ • Sector Alpha (87%)</Text>
      </View>

      {/* Floating Cyclone Watch Tag (Top-Left) */}
      <View style={styles.cycloneTag}>
        <ShieldCheck size={12} color={Colors.success} />
        <Text style={styles.cycloneTagText}>Cyclone Watch: Low Chance</Text>
      </View>

      {/* Bottom Floating Telemetry Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.vesselInfo}>
          <Navigation size={13} color={Colors.secondary} />
          <Text style={styles.vesselName}>{vessel.name}</Text>
          <Text style={styles.telemetryText}>
            {vessel.speedKnots} kts • HDG {vessel.heading}°
          </Text>
        </View>

        <View style={styles.tapToExpand}>
          <Text style={styles.tapToExpandText}>Expand Map</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 12,
  },
  zoneTag: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zoneTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
  },
  cycloneTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cycloneTagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.success,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  vesselInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vesselName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
  },
  telemetryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  tapToExpand: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tapToExpandText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
  },
});
