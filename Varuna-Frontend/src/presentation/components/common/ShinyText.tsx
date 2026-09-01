import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
  Mask,
  Rect,
  G,
} from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface ShinyTextProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  baseColor?: string;
  shinyColor?: string;
  accentColor?: string;
  duration?: number;
  pauseDuration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ultra-Premium Specular Shiny Text component for VARUNA.
 * Emulates high-end liquid-glass typographic illumination with silky-smooth,
 * unhurried physics and feathered specular gradients (no distracting particles/dots).
 */
export const ShinyText: React.FC<ShinyTextProps> = ({
  text = 'Your AI partner for the ocean.',
  fontSize = 13.5,
  fontFamily = 'Inter_500Medium',
  baseColor = '#8da2be',
  shinyColor = '#ffffff',
  accentColor = '#7dd3fc',
  duration = 3600,
  pauseDuration = 2200,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Calculate layout dimensions based on text length with optical breathing room
  const approxCharWidth = fontSize * 0.58;
  const textWidth = Math.ceil(text.length * approxCharWidth + 28);
  const textHeight = Math.ceil(fontSize * 1.6);
  // Wide, smoothly feathered specular band
  const bandWidth = Math.max(140, Math.floor(textWidth * 0.6));

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: duration,
          easing: Easing.bezier(0.2, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.delay(pauseDuration), // Deep, luxurious breathing cycle between sweeps
      ])
    );

    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, [shimmerAnim, duration, pauseDuration]);

  // Silky sweep from far left to far right
  const shimmerX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-bandWidth - 30, textWidth + 40],
  });

  return (
    <View style={[styles.container, { width: textWidth, height: textHeight }, style]}>
      <Svg
        width={textWidth}
        height={textHeight}
        viewBox={`0 0 ${textWidth} ${textHeight}`}
        style={styles.svg}
      >
        <Defs>
          {/* Feathered Specular Liquid-Glass Gradient */}
          <LinearGradient id="specularGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={shinyColor} stopOpacity="0" />
            <Stop offset="18%" stopColor={accentColor} stopOpacity="0.1" />
            <Stop offset="36%" stopColor={accentColor} stopOpacity="0.45" />
            <Stop offset="50%" stopColor={shinyColor} stopOpacity="0.95" />
            <Stop offset="64%" stopColor={accentColor} stopOpacity="0.45" />
            <Stop offset="82%" stopColor={accentColor} stopOpacity="0.1" />
            <Stop offset="100%" stopColor={shinyColor} stopOpacity="0" />
          </LinearGradient>

          {/* SVG Letterform Mask strictly bounding the shine to typography */}
          <Mask id="shinyTextMask">
            <SvgText
              x="0"
              y={fontSize + 1}
              fill="#ffffff"
              fontSize={fontSize}
              fontFamily={fontFamily}
              letterSpacing={0.2}
            >
              {text}
            </SvgText>
          </Mask>
        </Defs>

        {/* 1. Base Resting Typography in Cool Metallic Slate */}
        <SvgText
          x="0"
          y={fontSize + 1}
          fill={baseColor}
          fontSize={fontSize}
          fontFamily={fontFamily}
          letterSpacing={0.2}
        >
          {text}
        </SvgText>

        {/* 2. Seamless Specular Beam Sweeping Across Letterforms */}
        <G mask="url(#shinyTextMask)">
          <AnimatedRect
            x={shimmerX}
            y="0"
            width={bandWidth}
            height={textHeight}
            fill="url(#specularGlow)"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  svg: {
    overflow: 'visible',
  },
});
