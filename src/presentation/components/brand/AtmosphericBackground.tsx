import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

// Load the high-quality ocean motion video asset directly
const oceanVideoSource = require('../../../../assets/frames/Ocean_motion_1.mp4');

export const AtmosphericBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<any>(null);

  // Dynamic height: covers hero typography, search bar, and blends into radar visualizer
  const videoHeight = Math.max(height * 0.76, 590);

  // Web-specific autoplay and continuous 60fps loop lifecycle management
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const videoEl = videoRef.current as HTMLVideoElement | null;
    if (!videoEl) return;

    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', 'true');
    videoEl.setAttribute('webkit-playsinline', 'true');
    videoEl.setAttribute('muted', 'true');
    videoEl.setAttribute('autoplay', 'true');
    videoEl.setAttribute('loop', 'true');

    const ensurePlayback = () => {
      if (videoEl && videoEl.paused) {
        const promise = videoEl.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Autoplay policy: trigger on first user gesture
            const handleFirstGesture = () => {
              videoEl?.play().catch(() => {});
              window.removeEventListener('click', handleFirstGesture);
              window.removeEventListener('touchstart', handleFirstGesture);
              window.removeEventListener('keydown', handleFirstGesture);
            };
            window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
            window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
            window.addEventListener('keydown', handleFirstGesture, { once: true, passive: true });
          });
        }
      }
    };

    ensurePlayback();

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        ensurePlayback();
      }
    };

    const handleFocus = () => {
      ensurePlayback();
    };

    const handleEnded = () => {
      if (videoEl) {
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
    };

    const handleError = () => {
      if (videoEl) {
        videoEl.load();
        ensurePlayback();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }
    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('error', handleError);

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
      videoEl.removeEventListener('ended', handleEnded);
      videoEl.removeEventListener('error', handleError);
    };
  }, []);

  // Resolve Web asset source URL reliably
  const resolvedVideoUri =
    Platform.OS === 'web'
      ? typeof oceanVideoSource === 'string'
        ? oceanVideoSource
        : oceanVideoSource?.default ||
          oceanVideoSource?.uri ||
          Image.resolveAssetSource(oceanVideoSource)?.uri ||
          oceanVideoSource
      : null;

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
          <video
            ref={videoRef}
            src={typeof resolvedVideoUri === 'string' ? resolvedVideoUri : undefined}
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
