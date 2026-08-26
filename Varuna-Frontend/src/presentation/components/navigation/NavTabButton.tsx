import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import * as Haptics from '../../../utils/haptics';
import { AnimatedHomeIcon } from './icons/AnimatedHomeIcon';
import { AnimatedMapIcon } from './icons/AnimatedMapIcon';
import { AnimatedBellIcon } from './icons/AnimatedBellIcon';
import { AnimatedProfileIcon } from './icons/AnimatedProfileIcon';

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
  // Touch scale controller (tactile spring compression)
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  // Active selection transition controller (0 to 1)
  const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  // Trigger key to rerun bespoke icon micro-interactions on tap
  const [triggerKey, setTriggerKey] = useState(0);

  useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: isActive ? 1 : 0,
      damping: 15,
      stiffness: 220,
      useNativeDriver: true,
    }).start();

    if (isActive) {
      setTriggerKey((prev) => prev + 1);
    }
  }, [isActive]);

  const handlePressIn = () => {
    Animated.spring(pressScaleAnim, {
      toValue: 0.92,
      damping: 14,
      stiffness: 320,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScaleAnim, {
      toValue: 1.0,
      damping: 10,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTriggerKey((prev) => prev + 1);
    onPress();
  };

  const iconColor = isActive ? '#00e5ff' : '#7d93b2';
  const iconStrokeWidth = isActive ? 2.1 : 1.7;
  const iconSize = 24;

  const renderIcon = () => {
    switch (id) {
      case 'home':
        return (
          <AnimatedHomeIcon
            size={iconSize}
            color={iconColor}
            strokeWidth={iconStrokeWidth}
            isActive={isActive}
            triggerKey={triggerKey}
          />
        );
      case 'map':
        return (
          <AnimatedMapIcon
            size={iconSize}
            color={iconColor}
            strokeWidth={iconStrokeWidth}
            triggerKey={triggerKey}
          />
        );
      case 'alerts':
        return (
          <AnimatedBellIcon
            size={iconSize}
            color={iconColor}
            strokeWidth={iconStrokeWidth}
            hasBadge={hasBadge}
            triggerKey={triggerKey}
          />
        );
      case 'profile':
        return (
          <AnimatedProfileIcon
            size={iconSize}
            color={iconColor}
            strokeWidth={iconStrokeWidth}
            triggerKey={triggerKey}
          />
        );
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
        {/* Apple-Grade Active Liquid Selection Pill Highlight */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeSelectionPill,
            {
              opacity: activeAnim,
              transform: [
                {
                  scale: activeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1.0],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Bespoke Animated Vector Icon Container */}
        <Animated.View
          style={[
            styles.iconWrapper,
            isActive && styles.iconWrapperActive,
          ]}
        >
          {renderIcon()}
        </Animated.View>

        {/* Clean Apple-style Typography */}
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 58,
    borderRadius: 18,
    position: 'relative',
  },
  activeSelectionPill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.22)',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 26,
    width: 26,
    marginBottom: 3,
  },
  iconWrapperActive: {
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  tabLabelInactive: {
    fontFamily: 'Inter_400Regular',
    color: '#7d93b2',
  },
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 229, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
