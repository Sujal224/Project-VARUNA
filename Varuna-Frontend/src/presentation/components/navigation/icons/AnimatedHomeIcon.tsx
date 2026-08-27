import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface AnimatedHomeIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  isActive?: boolean;
  triggerKey?: number | boolean;
}

export const AnimatedHomeIcon: React.FC<AnimatedHomeIconProps> = ({
  size = 24,
  color = '#00e5ff',
  strokeWidth = 1.9,
  isActive = true,
  triggerKey,
}) => {
  // Roof lift and spring controller
  const springAnim = useRef(new Animated.Value(0)).current;
  // Doorway glow fill controller
  const doorGlowAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    springAnim.setValue(0);

    Animated.spring(springAnim, {
      toValue: 1,
      damping: 10,
      stiffness: 220,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [triggerKey]);

  useEffect(() => {
    Animated.timing(doorGlowAnim, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  // Roof dynamic hop
  const roofTranslateY = springAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [0, -3.2, 1.2, 0],
  });

  // Base compression & bounce
  const baseScaleY = springAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [1, 0.94, 1.05, 1],
  });

  // Doorway illumination opacity
  const doorOpacity = doorGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.85],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Base Wall & Ground Structure */}
      <Animated.View
        style={[
          styles.fillWrapper,
          {
            transform: [{ scaleY: baseScaleY }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Main House Wall Structure */}
          <Path
            d="M 5 10.5 L 5 19.5 C 5 20.3 5.7 21 6.5 21 L 17.5 21 C 18.3 21 19 20.3 19 19.5 L 19 10.5"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Doorway Frame */}
          <Path
            d="M 9.5 21 L 9.5 14 C 9.5 13.2 10.2 12.5 11 12.5 L 13 12.5 C 13.8 12.5 14.5 13.2 14.5 14 L 14.5 21"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* 2. Luminous Doorway Hearth Illumination */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fillWrapper,
          {
            opacity: doorOpacity,
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect
            x={10}
            y={13.5}
            width={4}
            height={7}
            rx={1.5}
            fill="#00e5ff"
            fillOpacity={0.65}
          />
        </Svg>
      </Animated.View>

      {/* 3. Kinetic Roof with Upward Spring Hop */}
      <Animated.View
        style={[
          styles.fillWrapper,
          {
            transform: [{ translateY: roofTranslateY }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {/* Chimney */}
          <Path
            d="M 17 5 L 17 7.5"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.9}
            strokeLinecap="round"
          />

          {/* Gable Roof Ridge */}
          <Path
            d="M 3 11 L 12 3.5 L 21 11"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
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
