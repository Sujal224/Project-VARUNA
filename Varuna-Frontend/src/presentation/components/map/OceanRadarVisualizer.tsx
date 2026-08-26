import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  Polygon,
  G,
} from 'react-native-svg';
import { CloudLightning, Fish } from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';

const { width } = Dimensions.get('window');

interface OceanRadarVisualizerProps {
  onPressPfz?: () => void;
  onPressCyclone?: () => void;
}

export const OceanRadarVisualizer: React.FC<OceanRadarVisualizerProps> = ({
  onPressPfz,
  onPressCyclone,
}) => {
  const visualizerWidth = width - 36;
  const visualizerHeight = 175;

  // Telemetry radar pulse animation
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const handleCyclonePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressCyclone?.();
  };

  const handlePfzPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressPfz?.();
  };

  const sonarScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.25],
  });

  const sonarOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.2],
  });

  return (
    <View style={[styles.container, { width: visualizerWidth, height: visualizerHeight }]}>
      {/* SVG Canvas for Bathymetric Depth Contours & Luminous Wake Vector Trails */}
      <Svg
        width={visualizerWidth}
        height={visualizerHeight}
        viewBox={`0 0 ${visualizerWidth} ${visualizerHeight}`}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgRadialGradient id="oceanDepthGlow" cx="35%" cy="60%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.22" />
            <Stop offset="45%" stopColor="#0066ff" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </SvgRadialGradient>

          <SvgLinearGradient id="streamGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
            <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="1.0" />
          </SvgLinearGradient>

          <SvgLinearGradient id="contourGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
            <Stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0.08" />
          </SvgLinearGradient>
        </Defs>

        {/* Ambient ocean depth glow pool */}
        <Circle cx={visualizerWidth * 0.35} cy={visualizerHeight * 0.62} r={80} fill="url(#oceanDepthGlow)" />

        {/* Outer Bathymetric Contour Loops */}
        <Path
          d={`M 10 130 C 60 80, 140 90, 175 125 C 200 150, 140 175, 75 165 C 20 155, -10 140, 10 130 Z`}
          fill="none"
          stroke="url(#contourGrad)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />

        {/* Inner Closed Depth Contours */}
        <Path
          d={`M 40 120 C 75 95, 135 100, 155 125 C 170 145, 120 160, 75 155 C 45 150, 25 135, 40 120 Z`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          strokeOpacity="0.38"
        />

        {/* Secondary Contour Lines Across Ocean Field */}
        <Path
          d={`M 80 55 C 150 40, 230 70, ${visualizerWidth} 45`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.16)"
          strokeWidth="0.9"
          strokeDasharray="3 4"
        />

        <Path
          d={`M 110 80 C 170 65, 250 95, ${visualizerWidth} 80`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.18)"
          strokeWidth="0.9"
          strokeDasharray="2 3"
        />

        {/* Luminous Dotted Particle Stream Safe Route Wave */}
        <Path
          d={`M 35 155 C 85 145, 135 135, 160 105 C 180 80, 195 55, 230 30 C 248 18, 275 14, ${visualizerWidth} 10`}
          fill="none"
          stroke="url(#streamGlow)"
          strokeWidth="2.8"
          strokeDasharray="2 4"
          strokeLinecap="round"
        />

        {/* 3D Speedboat Vessel Vector */}
        <G transform={`translate(${visualizerWidth * 0.52}, ${visualizerHeight * 0.46}) rotate(-28)`}>
          {/* Hull shadow */}
          <Polygon points="-10,-4 14,-4 18,0 14,4 -10,4" fill="rgba(0,0,0,0.5)" />
          {/* Main sleek white hull */}
          <Polygon points="-9,-5 11,-5 17,0 11,5 -9,5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
          {/* Cabin Windshield */}
          <Polygon points="-3,-3 5,-3 8,0 5,3 -3,3" fill="#0284c7" />
          {/* Stern Wake Wave */}
          <Path d="M -10 -4 L -18 -8 M -10 4 L -18 8" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
        </G>
      </Svg>

      {/* Floating Marker (Left): Potential Fishing Zone */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePfzPress}
        style={[
          styles.pfzMarkerContainer,
          { left: visualizerWidth * 0.22, top: visualizerHeight * 0.42 },
        ]}
      >
        <View style={styles.pfzTextGroup}>
          <Text style={styles.pfzTitle}>Potential Fishing Zone</Text>
          <Text style={styles.pfzSub}>High Probability</Text>
        </View>

        <View style={styles.pfzSonarButton}>
          <Animated.View
            style={[
              styles.sonarRipple,
              {
                opacity: sonarOpacity,
                transform: [{ scale: sonarScale }],
              },
            ]}
          />
          <Fish size={14} color="#00e5ff" />
        </View>
      </TouchableOpacity>

      {/* Floating Liquid Glass Card (Right): Cyclone Watch */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCyclonePress}
        style={[
          styles.cycloneCard,
          { right: 4, top: visualizerHeight * 0.36 },
        ]}
      >
        <View style={styles.cycloneIconContainer}>
          <CloudLightning size={16} color="#00e5ff" />
        </View>
        <View style={styles.cycloneTextContainer}>
          <Text style={styles.cycloneTitle}>Cyclone Watch</Text>
          <Text style={styles.cycloneSub}>Low Chance</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 4,
    alignSelf: 'center',
  },
  pfzMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
  },
  pfzTextGroup: {
    alignItems: 'center',
  },
  pfzTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    lineHeight: 12,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pfzSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8.5,
    lineHeight: 11,
    color: '#00e676',
    letterSpacing: 0.2,
  },
  pfzSonarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(4, 20, 42, 0.85)',
    borderWidth: 1.2,
    borderColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  sonarRipple: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#00e5ff',
  },
  cycloneCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 20, 38, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  cycloneIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycloneTextContainer: {
    gap: 1,
  },
  cycloneTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    color: '#ffffff',
  },
  cycloneSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    lineHeight: 12,
    color: '#8da2be',
  },
});
