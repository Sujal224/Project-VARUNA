import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient as SvgRadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const AtmosphericBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base Oceanic Void Gradient */}
      <LinearGradient
        colors={['#061120', '#030a16', '#02060e', '#01040a']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Radiant Horizon Glow (Behind the boat / bathymetry visualizer) */}
      <View style={styles.horizonGlowContainer}>
        <Svg width={width} height={350} viewBox="0 0 400 350">
          <Defs>
            <SvgRadialGradient id="horizonBurst" cx="75%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#8aebff" stopOpacity="0.32" />
              <Stop offset="25%" stopColor="#00e5ff" stopOpacity="0.18" />
              <Stop offset="60%" stopColor="#1e40af" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#02060e" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgRadialGradient id="upperGlow" cx="20%" cy="10%" r="50%">
              <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#02060e" stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>

          {/* Horizon Sunburst / Light Source */}
          <Circle cx="300" cy="120" r="180" fill="url(#horizonBurst)" />
          <Circle cx="60" cy="40" r="140" fill="url(#upperGlow)" />
        </Svg>
      </View>

      {/* Top subtle blue ambient cone */}
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.05)', 'rgba(37, 99, 235, 0.03)', 'transparent']}
        style={[styles.glowCone, { width, height: 400 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  glowCone: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  horizonGlowContainer: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
  },
});

