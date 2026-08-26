import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

let oceanVideoSource: any = null;
try {
  oceanVideoSource = require('../../../../assets/frames/Ocean_motion_1.mp4');
} catch (e) {
  oceanVideoSource = null;
}

export const AtmosphericBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<any>(null);
  const [videoError, setVideoError] = useState(false);

  // Dynamic height: covers hero typography, search bar, and blends into radar visualizer
  const videoHeight = Math.max(height * 0.76, 590);

  // Web-specific autoplay and continuous 60fps loop lifecycle management
  useEffect(() => {
    if (Platform.OS !== 'web' || videoError) return;

    try {
      const videoEl = videoRef.current as HTMLVideoElement | null;
      if (!videoEl) return;

      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;

      try {
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('webkit-playsinline', 'true');
        videoEl.setAttribute('muted', 'true');
        videoEl.setAttribute('autoplay', 'true');
        videoEl.setAttribute('loop', 'true');
      } catch (err) {}

      const safePlay = () => {
        try {
          if (videoEl && videoEl.paused) {
            const promise = videoEl.play();
            if (promise !== undefined && typeof promise.catch === 'function') {
              promise.catch(() => {
                // Ignore autoplay policy restriction
              });
            }
          }
        } catch (err) {}
      };

      safePlay();

      const handleUserGesture = () => {
        safePlay();
        if (typeof window !== 'undefined') {
          window.removeEventListener('click', handleUserGesture);
          window.removeEventListener('touchstart', handleUserGesture);
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('click', handleUserGesture, { once: true, passive: true });
        window.addEventListener('touchstart', handleUserGesture, { once: true, passive: true });
      }

      const handleEnded = () => {
        try {
          if (videoEl) {
            videoEl.currentTime = 0;
            safePlay();
          }
        } catch (err) {}
      };

      const handleError = () => {
        setVideoError(true);
      };

      videoEl.addEventListener('ended', handleEnded);
      videoEl.addEventListener('error', handleError);

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('click', handleUserGesture);
          window.removeEventListener('touchstart', handleUserGesture);
        }
        try {
          videoEl.removeEventListener('ended', handleEnded);
          videoEl.removeEventListener('error', handleError);
        } catch (err) {}
      };
    } catch (err) {
      setVideoError(true);
    }
  }, [videoError]);

  // Resolve Web asset source URL reliably
  let resolvedVideoUri: string | undefined = undefined;
  if (Platform.OS === 'web' && oceanVideoSource && !videoError) {
    try {
      if (typeof oceanVideoSource === 'string') {
        resolvedVideoUri = oceanVideoSource;
      } else if (oceanVideoSource?.default && typeof oceanVideoSource.default === 'string') {
        resolvedVideoUri = oceanVideoSource.default;
      } else if (oceanVideoSource?.uri && typeof oceanVideoSource.uri === 'string') {
        resolvedVideoUri = oceanVideoSource.uri;
      } else {
        const resolved = Image.resolveAssetSource(oceanVideoSource);
        if (resolved?.uri) {
          resolvedVideoUri = resolved.uri;
        }
      }
    } catch (e) {
      resolvedVideoUri = undefined;
    }
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Deep Oceanic Void Foundation Layer */}
      <LinearGradient
        colors={['#050e1c', '#030914', '#02060e', '#010308']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Pristine Native Continuous 60 FPS Video Canvas */}
      <View style={[styles.videoWrapper, { width, height: videoHeight }]}>
        {Platform.OS === 'web' ? (
          resolvedVideoUri ? (
            <video
              ref={videoRef}
              src={resolvedVideoUri}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                willChange: 'transform',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              } as any}
            />
          ) : (
            <LinearGradient
              colors={['#071a2f', '#04101e', '#02060e']}
              style={StyleSheet.absoluteFillObject}
            />
          )
        ) : oceanVideoSource ? (
          <Video
            ref={videoRef}
            source={oceanVideoSource}
            rate={1.0}
            volume={0}
            isMuted={true}
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isLooping={true}
            useNativeControls={false}
            progressUpdateIntervalMillis={1000}
            style={styles.videoPlayer}
          />
        ) : (
          <LinearGradient
            colors={['#071a2f', '#04101e', '#02060e']}
            style={StyleSheet.absoluteFillObject}
          />
        )}

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
