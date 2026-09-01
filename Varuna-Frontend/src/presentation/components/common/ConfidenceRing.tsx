import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../../theme/colors';

interface ConfidenceRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  percent,
  size = 100,
  strokeWidth = 6.5,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percent) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="cyanRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00e5ff" />
            <Stop offset="50%" stopColor="#38bdf8" />
            <Stop offset="100%" stopColor="#2563eb" />
          </LinearGradient>
        </Defs>

        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Glowing Progress Ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#cyanRingGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Centered Readout */}
      <View style={styles.textContainer}>
        <View style={styles.numberRow}>
          <Text style={styles.percentNumber}>{percent}</Text>
          <Text style={styles.percentSign}>%</Text>
        </View>
        <Text style={styles.label}>Confidence</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  percentNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    lineHeight: 26,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  percentSign: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#94a3b8',
    marginLeft: 1,
    marginTop: 2,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
});

