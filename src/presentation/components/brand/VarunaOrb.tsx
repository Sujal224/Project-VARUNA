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
  /** Diameter of the orb in density-independent pixels. Defaults to 48. */
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
 * VarunaOrb - Apple-level Pure Liquid Bubble Glass with Flowing Horizon Wave.
 *
 * Engineered with:
 * - Continuous, seamless 60/120 FPS horizontal wave flow propagation (zero seams, zero artifacts)
 * - Ultra-luminous 4-layer bioluminescent plasma wave (brilliant white core + cyber cyan corona)
 * - Pure liquid bubble glass optics (studio softbox specular glaze + double Fresnel rims)
 * - Volumetric internal caustic sweeps (upper & lower light bending)
 * - Harmonic secondary counter-wave for rich liquid depth
 * - 100% Native Driver hardware acceleration
 */
export const VarunaOrb: React.FC<VarunaOrbProps> = ({
  size = 48,
  active = true,
  speed = 'normal',
  showGlow = true,
  intensity = 1.0,
  style,
  onPress,
}) => {
  // 100% Native Driver Animation Controllers
  const flowAnim = useRef(new Animated.Value(0)).current;
  const secondaryFlowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const swellAnim = useRef(new Animated.Value(0)).current;

  // Wave flow duration tuned for serene, silky-smooth luxury motion
  const flowDuration = speed === 'fast' ? 5200 : speed === 'slow' ? 14000 : 9000;

  useEffect(() => {
    if (!active) {
      flowAnim.setValue(0);
      secondaryFlowAnim.setValue(0);
      pulseAnim.setValue(0.5);
      swellAnim.setValue(0.5);
      return;
    }

    // 1. Primary continuous flowing wave (smooth, serene, meditative flow)
    const primaryFlowLoop = Animated.loop(
      Animated.timing(flowAnim, {
        toValue: 1,
        duration: flowDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Secondary counter-wave flow (harmonic depth)
    const secondaryFlowLoop = Animated.loop(
      Animated.timing(secondaryFlowAnim, {
        toValue: 1,
        duration: flowDuration * 1.4,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Volumetric corona breathing pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Subtle vertical ocean swell displacement
    const swellLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swellAnim, {
          toValue: 1,
          duration: 5400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swellAnim, {
          toValue: 0,
          duration: 5400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    primaryFlowLoop.start();
    secondaryFlowLoop.start();
    pulseLoop.start();
    swellLoop.start();

    return () => {
      primaryFlowLoop.stop();
      secondaryFlowLoop.stop();
      pulseLoop.stop();
      swellLoop.stop();
    };
  }, [active, flowDuration, flowAnim, secondaryFlowAnim, pulseAnim, swellAnim]);

  // Primary wave translation: translates exactly 1 full period (size pixels = 200 coordinate units)
  const primaryWaveTranslateX = flowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size],
  });

  const secondaryWaveTranslateX = secondaryFlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, 0],
  });

  const waveSwellTranslateY = swellAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.02, size * 0.02],
  });

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65 * intensity, 1.0 * intensity],
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.06],
  });

  const borderRadius = size / 2;
  const glowSize = size * 1.38;

  // Seamless continuous wave paths across 6 periodic cycles (-400 to 800)
  // Wavelength = 200 coordinate units. Crest at x+50 (y=66), Trough at x+150 (y=134)
  const primaryWavePath =
    'M -400 100 ' +
    'C -372 64, -328 64, -300 100 C -272 136, -228 136, -200 100 ' +
    'C -172 64, -128 64, -100 100 C -72 136, -28 136, 0 100 ' +
    'C 28 64, 72 64, 100 100 C 128 136, 172 136, 200 100 ' +
    'C 228 64, 272 64, 300 100 C 328 136, 372 136, 400 100 ' +
    'C 428 64, 472 64, 500 100 C 528 136, 572 136, 600 100 ' +
    'C 628 64, 672 64, 700 100 C 728 136, 772 136, 800 100';

  // Harmonic secondary wave (shallower amplitude for liquid counter-current)
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
      {/* 1. Atmospheric Deep Liquid Corona (Breathing Glow) */}
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
                id="bubbleCoronaGrad"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.65" />
                <Stop offset="30%" stopColor="#0066ff" stopOpacity="0.45" />
                <Stop offset="65%" stopColor="#001855" stopOpacity="0.18" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#bubbleCoronaGrad)" />
          </Svg>
        </Animated.View>
      )}

      {/* 2. Primary 3D Liquid Bubble Glass Sphere Container */}
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
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            {/* Liquid Bubble Glass Spherical Base Gradient */}
            <RadialGradient
              id="bubbleVoidGrad"
              cx="40%"
              cy="34%"
              r="68%"
              fx="36%"
              fy="28%"
            >
              <Stop offset="0%" stopColor="#0a2a5e" stopOpacity="1" />
              <Stop offset="25%" stopColor="#041434" stopOpacity="1" />
              <Stop offset="60%" stopColor="#010716" stopOpacity="1" />
              <Stop offset="100%" stopColor="#000105" stopOpacity="1" />
            </RadialGradient>

            {/* Studio Gloss Meniscus Highlight (Top-Left Dome) */}
            <SvgLinearGradient
              id="bubbleSpecularGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <Stop offset="20%" stopColor="#d5f5ff" stopOpacity="0.75" />
              <Stop offset="50%" stopColor="#38bdf8" stopOpacity="0.32" />
              <Stop offset="80%" stopColor="#0066ff" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Upper Hemisphere Volumetric Caustic Arc */}
            <SvgLinearGradient
              id="upperCausticSheet"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#0055ff" stopOpacity="0" />
              <Stop offset="40%" stopColor="#00e5ff" stopOpacity="0.45" />
              <Stop offset="80%" stopColor="#0077ff" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Lower Hemisphere Volumetric Caustic Pool */}
            <SvgLinearGradient
              id="lowerCausticSheet"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor="#001866" stopOpacity="0" />
              <Stop offset="45%" stopColor="#0088ff" stopOpacity="0.5" />
              <Stop offset="85%" stopColor="#00e5ff" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Right Wall Internal Refraction Light Wrap */}
            <SvgLinearGradient
              id="rightWallRefractGrad"
              x1="100%"
              y1="50%"
              x2="0%"
              y2="50%"
            >
              <Stop offset="0%" stopColor="#00f0ff" stopOpacity="0.65" />
              <Stop offset="40%" stopColor="#0066ff" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Left Wall Internal Refraction Light Wrap */}
            <SvgLinearGradient
              id="leftWallRefractGrad"
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
            >
              <Stop offset="0%" stopColor="#00f0ff" stopOpacity="0.55" />
              <Stop offset="40%" stopColor="#0066ff" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Bottom Bubble Bounce Light Arc */}
            <SvgLinearGradient
              id="bottomBounceArcGrad"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <Stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
              <Stop offset="40%" stopColor="#0077ff" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </SvgLinearGradient>

            {/* Inner Circular Boundary Clip */}
            <ClipPath id="bubbleInnerClip">
              <Circle cx="100" cy="100" r="94.5" />
            </ClipPath>
          </Defs>

          {/* Liquid Glass Dark Spherical Base Body */}
          <Circle cx="100" cy="100" r="95" fill="url(#bubbleVoidGrad)" />

          {/* Internal Volumetric Caustics (Clipped Inside Sphere) */}
          <G clipPath="url(#bubbleInnerClip)">
            {/* Upper Hemisphere Volumetric Light Sheet */}
            <Path
              d="M 22 78 C 55 36, 145 36, 178 78 C 148 54, 52 54, 22 78 Z"
              fill="url(#upperCausticSheet)"
            />

            {/* Lower Hemisphere Volumetric Light Pool */}
            <Path
              d="M 22 122 C 55 164, 145 164, 178 122 C 148 146, 52 146, 22 122 Z"
              fill="url(#lowerCausticSheet)"
            />

            {/* Right Wall Internal Refraction Sweep */}
            <Path
              d="M 152 48 C 190 76, 190 124, 152 152 C 176 126, 176 74, 152 48 Z"
              fill="url(#rightWallRefractGrad)"
            />

            {/* Left Wall Internal Refraction Sweep */}
            <Path
              d="M 48 48 C 10 76, 10 124, 48 152 C 24 126, 24 74, 48 48 Z"
              fill="url(#leftWallRefractGrad)"
            />

            {/* Soft Ambient Horizon Dispersion */}
            <Path
              d="M 0 100 Q 100 66, 200 100 Q 100 134, 0 100 Z"
              fill="#0055ff"
              fillOpacity="0.22"
            />
          </G>
        </Svg>

        {/* 3. Primary Flowing Bioluminescent Plasma Wave (Continuous 60/120 FPS Flow) */}
        <Animated.View
          style={[
            styles.flowingWaveContainer,
            {
              width: size * 5, // Spans 5 periodic wavelengths
              height: size,
              transform: [
                { translateX: primaryWaveTranslateX },
                { translateY: waveSwellTranslateY },
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
            {/* Wave Layer 1: Deep Sapphire Atmospheric Bloom */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#003cd6"
              strokeWidth="28"
              strokeOpacity="0.38"
              strokeLinecap="round"
            />

            {/* Wave Layer 2: Vivid Royal Azure Glow */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#0088ff"
              strokeWidth="15"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />

            {/* Wave Layer 3: Electric Cyber Cyan Core Halo */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="7"
              strokeOpacity="0.95"
              strokeLinecap="round"
            />

            {/* Wave Layer 4: Brilliant White-Hot Laser Core */}
            <Path
              d={primaryWavePath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeOpacity="1"
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
              opacity: 0.5,
              transform: [
                { translateX: secondaryWaveTranslateX },
                { translateY: waveSwellTranslateY },
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

        {/* 5. Pure Liquid Glass Surface: Studio Specular Glaze & Double Fresnel Rims */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            {/* A. Inner Concentric Crystal Refraction Ring (High Index Shell Bevel) */}
            <Circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#0066ff"
              strokeWidth="1.8"
              strokeOpacity="0.8"
            />

            {/* B. Studio Softbox Crescent Specular Glaze (Top-Left Bubble Gloss) */}
            <Path
              d="M 28 39.5 A 94 94 0 0 1 172 39.5 C 146 54, 54 54, 28 39.5 Z"
              fill="url(#bubbleSpecularGrad)"
            />

            {/* C. Top Apex Grazing Razor Highlight Arc */}
            <Path
              d="M 55 16 A 94 94 0 0 1 145 16"
              fill="none"
              stroke="#e8f8ff"
              strokeWidth="2.2"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />

            {/* D. Precision Apex Specular Glint Pinpoint */}
            <Circle
              cx="99"
              cy="6.8"
              r="2.2"
              fill="#ffffff"
              fillOpacity="0.95"
            />
            <Circle
              cx="99"
              cy="6.8"
              r="5.0"
              fill="#00f0ff"
              fillOpacity="0.4"
            />

            {/* E. Bottom Liquid Bounce Ground Arc */}
            <Path
              d="M 39.5 160.5 A 94 94 0 0 0 160.5 160.5 C 142 151, 58 151, 39.5 160.5 Z"
              fill="url(#bottomBounceArcGrad)"
            />

            {/* F. Outer Total Internal Reflection (TIR) Razor Neon Cyan Rim */}
            <Circle
              cx="100"
              cy="100"
              r="94"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.8"
              strokeOpacity="1.0"
            />

            {/* G. Extreme Grazing Outer Atmospheric Micro-Rim */}
            <Circle
              cx="100"
              cy="100"
              r="95.5"
              fill="none"
              stroke="#0088ff"
              strokeWidth="1.5"
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
    backgroundColor: '#000105',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
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
