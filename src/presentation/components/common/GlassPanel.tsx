import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../../theme/colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  glow?: boolean;
  glowColor?: string;
  borderRadius?: number;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  intensity = 30,
  glow = false,
  glowColor = Colors.primaryContainer,
  borderRadius = 18,
}) => {
  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        glow && {
          borderColor: 'rgba(34, 211, 238, 0.3)',
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 5,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFillObject, { borderRadius }]}
      />
      <View
        style={[
          styles.innerSurface,
          { borderRadius },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(18, 33, 49, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    overflow: 'hidden',
  },
  innerSurface: {
    padding: 16,
    position: 'relative',
  },
});
