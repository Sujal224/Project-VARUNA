import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Dynamic height: covers hero typography, search bar, and blends into radar visualizer
const VIDEO_HEIGHT = Math.max(height * 0.76, 590);

// Load the high-quality ocean motion video asset directly
const oceanVideoSource = require('../../../../assets/frames/Ocean_motion_1.mp4');

export const AtmosphericBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Deep Oceanic Void Foundation Layer */}
      <LinearGradient
        colors={['#050e1c', '#030914', '#02060e', '#010308']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Pristine Native Continuous Video Canvas */}
      <View style={[styles.videoWrapper, { height: VIDEO_HEIGHT }]}>
        <Video
          source={oceanVideoSource}
          rate={1.0}
          volume={0}
          isMuted={true}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={true}
          useNativeControls={false}
          style={styles.videoPlayer}
        />

        {/* Multi-Stop Obsidian Dark Gradient (Smoothly dissolves into deep void) */}
        <LinearGradient
          colors={[
            'rgba(2, 6, 14, 0.28)',
            'rgba(2, 6, 14, 0.12)',
            'rgba(2, 6, 14, 0.45)',
            'rgba(2, 6, 14, 0.88)',
            '#02060e',
          ]}
          locations={[0, 0.25, 0.58, 0.84, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Top subtle blue ambient light cone */}
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.05)', 'rgba(37, 99, 235, 0.02)', 'transparent']}
        style={[styles.glowCone, { width, height: 380 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width,
    overflow: 'hidden',
  },
  videoPlayer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  glowCone: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});







