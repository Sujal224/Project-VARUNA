import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Circle,
  G,
  ClipPath,
} from 'react-native-svg';

interface NavContourBackdropProps {
  width: number;
  height: number;
}

export const NavContourBackdrop: React.FC<NavContourBackdropProps> = ({
  width,
  height,
}) => {
  const W = width;
  const H = height; // 88
  const R = 34; // Pill end radius (base pill height = 68, R = 34)
  const topY = 20; // Base horizontal line
  const botY = 88; // Bottom baseline
  const cx = W / 2;

  // Seamless organic contoured capsule with elevated center dome
  const contourPath = `
    M ${R} ${topY}
    L ${cx - 56} ${topY}
    C ${cx - 44} ${topY} ${cx - 38} ${topY - 4} ${cx - 34} ${topY - 8}
    C ${cx - 22} 1.5 ${cx + 22} 1.5 ${cx + 34} ${topY - 8}
    C ${cx + 38} ${topY - 4} ${cx + 44} ${topY} ${cx + 56} ${topY}
    L ${W - R} ${topY}
    A ${R} ${R} 0 0 1 ${W - R} ${botY}
    L ${R} ${botY}
    A ${R} ${R} 0 0 1 ${R} ${topY}
    Z
  `;

  // Continuous top glowing rim path (follows the entire top contour including dome)
  const topRimPath = `
    M ${R} ${topY}
    L ${cx - 56} ${topY}
    C ${cx - 44} ${topY} ${cx - 38} ${topY - 4} ${cx - 34} ${topY - 8}
    C ${cx - 22} 1.5 ${cx + 22} 1.5 ${cx + 34} ${topY - 8}
    C ${cx + 38} ${topY - 4} ${cx + 44} ${topY} ${cx + 56} ${topY}
    L ${W - R} ${topY}
  `;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]} pointerEvents="none">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          {/* 1. Deep Midnight Obsidian Sapphire Glass Fill */}
          <SvgLinearGradient id="glassBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#081c3c" stopOpacity="0.98" />
            <Stop offset="30%" stopColor="#040e22" stopOpacity="0.99" />
            <Stop offset="75%" stopColor="#020614" stopOpacity="1.0" />
            <Stop offset="100%" stopColor="#000208" stopOpacity="1.0" />
          </SvgLinearGradient>

          {/* 2. Razor Electric Cyan to Royal Blue Specular Rim Gradient */}
          <SvgLinearGradient id="topRimGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#0044ff" stopOpacity="0.3" />
            <Stop offset="20%" stopColor="#0088ff" stopOpacity="0.7" />
            <Stop offset="38%" stopColor="#00e5ff" stopOpacity="0.95" />
            <Stop offset="48%" stopColor="#80f2ff" stopOpacity="1.0" />
            <Stop offset="50%" stopColor="#ffffff" stopOpacity="1.0" />
            <Stop offset="52%" stopColor="#80f2ff" stopOpacity="1.0" />
            <Stop offset="62%" stopColor="#00e5ff" stopOpacity="0.95" />
            <Stop offset="80%" stopColor="#0088ff" stopOpacity="0.7" />
            <Stop offset="100%" stopColor="#0044ff" stopOpacity="0.3" />
          </SvgLinearGradient>

          {/* 3. Soft Upper Specular Sheen Gradient */}
          <SvgLinearGradient id="upperSheenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
            <Stop offset="45%" stopColor="#0044aa" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </SvgLinearGradient>

          {/* 4. Center Dome Ambient Radial Blue Glow (Concentric at cy = 35) */}
          <RadialGradient
            id="centerDomeAmbientGlow"
            cx="50%"
            cy="40%"
            r="45%"
            fx="50%"
            fy="35%"
          >
            <Stop offset="0%" stopColor="#0088ff" stopOpacity="0.22" />
            <Stop offset="60%" stopColor="#0033aa" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* 5. Bottom Rim Micro-Highlight */}
          <SvgLinearGradient id="bottomRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#002266" stopOpacity="0.1" />
            <Stop offset="50%" stopColor="#0044bb" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#002266" stopOpacity="0.1" />
          </SvgLinearGradient>

          <ClipPath id="bodyClip">
            <Path d={contourPath} />
          </ClipPath>
        </Defs>

        {/* Layer 1: Solid Monolithic Glass Base Fill */}
        <Path
          d={contourPath}
          fill="url(#glassBodyGrad)"
        />

        {/* Layer 2: Clipped Inner Volumetric Sheen and Radial Glow */}
        <G clipPath="url(#bodyClip)">
          {/* Upper glass surface specular light wash */}
          <Path
            d={contourPath}
            fill="url(#upperSheenGrad)"
          />

          {/* Center Dome Radiant Ambient Blue Light Pool (Concentric at cy = 35) */}
          <Circle
            cx={cx}
            cy={35}
            r={50}
            fill="url(#centerDomeAmbientGlow)"
          />

          {/* Center Orb Socket Recess (Concentric at cy = 35) */}
          <Circle
            cx={cx}
            cy={35}
            r={31}
            fill="#01040b"
            fillOpacity={0.75}
          />
          <Circle
            cx={cx}
            cy={35}
            r={31}
            fill="none"
            stroke="#0066ff"
            strokeWidth={1}
            strokeOpacity={0.3}
          />
        </G>

        {/* Layer 3: Perimeter Outer Glass Stroke */}
        <Path
          d={contourPath}
          fill="none"
          stroke="rgba(0, 85, 255, 0.25)"
          strokeWidth={1}
        />

        {/* Layer 4: Bottom Baseline Ambient Rim */}
        <Path
          d={`M ${R} ${botY} L ${W - R} ${botY}`}
          stroke="url(#bottomRimGrad)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* Layer 5: Top Electric Neon Contour Grazing Rim (Continuous Razor Edge) */}
        <Path
          d={topRimPath}
          fill="none"
          stroke="url(#topRimGlowGrad)"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#0055ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
});
