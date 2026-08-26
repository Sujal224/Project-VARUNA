import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  ClipPath,
} from 'react-native-svg';

export interface VarunaOrbProps {
  /** Diameter of the orb in density-independent pixels. Defaults to 58. */
  size?: number;
  /** Whether the flowing wave and glowing pulsations are active. Defaults to true. */
  active?: boolean;
  /** Speed of the wave flow animation. Defaults to 'normal'. */
  speed?: 'slow' | 'normal' | 'fast';
  /** Whether to render the outer ambient glow corona. Defaults to true. */
  showGlow?: boolean;
  /** Intensity multiplier for luminous bloom (0.0 to 1.5). Defaults to 1.0. */
  intensity?: number;
  /** Optional custom container style. */
  style?: ViewStyle;
  /** Optional click/press callback for interactive orbs. */
  onPress?: () => void;
}

/**
 * VarunaOrb - Pure Liquid Glass Sphere with Bioluminescent Horizon Wave.
 * Matches the deep obsidian studio glass reference design:
 * - Deep dark obsidian spherical void
 * - Brilliant luminous electric cyan & pure white plasma sine wave
 * - Studio softbox crescent specular glaze on top dome
 * - High-index razor neon cyan Fresnel reflection rim
 */
export const VarunaOrb: React.FC<VarunaOrbProps> = ({
  size = 58,
  active = true,
  speed = 'normal',
  showGlow = true,
  intensity = 1.0,
  style,
  onPress,
}) => {
  const flowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const flowDuration = speed === 'fast' ? 4500 : speed === 'slow' ? 12000 : 7500;

  useEffect(() => {
    if (!active) {
      flowAnim.setValue(0);
      pulseAnim.setValue(0.5);
      return;
    }

    const primaryFlowLoop = Animated.loop(
      Animated.timing(flowAnim, {
        toValue: 1,
        duration: flowDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    primaryFlowLoop.start();
    pulseLoop.start();

    return () => {
      primaryFlowLoop.stop();
      pulseLoop.stop();
    };
  }, [active, flowDuration, flowAnim, pulseAnim]);

  // Primary wave translation: translates 1 full period
  const primaryWaveTranslateX = flowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6 * intensity, 0.95 * intensity],
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.05],
  });

  const borderRadius = size / 2;
  const glowSize = size * 1.35;

  // Continuous seamless sine wave across 6 periodic cycles (-400 to 800)
  // Wavelength = 200 coordinate units. Crest at x+50 (y=65), Trough at x+150 (y=135)
  const wavePath =
    'M -400 100 ' +
    'C -365 60, -335 60, -300 100 C -265 140, -235 140, -200 100 ' +
    'C -165 60, -135 60, -100 100 C -65 140, -35 140, 0 100 ' +
    'C 35 60, 65 60, 100 100 C 135 140, 165 140, 200 100 ' +
    'C 235 60, 265 60, 300 100 C 335 140, 365 140, 400 100 ' +
    'C 435 60, 465 60, 500 100 C 535 140, 565 140, 600 100 ' +
    'C 635 60, 665 60, 700 100 C 735 140, 765 140, 800 100';

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.root,
        {
          width: size,
          height: size,
        },
        style,
      ]}
    >
      {/* 1. Atmospheric Ambient Corona Halo */}
      {showGlow && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.outerGlowHalo,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        >
          <Svg width={glowSize} height={glowSize} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient
                id="orbCoronaGrad"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.5" />
                <Stop offset="35%" stopColor="#0066ff" stopOpacity="0.3" />
                <Stop offset="70%" stopColor="#001855" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#orbCoronaGrad)" />
          </Svg>
        </Animated.View>
      )}

      {/* 2. Glass Sphere Container with Clipping Boundary */}
      <View
        style={[
          styles.sphereWrapper,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
      >
        {/* Base Obsidian Void SVG */}
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient
              id="sphereVoidGrad"
              cx="50%"
              cy="45%"
              r="60%"
              fx="48%"
              fy="40%"
            >
              <Stop offset="0%" stopColor="#071836" stopOpacity="1" />
              <Stop offset="45%" stopColor="#030c1e" stopOpacity="1" />
              <Stop offset="80%" stopColor="#01040a" stopOpacity="1" />
              <Stop offset="100%" stopColor="#000103" stopOpacity="1" />
            </RadialGradient>

            {/* Top Studio Specular Crescent Glaze */}
            <SvgLinearGradient
              id="crescentSpecularGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <Stop offset="30%" stopColor="#c5eeff" stopOpacity="0.5" />
              <Stop offset="65%" stopColor="#0099ff" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Bottom Subtle Reflection Arc */}
            <SvgLinearGradient
              id="bottomBounceGrad"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <Stop offset="0%" stopColor="#00c8ff" stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#0055ff" stopOpacity="0.1" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            <ClipPath id="sphereInnerClip">
              <Circle cx="100" cy="100" r="96" />
            </ClipPath>
          </Defs>

          {/* Deep Dark Obsidian Body */}
          <Circle cx="100" cy="100" r="97" fill="url(#sphereVoidGrad)" />
        </Svg>

        {/* 3. Primary Flowing Bioluminescent Plasma Wave */}
        <Animated.View
          style={[
            styles.flowingWaveContainer,
            {
              width: size * 5,
              height: size,
              transform: [{ translateX: primaryWaveTranslateX }],
            },
          ]}
        >
          <Svg
            width={size * 5}
            height={size}
            viewBox="0 0 1000 200"
            style={styles.svgFill}
          >
            {/* Wave Glow Layer 1: Sapphire Bloom */}
            <Path
              d={wavePath}
              fill="none"
              stroke="#0044ff"
              strokeWidth="24"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />

            {/* Wave Glow Layer 2: Vivid Azure Core */}
            <Path
              d={wavePath}
              fill="none"
              stroke="#0099ff"
              strokeWidth="14"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />

            {/* Wave Glow Layer 3: Electric Cyan Plasma Core */}
            <Path
              d={wavePath}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="6.5"
              strokeOpacity="0.95"
              strokeLinecap="round"
            />

            {/* Wave Glow Layer 4: Laser White Central Thread */}
            <Path
              d={wavePath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeOpacity="1.0"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* 4. Pure Liquid Glass Surface Optics (Specular Crescent + Fresnel Rim) */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            {/* Top Softbox Specular Highlight Crescent */}
            <Path
              d="M 32 46 A 93 93 0 0 1 168 46 C 145 60, 55 60, 32 46 Z"
              fill="url(#crescentSpecularGrad)"
            />

            {/* Top Apex Razor Reflection Arc */}
            <Path
              d="M 60 16 A 94 94 0 0 1 140 16"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.0"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />

            {/* Bottom Ambient Ground Glow Arc */}
            <Path
              d="M 46 166 A 94 94 0 0 0 154 166 C 138 156, 62 156, 46 166 Z"
              fill="url(#bottomBounceGrad)"
            />

            {/* Outer Razor Cyan Fresnel Rim Stroke */}
            <Circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.5"
              strokeOpacity="0.9"
            />

            {/* Inner Concentric Sapphire Bevel */}
            <Circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="#0066ff"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
          </Svg>
        </View>
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerGlowHalo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  sphereWrapper: {
    backgroundColor: '#01030a',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  flowingWaveContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
  },
  svgFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
