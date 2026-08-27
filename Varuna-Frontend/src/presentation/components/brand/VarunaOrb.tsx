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
 * VarunaOrb - Apple-level Pure Liquid Glass Sphere with Fluid Horizon Wave.
 *
 * Engineered with:
 * - Seamless 60/120 FPS continuous linear flow propagation (zero seams, zero hitch)
 * - Harmonic secondary counter-wave for rich liquid refraction depth
 * - Gentle ocean swell vertical respiration (subtle tidal float)
 * - 4-layer bioluminescent plasma wave (brilliant white laser core + electric cyan & cobalt corona)
 * - Studio softbox crescent specular highlight & double Fresnel razor rims
 * - 100% Native Driver hardware acceleration
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
  // Native Driver Animation Controllers
  const flowAnim = useRef(new Animated.Value(0)).current;
  const secondaryFlowAnim = useRef(new Animated.Value(0)).current;
  const swellAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Durations tuned for silky, hypnotic, luxury marine flow
  const flowDuration = speed === 'fast' ? 3800 : speed === 'slow' ? 10000 : 6000;

  useEffect(() => {
    if (!active) {
      flowAnim.setValue(0);
      secondaryFlowAnim.setValue(0);
      swellAnim.setValue(0.5);
      pulseAnim.setValue(0.5);
      return;
    }

    // 1. Primary continuous flowing wave (smooth linear loop)
    const primaryFlowLoop = Animated.loop(
      Animated.timing(flowAnim, {
        toValue: 1,
        duration: flowDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Secondary counter-harmonic wave (smooth liquid depth)
    const secondaryFlowLoop = Animated.loop(
      Animated.timing(secondaryFlowAnim, {
        toValue: 1,
        duration: flowDuration * 1.38,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Subtle vertical ocean swell displacement
    const swellLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swellAnim, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swellAnim, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Volumetric ambient breathing pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    primaryFlowLoop.start();
    secondaryFlowLoop.start();
    swellLoop.start();
    pulseLoop.start();

    return () => {
      primaryFlowLoop.stop();
      secondaryFlowLoop.stop();
      swellLoop.stop();
      pulseLoop.stop();
    };
  }, [active, flowDuration, flowAnim, secondaryFlowAnim, swellAnim, pulseAnim]);

  // Primary wave translation: translates exactly 1 full period (size pixels = 200 SVG coordinate units)
  const primaryWaveTranslateX = flowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size],
  });

  // Secondary harmonic wave translation (counter-current flow)
  const secondaryWaveTranslateX = secondaryFlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, 0],
  });

  // Vertical ocean swell displacement
  const waveTranslateY = swellAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-1.4, 1.4],
  });

  // Ambient corona pulse
  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65 * intensity, 1.0 * intensity],
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.06],
  });

  const borderRadius = size / 2;
  const glowSize = size * 1.36;

  // Seamless continuous primary wave paths across 6 periodic cycles (-400 to 800)
  // Wavelength = 200 coordinate units. Crest at x+50 (y=62), Trough at x+150 (y=138)
  const primaryWavePath =
    'M -400 100 ' +
    'C -365 62, -335 62, -300 100 C -265 138, -235 138, -200 100 ' +
    'C -165 62, -135 62, -100 100 C -65 138, -35 138, 0 100 ' +
    'C 35 62, 65 62, 100 100 C 135 138, 165 138, 200 100 ' +
    'C 235 62, 265 62, 300 100 C 335 138, 365 138, 400 100 ' +
    'C 435 62, 465 62, 500 100 C 535 138, 565 138, 600 100 ' +
    'C 635 62, 665 62, 700 100 C 735 138, 765 138, 800 100';

  // Harmonic secondary counter-wave (shallower amplitude for liquid optical depth)
  const secondaryWavePath =
    'M -400 100 ' +
    'C -365 78, -335 78, -300 100 C -265 122, -235 122, -200 100 ' +
    'C -165 78, -135 78, -100 100 C -65 122, -35 122, 0 100 ' +
    'C 35 78, 65 78, 100 100 C 135 122, 165 122, 200 100 ' +
    'C 235 78, 265 78, 300 100 C 335 122, 365 122, 400 100 ' +
    'C 435 78, 465 78, 500 100 C 535 122, 565 122, 600 100 ' +
    'C 635 78, 665 78, 700 100 C 735 122, 765 122, 800 100';

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
                <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.55" />
                <Stop offset="35%" stopColor="#0066ff" stopOpacity="0.32" />
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
              transform: [
                { translateX: primaryWaveTranslateX },
                { translateY: waveTranslateY },
              ],
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
              d={primaryWavePath}
              fill="none"
              stroke="#003cd6"
              strokeWidth="24"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />

            {/* Wave Glow Layer 2: Vivid Azure Core */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#0088ff"
              strokeWidth="14"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />

            {/* Wave Glow Layer 3: Electric Cyan Plasma Core */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="6.5"
              strokeOpacity="0.95"
              strokeLinecap="round"
            />

            {/* Wave Glow Layer 4: Laser White Central Thread */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeOpacity="1.0"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* 4. Secondary Harmonic Counter-Wave (Liquid Depth) */}
        <Animated.View
          style={[
            styles.flowingWaveContainer,
            {
              width: size * 5,
              height: size,
              opacity: 0.45,
              transform: [
                { translateX: secondaryWaveTranslateX },
                { translateY: waveTranslateY },
              ],
            },
          ]}
        >
          <Svg
            width={size * 5}
            height={size}
            viewBox="0 0 1000 200"
            style={styles.svgFill}
          >
            <Path
              d={secondaryWavePath}
              fill="none"
              stroke="#0066ff"
              strokeWidth="8"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
            <Path
              d={secondaryWavePath}
              fill="none"
              stroke="#55ddff"
              strokeWidth="2.2"
              strokeOpacity="0.8"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* 5. Pure Liquid Glass Surface Optics (Specular Crescent + Fresnel Rim) */}
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
              strokeWidth={2.5}
              strokeOpacity="0.9"
            />

            {/* Inner Concentric Sapphire Bevel */}
            <Circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="#0066ff"
              strokeWidth={1.2}
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
