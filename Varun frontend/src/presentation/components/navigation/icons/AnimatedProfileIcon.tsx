import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface AnimatedProfileIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  triggerKey?: number | boolean;
}

export const AnimatedProfileIcon: React.FC<AnimatedProfileIconProps> = ({
  size = 24,
  color = '#00e5ff',
  strokeWidth = 1.9,
  triggerKey,
}) => {
  // Head pop & body expansion controller
  const popAnim = useRef(new Animated.Value(0)).current;
  // Biometric identity sonar ripple controller
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    popAnim.setValue(0);
    rippleAnim.setValue(0);

    Animated.parallel([
      Animated.spring(popAnim, {
        toValue: 1,
        damping: 10,
        stiffness: 220,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(80),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [triggerKey]);

  // Head vertical pop & scale
  const headTranslateY = popAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [0, -2.5, 0.8, 0],
  });

  const headScale = popAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [1, 1.18, 0.96, 1],
  });

  // Body shoulder horizontal expansion
  const bodyScaleX = popAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [1, 1.12, 0.97, 1],
  });

  // Biometric ripple ring
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.75, 0],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.5],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Biometric Sonar Aura Ripple */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fillWrapper,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle
            cx="12"
            cy="8"
            r="6.5"
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            strokeOpacity={0.8}
          />
        </Svg>
      </Animated.View>

      {/* 2. Kinetic Head Element */}
      <Animated.View
        style={[
          styles.fillWrapper,
          {
            transform: [
              { translateY: headTranslateY },
              { scale: headScale },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle
            cx="12"
            cy="8"
            r="4.2"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Svg>
      </Animated.View>

      {/* 3. Kinetic Body / Shoulders Arc */}
      <Animated.View
        style={[
          styles.fillWrapper,
          {
            transform: [{ scaleX: bodyScaleX }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M 4 20.5 C 4 16.5 7.5 14.5 12 14.5 C 16.5 14.5 20 16.5 20 20.5"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fillWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
