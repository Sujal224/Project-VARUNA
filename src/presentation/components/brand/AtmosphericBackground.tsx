import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../../../theme/colors';

const { width, height } = Dimensions.get('window');

export const AtmosphericBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base Radial/Vertical Oceanic Gradient */}
      <LinearGradient
        colors={['#102438', '#071526', '#020a14', '#01070e']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Ambient Glow Cone */}
      <LinearGradient
        colors={['rgba(34, 211, 238, 0.08)', 'rgba(99, 102, 241, 0.04)', 'transparent']}
        style={[styles.glowCone, { width, height: 450 }]}
      />

      {/* Topographical Bathymetry / Sonar Contour Lines */}
      <View style={styles.svgOverlay}>
        <Svg width={width} height={500} viewBox="0 0 400 500">
          <Defs>
            <SvgRadialGradient id="sonarGlow" cx="50%" cy="20%" r="60%">
              <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <Stop offset="50%" stopColor="#6366f1" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#051424" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>

          {/* Contour Curves */}
          <Path
            d="M -50 120 C 80 180, 220 80, 450 160"
            fill="none"
            stroke="rgba(138, 235, 255, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <Path
            d="M -50 180 C 100 240, 260 140, 450 210"
            fill="none"
            stroke="rgba(138, 235, 255, 0.08)"
            strokeWidth="1"
          />
          <Path
            d="M -50 250 C 120 310, 280 200, 450 280"
            fill="none"
            stroke="rgba(99, 102, 241, 0.09)"
            strokeWidth="1"
          />
          <Path
            d="M -50 330 C 140 380, 300 290, 450 360"
            fill="none"
            stroke="rgba(138, 235, 255, 0.06)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glowCone: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.8,
  },
});
