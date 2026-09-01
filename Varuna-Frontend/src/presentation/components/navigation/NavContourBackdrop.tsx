import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
} from 'react-native-svg';

interface NavContourBackdropProps {
  width: number;
  height: number;
}

export const NavContourBackdrop: React.FC<NavContourBackdropProps> = ({
  width,
  height,
}) => {
  const borderRadius = height / 2; // 33
  const cx = width / 2;
  const cy = height / 2; // 33

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
      ]}
      pointerEvents="none"
    >
      {/* 1. Frosted Liquid Glass Blur Base */}
      <BlurView
        intensity={55}
        tint="dark"
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />

      {/* 2. Deep Midnight Obsidian Sapphire Glass Fill Layer */}
      <LinearGradient
        colors={[
          'rgba(10, 26, 52, 0.88)',
          'rgba(5, 14, 30, 0.92)',
          'rgba(2, 6, 16, 0.96)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />

      {/* 3. Upper Specular Liquid Sheen (Matches VARUNA Insight Card Texture) */}
      <LinearGradient
        colors={[
          'rgba(56, 189, 248, 0.18)',
          'rgba(0, 102, 255, 0.05)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.65 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />

      {/* 4. Center Ambient Radial Blue Glow Pool (Under Orb) */}
      <View style={StyleSheet.absoluteFillObject}>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient
              id="centerAmbientBlueGlow"
              cx="50%"
              cy="50%"
              r="45%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
              <Stop offset="40%" stopColor="#0066ff" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Radial Glow */}
          <Circle cx={cx} cy={cy} r={46} fill="url(#centerAmbientBlueGlow)" />

          {/* Subtle Dark Glass Socket Recess under the Orb */}
          <Circle
            cx={cx}
            cy={cy}
            r={26}
            fill="rgba(1, 4, 12, 0.75)"
          />
          <Circle
            cx={cx}
            cy={cy}
            r={26}
            fill="none"
            stroke="rgba(0, 229, 255, 0.28)"
            strokeWidth={1}
          />
        </Svg>
      </View>

      {/* 5. Razor-Sharp Top Specular Hairline Grazing Rim */}
      <LinearGradient
        colors={[
          'rgba(0, 68, 255, 0.2)',
          'rgba(0, 229, 255, 0.7)',
          'rgba(255, 255, 255, 0.95)',
          'rgba(0, 229, 255, 0.7)',
          'rgba(0, 68, 255, 0.2)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topRazorRim}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  topRazorRim: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.2,
    opacity: 0.9,
  },
});
