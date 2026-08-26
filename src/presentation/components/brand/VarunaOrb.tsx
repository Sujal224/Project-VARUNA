import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../../theme/colors';

interface VarunaOrbProps {
  size?: number;
  active?: boolean;
  style?: ViewStyle;
}

export const VarunaOrb: React.FC<VarunaOrbProps> = ({
  size = 48,
  active = true,
  style,
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Flowing horizon wave loop
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing glow loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    waveLoop.start();
    pulseLoop.start();

    return () => {
      waveLoop.stop();
      pulseLoop.stop();
    };
  }, [waveAnim, pulseAnim]);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.0],
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.05],
  });

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.15, size * 0.15],
  });

  const borderRadius = size / 2;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius },
        style,
      ]}
    >
      {/* Outer ambient glow halo */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: (size * 1.3) / 2,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      {/* Dark Dimensional Glass Sphere */}
      <View
        style={[
          styles.orbSphere,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
      >
        {/* Subtle top-left light reflection */}
        <View
          style={[
            styles.specularHighlight,
            {
              width: size * 0.5,
              height: size * 0.25,
              borderRadius: size * 0.25,
              top: size * 0.08,
              left: size * 0.18,
            },
          ]}
        />

        {/* Luminous flowing horizon wave line */}
        <Animated.View
          style={[
            styles.waveContainer,
            {
              width: size * 1.4,
              height: size * 0.6,
              transform: [{ translateX: waveTranslateX }],
            },
          ]}
        >
          <Svg width={size * 1.4} height={size * 0.6} viewBox="0 0 100 40">
            <Defs>
              <SvgLinearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <Stop offset="20%" stopColor="#22d3ee" stopOpacity="0.4" />
                <Stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="80%" stopColor="#22d3ee" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
              </SvgLinearGradient>
            </Defs>

            {/* Subtle glow blur backdrop line */}
            <Path
              d="M 0 20 Q 25 10, 50 20 T 100 20"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="4"
              strokeOpacity="0.35"
            />
            {/* Crisp center luminous wave line */}
            <Path
              d="M 0 20 Q 25 10, 50 20 T 100 20"
              fill="none"
              stroke="url(#waveGlow)"
              strokeWidth="2"
            />
          </Svg>
        </Animated.View>

        {/* 1px glass rim border */}
        <View
          style={[
            styles.glassRim,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowHalo: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 211, 238, 0.18)',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  orbSphere: {
    backgroundColor: '#071524',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    elevation: 8,
  },
  specularHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ rotate: '-15deg' }],
  },
  waveContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassRim: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(138, 235, 255, 0.25)',
  },
});
