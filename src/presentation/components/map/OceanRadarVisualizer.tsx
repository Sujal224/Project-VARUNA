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
} from 'react-native-svg';
import { CloudLightning } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface OceanRadarVisualizerProps {
  onPressPfz?: () => void;
  onPressCyclone?: () => void;
}

export const OceanRadarVisualizer: React.FC<OceanRadarVisualizerProps> = ({
  onPressCyclone,
}) => {
  const visualizerWidth = width;
  const visualizerHeight = 210;

  // Animation values for subtle telemetry radar pulse & particle drift
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulseAnim]);

  const handleCyclonePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressCyclone?.();
  };

  return (
    <View style={[styles.container, { width: visualizerWidth, height: visualizerHeight }]}>
      {/* SVG Canvas for Bathymetric Depth Contours & Particle Wave Trails */}
      <Svg
        width={visualizerWidth}
        height={visualizerHeight}
        viewBox={`0 0 ${visualizerWidth} ${visualizerHeight}`}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgRadialGradient id="oceanDepthGlow" cx="40%" cy="55%" r="50%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.18" />
            <Stop offset="45%" stopColor="#0066ff" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </SvgRadialGradient>

          <SvgLinearGradient id="streamGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
            <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </SvgLinearGradient>

          <SvgLinearGradient id="contourGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
            <Stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0.08" />
          </SvgLinearGradient>
        </Defs>

        {/* Ambient ocean depth glow pool */}
        <Circle cx={visualizerWidth * 0.4} cy={visualizerHeight * 0.55} r={95} fill="url(#oceanDepthGlow)" />

        {/* Outer Wide Bathymetric Contour Loops */}
        <Path
          d={`M -20 160 C 60 100, 160 110, 200 150 C 230 180, 160 210, 80 200 C 10 190, -30 170, -20 160 Z`}
          fill="none"
          stroke="url(#contourGrad)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />

        {/* Inner Closed Depth Contours */}
        <Path
          d={`M 30 140 C 80 110, 160 115, 185 145 C 205 170, 140 190, 80 185 C 40 180, 15 160, 30 140 Z`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        <Path
          d={`M 60 150 C 90 128, 140 132, 155 150 C 170 166, 125 178, 85 174 C 65 170, 50 160, 60 150 Z`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="0.8"
          strokeOpacity="0.22"
        />

        {/* Secondary Contour Lines Across Ocean Field */}
        <Path
          d={`M 100 70 C 180 50, 280 90, ${visualizerWidth + 20} 60`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        <Path
          d={`M 140 100 C 210 80, 300 120, ${visualizerWidth + 20} 100`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.22)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        <Path
          d={`M 160 140 C 230 110, 300 140, ${visualizerWidth + 20} 130`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.15)"
          strokeWidth="0.8"
        />

        <Path
          d={`M 180 180 C 250 150, 320 170, ${visualizerWidth + 20} 170`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.12)"
          strokeWidth="0.8"
        />

        {/* Luminous Dotted Particle Stream Wave */}
        <Path
          d={`M 40 190 C 100 180, 160 165, 190 130 C 215 100, 230 70, 270 40 C 290 25, 320 20, ${visualizerWidth} 15`}
          fill="none"
          stroke="url(#streamGlow)"
          strokeWidth="3.2"
          strokeDasharray="2 5"
          strokeLinecap="round"
        />

        {/* Secondary Wake Wave Stream */}
        <Path
          d={`M 60 200 C 115 190, 170 175, 200 140 C 222 112, 235 82, 275 52`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1.8"
          strokeDasharray="1 6"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />
      </Svg>

      {/* Floating Liquid Glass Card (Right): Cyclone Watch */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCyclonePress}
        style={[
          styles.cycloneCard,
          { right: 18, top: visualizerHeight * 0.38 },
        ]}
      >
        <View style={styles.cycloneIconContainer}>
          <CloudLightning size={18} color="#00e5ff" />
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
    marginVertical: 2,
  },
  cycloneCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(8, 20, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  cycloneIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 12,
    lineHeight: 15,
    color: '#ffffff',
  },
  cycloneSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#8da2be',
  },
});
