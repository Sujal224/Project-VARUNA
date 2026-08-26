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
  size = 110,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percent) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="cyanRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#22d3ee" />
            <Stop offset="100%" stopColor="#8aebff" />
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

        {/* Animated Glowing Progress Ring */}
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
    fontFamily: 'Inter_400Regular',
    fontSize: 26,
    lineHeight: 28,
    color: '#ffffff',
  },
  percentSign: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    marginLeft: 1,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
