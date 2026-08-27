import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';

interface AnimatedMapIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  triggerKey?: number | boolean;
}

export const AnimatedMapIcon: React.FC<AnimatedMapIconProps> = ({
  size = 24,
  color = '#00e5ff',
  strokeWidth = 1.8,
  triggerKey,
}) => {
  // Submerge & converge fold controller
  const foldAnim = useRef(new Animated.Value(0)).current;
  // Waypoint beacon glow controller
  const beaconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    foldAnim.setValue(0);
    beaconAnim.setValue(0);

    Animated.sequence([
      // Phase 1: Submerge and converge inward
      Animated.timing(foldAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      // Phase 2: Emerge and spring-unfold to full expansion
      Animated.spring(foldAnim, {
        toValue: 2,
        damping: 10,
        stiffness: 200,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse the nautical waypoint beacon on unfold
    Animated.sequence([
      Animated.delay(180),
      Animated.timing(beaconAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(beaconAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [triggerKey]);

  // Overall map container submerge depth and emerge spring
  const containerScale = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1.0, 0.85, 1.0],
  });

  const containerTranslateY = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 2.2, 0],
  });

  // Left panel convergence fold
  const leftPanelTranslateX = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1.6, 0],
  });

  const leftPanelScaleX = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1.0, 0.8, 1.0],
  });

  // Right panel convergence fold
  const rightPanelTranslateX = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -1.6, 0],
  });

  const rightPanelScaleX = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1.0, 0.8, 1.0],
  });

  // Center panel accordion tilt
  const centerPanelScaleX = foldAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1.0, 0.92, 1.0],
  });

  // Beacon waypoint glow
  const beaconOpacity = beaconAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.0, 0],
  });

  const beaconScale = beaconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.6],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { translateY: containerTranslateY },
            { scale: containerScale },
          ],
        },
      ]}
    >
      {/* 1. Left Folding Map Panel */}
      <Animated.View
        style={[
          styles.panelLayer,
          {
            transform: [
              { translateX: leftPanelTranslateX },
              { scaleX: leftPanelScaleX },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon
            points="3,6 9,3 9,18 3,21"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* 2. Center Folding Map Panel */}
      <Animated.View
        style={[
          styles.panelLayer,
          {
            transform: [{ scaleX: centerPanelScaleX }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon
            points="9,3 15,6 15,21 9,18"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* 3. Right Folding Map Panel */}
      <Animated.View
        style={[
          styles.panelLayer,
          {
            transform: [
              { translateX: rightPanelTranslateX },
              { scaleX: rightPanelScaleX },
            ],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon
            points="15,6 21,3 21,18 15,21"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* 4. Luminous Nautical Waypoint Beacon Pulse */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.panelLayer,
          {
            opacity: beaconOpacity,
            transform: [{ scale: beaconScale }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="2" fill="#ffffff" />
          <Circle
            cx="12"
            cy="12"
            r="4.5"
            fill="none"
            stroke="#00e5ff"
            strokeWidth={1.2}
            strokeOpacity={0.85}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  panelLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
