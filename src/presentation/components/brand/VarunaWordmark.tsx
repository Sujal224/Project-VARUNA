import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, G, Defs, Filter, FeDropShadow, LinearGradient, Stop } from 'react-native-svg';

interface VarunaWordmarkProps {
  scale?: number;
  color?: string;
  subtextColor?: string;
  showTagline?: boolean;
  tagline?: string;
  glow?: boolean;
}

/**
 * Premium Bespoke Vector Wordmark for VARUNA with iconic marine-wave crossbars on 'A's.
 * Hand-crafted with exact vector geometry matching brand typography standards.
 */
export const VarunaWordmark: React.FC<VarunaWordmarkProps> = ({
  scale = 1,
  color = '#ffffff',
  subtextColor = '#8da2be',
  showTagline = true,
  tagline = 'MARINE INTELLIGENCE',
  glow = true,
}) => {
  // Base SVG dimensions
  const baseWidth = 210;
  const baseHeight = 32;
  const targetWidth = baseWidth * scale;
  const targetHeight = baseHeight * scale;

  return (
    <View style={styles.container}>
      {/* 1. Vector SVG Wordmark for "VARUNA" */}
      <Svg
        width={targetWidth}
        height={targetHeight}
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        style={styles.svgWordmark}
      >
        <Defs>
          {/* Subtle Oceanic Glow */}
          {glow && (
            <LinearGradient id="varunaGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <Stop offset="50%" stopColor="#eef6ff" stopOpacity="1.0" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
            </LinearGradient>
          )}
        </Defs>

        <G
          stroke={glow ? 'url(#varunaGlow)' : color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* V: (x: 0 .. 26) */}
          <Path d="M 2.2 2 L 13 29.5 L 23.8 2" />

          {/* A (First): (x: 38 .. 64) with iconic marine wave/droplet curved crossbar */}
          <Path d="M 39.8 29.5 L 51 2 L 62.2 29.5" />
          <Path
            d="M 44.4 18.2 Q 51 23.6 57.6 18.2"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* R: (x: 76 .. 100) */}
          <Path d="M 78 29.5 L 78 2 L 89 2 C 95.5 2, 95.5 15.5, 89 15.5 L 78 15.5" />
          <Path d="M 87 15.5 Q 91.5 17 97.5 29.5" />

          {/* U: (x: 112 .. 136) */}
          <Path d="M 114 2 L 114 17.5 C 114 30.5, 134 30.5, 134 17.5 L 134 2" />

          {/* N: (x: 148 .. 172) */}
          <Path d="M 150 29.5 L 150 2 L 170 29.5 L 170 2" />

          {/* A (Second): (x: 184 .. 210) with matching marine wave/droplet curved crossbar */}
          <Path d="M 185.8 29.5 L 197 2 L 208.2 29.5" />
          <Path
            d="M 190.4 18.2 Q 197 23.6 203.6 18.2"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* 2. Subline: "MARINE INTELLIGENCE" with expanded tracking */}
      {showTagline && (
        <View style={[styles.taglineContainer, { width: targetWidth }]}>
          <Text
            style={[
              styles.taglineText,
              {
                color: subtextColor,
                fontSize: 8.2 * scale,
                letterSpacing: 3.6 * scale,
              },
            ]}
          >
            {tagline}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  svgWordmark: {
    overflow: 'visible',
  },
  taglineContainer: {
    marginTop: 3,
    paddingLeft: 1.5,
  },
  taglineText: {
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 11,
    opacity: 0.9,
    textAlign: 'left',
  },
});
