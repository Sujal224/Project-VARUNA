import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';

interface NavLaserIndicatorProps {
  /** Target center X coordinate in the navbar container */
  targetX: number;
  /** Whether the indicator is currently visible (hidden for center orb) */
  visible: boolean;
}

const INDICATOR_WIDTH = 30;
const INDICATOR_HEIGHT = 4;

export const NavLaserIndicator: React.FC<NavLaserIndicatorProps> = ({
  targetX,
  visible,
}) => {
  const translateX = useRef(new Animated.Value(targetX)).current;
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: targetX,
        damping: 15,
        stiffness: 170,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [targetX, visible, translateX, opacityAnim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { translateX: translateX },
            { translateX: -INDICATOR_WIDTH / 2 },
          ],
        },
      ]}
    >
      {/* 1. Luminous Diffuse Ambient Bloom */}
      <View style={styles.diffuseGlow} />

      {/* 2. Precision Laser Beam with Cyan Gradient */}
      <Svg
        width={INDICATOR_WIDTH}
        height={INDICATOR_HEIGHT}
        viewBox={`0 0 ${INDICATOR_WIDTH} ${INDICATOR_HEIGHT}`}
      >
        <Defs>
          <SvgLinearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
            <Stop offset="25%" stopColor="#00e5ff" stopOpacity="0.85" />
            <Stop offset="50%" stopColor="#ffffff" stopOpacity="1.0" />
            <Stop offset="75%" stopColor="#00e5ff" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x={0}
          y={1}
          width={INDICATOR_WIDTH}
          height={2}
          rx={1}
          fill="url(#laserGrad)"
        />
      </Svg>

      {/* 3. Center Laser Hotspot Glint */}
      <View style={styles.centerGlint} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  diffuseGlow: {
    position: 'absolute',
    width: INDICATOR_WIDTH * 1.2,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 229, 255, 0.4)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  centerGlint: {
    position: 'absolute',
    width: 6,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#ffffff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 4,
  },
});
