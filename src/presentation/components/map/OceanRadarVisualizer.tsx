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
} from 'react-native-svg';
import { Fish, CloudLightning } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface OceanRadarVisualizerProps {
  onPressPfz?: () => void;
  onPressCyclone?: () => void;
}

export const OceanRadarVisualizer: React.FC<OceanRadarVisualizerProps> = ({
  onPressPfz,
  onPressCyclone,
}) => {
  const visualizerWidth = width;
  const visualizerHeight = 240;

  // Animation values for glowing radar pulse and particle stream
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const particleShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for PFZ ring beacon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle drift animation for vessel/particles
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(particleShift, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(particleShift, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    driftLoop.start();

    return () => {
      pulseLoop.stop();
      driftLoop.stop();
    };
  }, [pulseAnim, particleShift]);

  const pfzRingScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });

  const pfzRingOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.2],
  });

  const boatTranslateY = particleShift.interpolate({
    inputRange: [0, 1],
    outputRange: [-2, 3],
  });

  const handlePfzPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPressPfz?.();
  };

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
          <SvgRadialGradient id="pfzGlow" cx="30%" cy="65%" r="40%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
            <Stop offset="50%" stopColor="#00b4d8" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#040b15" stopOpacity="0" />
          </SvgRadialGradient>

          <SvgLinearGradient id="streamGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.1" />
            <Stop offset="50%" stopColor="#00e5ff" stopOpacity="0.7" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </SvgLinearGradient>

          <SvgLinearGradient id="contourGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
            <Stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0.1" />
          </SvgLinearGradient>
        </Defs>

        {/* Ambient PFZ depth glow pool */}
        <Circle cx={visualizerWidth * 0.3} cy={visualizerHeight * 0.65} r={80} fill="url(#pfzGlow)" />

        {/* Outer Wide Bathymetric Contour Loops */}
        <Path
          d={`M -20 180 C 60 120, 160 130, 200 170 C 230 200, 160 230, 80 220 C 10 210, -30 190, -20 180 Z`}
          fill="none"
          stroke="url(#contourGrad)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />

        {/* Inner PFZ Closed Depth Contour */}
        <Path
          d={`M 30 160 C 80 130, 160 135, 185 165 C 205 190, 140 210, 80 205 C 40 200, 15 180, 30 160 Z`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="1"
          strokeOpacity="0.45"
        />

        <Path
          d={`M 60 170 C 90 148, 140 152, 155 170 C 170 186, 125 198, 85 194 C 65 190, 50 180, 60 170 Z`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="0.8"
          strokeOpacity="0.25"
        />

        {/* Secondary Contour Lines Across Ocean Field */}
        <Path
          d={`M 140 90 C 220 70, 320 110, ${visualizerWidth + 20} 80`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.18)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        <Path
          d={`M 180 120 C 250 100, 340 140, ${visualizerWidth + 20} 120`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.22)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        <Path
          d={`M 190 160 C 260 130, 330 160, ${visualizerWidth + 20} 150`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.15)"
          strokeWidth="0.8"
        />

        <Path
          d={`M 200 200 C 270 170, 340 190, ${visualizerWidth + 20} 190`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.12)"
          strokeWidth="0.8"
        />

        {/* Luminous Dotted Particle Stream Wave guiding toward Vessel */}
        <Path
          d={`M 60 210 C 120 200, 180 185, 210 150 C 235 120, 250 90, 290 60 C 310 45, 340 40, ${visualizerWidth} 30`}
          fill="none"
          stroke="url(#streamGlow)"
          strokeWidth="3.5"
          strokeDasharray="2 5"
          strokeLinecap="round"
        />

        {/* Secondary Wake Wave Particles */}
        <Path
          d={`M 80 220 C 135 210, 190 195, 220 160 C 242 132, 255 102, 295 72`}
          fill="none"
          stroke="#00e5ff"
          strokeWidth="2"
          strokeDasharray="1 6"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />

        {/* Concentric ripples around the boat */}
        <Path
          d={`M 205 105 C 220 115, 235 110, 245 95`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <Path
          d={`M 195 112 C 215 125, 240 120, 255 100`}
          fill="none"
          stroke="rgba(0, 229, 255, 0.15)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      </Svg>

      {/* 3D Vessel / Boat Graphic Element */}
      <Animated.View
        style={[
          styles.boatContainer,
          {
            left: visualizerWidth * 0.52,
            top: visualizerHeight * 0.38,
            transform: [{ translateY: boatTranslateY }],
          },
        ]}
      >
        <Svg width={38} height={46} viewBox="0 0 38 46">
          <Defs>
            <SvgLinearGradient id="boatHull" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#ffffff" />
              <Stop offset="50%" stopColor="#e2e8f0" />
              <Stop offset="100%" stopColor="#94a3b8" />
            </SvgLinearGradient>
            <SvgLinearGradient id="boatDeck" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#38bdf8" />
              <Stop offset="100%" stopColor="#0369a1" />
            </SvgLinearGradient>
          </Defs>

          {/* Boat Wake / Glow behind stern */}
          <Path
            d="M 10 38 L 4 45 M 28 38 L 34 45 M 19 40 L 19 46"
            stroke="rgba(0, 229, 255, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* 3D Isometric Boat Hull */}
          <Polygon
            points="19,2 34,22 30,38 8,38 4,22"
            fill="url(#boatHull)"
            stroke="#ffffff"
            strokeWidth="0.8"
          />

          {/* Cabin Windshield / Glass */}
          <Polygon
            points="19,8 28,21 25,27 13,27 10,21"
            fill="url(#boatDeck)"
            stroke="#0ea5e9"
            strokeWidth="0.5"
          />

          {/* Roof / Radar arch */}
          <Polygon
            points="19,12 25,20 23,24 15,24 13,20"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />

          {/* Marine Stern Radar Beacon */}
          <Circle cx="19" cy="32" r="2" fill="#00e5ff" />
        </Svg>
      </Animated.View>

      {/* Floating Marker (Left): Potential Fishing Zone */}
      <View
        style={[
          styles.pfzMarkerContainer,
          { left: visualizerWidth * 0.16, top: visualizerHeight * 0.42 },
        ]}
      >
        <View style={styles.pfzTextGroup}>
          <Text style={styles.pfzHeader}>Potential Fishing Zone</Text>
          <Text style={styles.pfzProbability}>High Probability</Text>
        </View>

        {/* Glowing Fish Pin Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePfzPress}
          style={styles.pfzButtonWrapper}
        >
          {/* Animated Pulsing Ring */}
          <Animated.View
            style={[
              styles.pfzPulseRing,
              {
                transform: [{ scale: pfzRingScale }],
                opacity: pfzRingOpacity,
              },
            ]}
          />

          {/* 3D Circular Pin Button */}
          <View style={styles.pfzPinButton}>
            <Fish size={18} color="#00e5ff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Floating Card (Right): Cyclone Watch */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCyclonePress}
        style={[
          styles.cycloneCard,
          { right: 18, top: visualizerHeight * 0.46 },
        ]}
      >
        <View style={styles.cycloneIconContainer}>
          <CloudLightning size={20} color="#00e5ff" />
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
  },
  boatContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-18deg' }],
  },
  pfzMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  pfzTextGroup: {
    alignItems: 'center',
    gap: 2,
  },
  pfzHeader: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 13,
    color: '#cbd5e1',
    letterSpacing: 0.2,
  },
  pfzProbability: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 13,
    color: '#00e5ff',
    letterSpacing: 0.3,
  },
  pfzButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pfzPulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  pfzPinButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(5, 20, 36, 0.92)',
    borderWidth: 1.5,
    borderColor: '#00e5ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  cycloneCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(10, 23, 40, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  cycloneIconContainer: {
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
    color: '#94a3b8',
  },
});
