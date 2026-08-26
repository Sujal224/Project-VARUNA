import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface AnimatedBellIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  triggerKey?: number | boolean;
  hasBadge?: boolean;
}

export const AnimatedBellIcon: React.FC<AnimatedBellIconProps> = ({
  size = 24,
  color = '#00e5ff',
  strokeWidth = 1.9,
  triggerKey,
  hasBadge = true,
}) => {
  // Harmonic pendulum bell swing animation controller
  const swingAnim = useRef(new Animated.Value(0)).current;
  // Sound wave acoustic ripple controller
  const waveAnim = useRef(new Animated.Value(0)).current;
  // Badge breathing controller
  const badgePulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Harmonic bell swing sequence
    swingAnim.setValue(0);
    waveAnim.setValue(0);

    Animated.parallel([
      Animated.timing(swingAnim, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [triggerKey]);

  // Continuous subtle pulse for the notification badge
  useEffect(() => {
    if (!hasBadge) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hasBadge]);

  // Bell body harmonic oscillation
  const bellRotate = swingAnim.interpolate({
    inputRange: [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1],
    outputRange: ['0deg', '-20deg', '16deg', '-11deg', '6deg', '-2deg', '0deg'],
  });

  // Clapper counter-harmonic swing (swings opposite to body for realism)
  const clapperTranslateX = swingAnim.interpolate({
    inputRange: [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1],
    outputRange: [0, 2.8, -2.4, 1.6, -0.9, 0.3, 0],
  });

  // Sound ripple wave opacity & scale
  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.85, 0],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.4],
  });

  const badgeScale = badgePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.2],
  });

  const badgeGlow = badgePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Acoustic Sound Waves Emitted on Ring */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.soundWaveWrapper,
          {
            opacity: waveOpacity,
            transform: [{ scale: waveScale }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M 2 10.5 C 1 12 1 14 2 15.5"
            fill="none"
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Path
            d="M 22 10.5 C 23 12 23 14 22 15.5"
            fill="none"
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* 2. Main Bell Body with Top Hinge Anchor Pivot */}
      <Animated.View
        style={[
          styles.bellBodyWrapper,
          {
            transform: [
              { translateY: -size * 0.35 },
              { rotate: bellRotate },
              { translateY: size * 0.35 },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Top Anchor Ring */}
          <Path
            d="M 12 3 C 10.8 3 10 3.8 10 4.8 L 14 4.8 C 14 3.8 13.2 3 12 3 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Fluid Curved Bell Skirt */}
          <Path
            d="M 12 4.5 C 8.5 4.5 5.8 7.5 5.8 12.5 C 5.8 15 4.5 16.5 4 17 L 20 17 C 19.5 16.5 18.2 15 18.2 12.5 C 18.2 7.5 15.5 4.5 12 4.5 Z"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* 3. Counter-Oscillating Bottom Clapper Hammer */}
      <Animated.View
        style={[
          styles.clapperWrapper,
          {
            transform: [{ translateX: clapperTranslateX }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M 10.2 17.5 C 10.2 18.8 11 19.8 12 19.8 C 13 19.8 13.8 18.8 13.8 17.5"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* 4. Active Electric Cyan Notification Badge Dot */}
      {hasBadge && (
        <Animated.View
          style={[
            styles.badgeDot,
            {
              opacity: badgeGlow,
              transform: [{ scale: badgeScale }],
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  soundWaveWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  bellBodyWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  clapperWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 5,
    elevation: 4,
  },
});
