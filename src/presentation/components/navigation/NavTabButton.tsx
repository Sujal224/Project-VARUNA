import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { Home, Map, Bell, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export type TabId = 'home' | 'map' | 'alerts' | 'profile';

interface NavTabButtonProps {
  id: TabId;
  label: string;
  isActive: boolean;
  hasBadge?: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export const NavTabButton: React.FC<NavTabButtonProps> = ({
  id,
  label,
  isActive,
  hasBadge = false,
  onPress,
  onLayout,
}) => {
  // Touch scale controller (spring compression on touch down)
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  // Icon micro-interaction animation controller
  const iconMotionAnim = useRef(new Animated.Value(0)).current;

  // Active state transition controller (0 to 1)
  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Notification badge breathing pulse controller
  const badgePulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(activeAnim, {
      toValue: isActive ? 1 : 0,
      duration: 220,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();

    if (isActive) {
      triggerIconAnimation();
    }
  }, [isActive]);

  // Continuous subtle breathing pulse for notification dot
  useEffect(() => {
    if (!hasBadge) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(badgePulseAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [hasBadge, badgePulseAnim]);

  const triggerIconAnimation = () => {
    iconMotionAnim.setValue(0);
    Animated.timing(iconMotionAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.bezier(0.18, 0.89, 0.32, 1.28),
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(pressScaleAnim, {
      toValue: 0.9,
      damping: 14,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScaleAnim, {
      toValue: 1.0,
      damping: 10,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerIconAnimation();
    onPress();
  };

  // Interpolations for Icon Micro-Interactions based on Tab Type
  const getIconTransforms = () => {
    switch (id) {
      case 'home': {
        const translateY = iconMotionAnim.interpolate({
          inputRange: [0, 0.3, 0.6, 0.8, 1],
          outputRange: [0, -4, 2, -1, 0],
        });
        const scale = iconMotionAnim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [1, 1.12, 0.97, 1],
        });
        return [{ translateY }, { scale }];
      }
      case 'map': {
        const rotateZ = iconMotionAnim.interpolate({
          inputRange: [0, 0.25, 0.55, 0.8, 1],
          outputRange: ['0deg', '-8deg', '6deg', '-2deg', '0deg'],
        });
        const scale = iconMotionAnim.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [1, 1.1, 1],
        });
        return [{ rotateZ }, { scale }];
      }
      case 'alerts': {
        const rotate = iconMotionAnim.interpolate({
          inputRange: [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1],
          outputRange: ['0deg', '-15deg', '12deg', '-8deg', '4deg', '-1deg', '0deg'],
        });
        const scale = iconMotionAnim.interpolate({
          inputRange: [0, 0.25, 1],
          outputRange: [1, 1.1, 1],
        });
        return [{ rotate }, { scale }];
      }
      case 'profile': {
        const scale = iconMotionAnim.interpolate({
          inputRange: [0, 0.3, 0.6, 0.85, 1],
          outputRange: [1, 1.14, 0.96, 1.02, 1],
        });
        const translateY = iconMotionAnim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, -3, 1, 0],
        });
        return [{ scale }, { translateY }];
      }
      default:
        return [];
    }
  };

  const badgeScale = badgePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.15],
  });

  const badgeGlowOpacity = badgePulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.0],
  });

  const iconColor = isActive ? '#00e5ff' : '#94a3b8';
  const iconStrokeWidth = isActive ? 2.0 : 1.7;
  const iconSize = 22;

  const renderIcon = () => {
    switch (id) {
      case 'home':
        return <Home size={iconSize} color={iconColor} strokeWidth={iconStrokeWidth} />;
      case 'map':
        return <Map size={iconSize} color={iconColor} strokeWidth={iconStrokeWidth} />;
      case 'alerts':
        return <Bell size={iconSize} color={iconColor} strokeWidth={iconStrokeWidth} />;
      case 'profile':
        return <User size={iconSize} color={iconColor} strokeWidth={iconStrokeWidth} />;
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        onLayout={onLayout}
        style={[
          styles.tabContainer,
          {
            transform: [{ scale: pressScaleAnim }],
          },
        ]}
      >
        {/* Animated Icon Container with Direct Luminous Bloom on Active */}
        <Animated.View
          style={[
            styles.iconWrapper,
            isActive && styles.iconWrapperActive,
            {
              transform: getIconTransforms(),
            },
          ]}
        >
          {renderIcon()}

          {/* Electric Cyan Notification Badge for Alerts */}
          {hasBadge && (
            <Animated.View
              style={[
                styles.badgeDot,
                {
                  opacity: badgeGlowOpacity,
                  transform: [{ scale: badgeScale }],
                },
              ]}
            />
          )}
        </Animated.View>

        {/* Clean Minimalist Typography */}
        <Text
          style={[
            styles.tabLabel,
            isActive ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 54,
    position: 'relative',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 26,
    width: 26,
    marginBottom: 4,
  },
  iconWrapperActive: {
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    elevation: 8,
  },
  badgeDot: {
    position: 'absolute',
    top: -1,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 5,
  },
  tabLabel: {
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  tabLabelInactive: {
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
  },
  tabLabelActive: {
    fontFamily: 'Inter_500Medium',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 229, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
