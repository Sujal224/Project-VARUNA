import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import * as Haptics from '../../../utils/haptics';
import { VarunaOrb } from '../brand/VarunaOrb';
import { NavContourBackdrop } from './NavContourBackdrop';
import { NavTabButton } from './NavTabButton';

const { width: screenWidth } = Dimensions.get('window');

export type TabType = 'home' | 'map' | 'ai' | 'alerts' | 'profile';

interface BottomNavBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  // Fluid responsive width: full pill with comfortable horizontal margins
  const navWidth = Math.min(screenWidth - 24, 430);
  const navHeight = 66; // Sleek uniform capsule height

  // Center Orb touch spring controller
  const orbScaleAnim = useRef(new Animated.Value(1)).current;
  const orbGlowPulse = useRef(new Animated.Value(1)).current;

  const handleTabPress = (tab: TabType) => {
    onSelectTab(tab);
  };

  const handleOrbPressIn = () => {
    Animated.spring(orbScaleAnim, {
      toValue: 0.9,
      damping: 14,
      stiffness: 280,
      useNativeDriver: true,
    }).start();
  };

  const handleOrbPressOut = () => {
    Animated.spring(orbScaleAnim, {
      toValue: 1.0,
      damping: 8,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleOrbPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Cosmic pulse burst animation
    Animated.sequence([
      Animated.timing(orbGlowPulse, {
        toValue: 1.2,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.spring(orbGlowPulse, {
        toValue: 1.0,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();

    onSelectTab('ai');
  };

  return (
    <View style={[styles.floatingWrapper, { width: navWidth, height: navHeight }]}>
      {/* 1. Precision Uniform Glass Capsule Backdrop (Absolute Fill) */}
      <NavContourBackdrop width={navWidth} height={navHeight} />

      {/* 2. Symmetrically Centered Navigation Items Container (Directly on the backdrop) */}
      <View style={[styles.tabContentBar, { width: navWidth, height: navHeight }]}>
        {/* Left Tab 1: Home */}
        <View style={styles.tabColumn}>
          <NavTabButton
            id="home"
            label="Home"
            isActive={currentTab === 'home'}
            onPress={() => handleTabPress('home')}
          />
        </View>

        {/* Left Tab 2: Map */}
        <View style={styles.tabColumn}>
          <NavTabButton
            id="map"
            label="Map"
            isActive={currentTab === 'map'}
            onPress={() => handleTabPress('map')}
          />
        </View>

        {/* Center Signature VARUNA Orb (Elegantly Nested in Uniform Pill Center) */}
        <View style={styles.centerOrbAnchor}>
          <TouchableWithoutFeedback
            onPressIn={handleOrbPressIn}
            onPressOut={handleOrbPressOut}
            onPress={handleOrbPress}
          >
            <Animated.View
              style={[
                styles.orbTouchContainer,
                {
                  transform: [
                    { scale: orbScaleAnim },
                    { scale: orbGlowPulse },
                  ],
                },
              ]}
            >
              <VarunaOrb
                size={48}
                active={true}
                speed={currentTab === 'ai' ? 'fast' : 'normal'}
                intensity={currentTab === 'ai' ? 1.35 : 1.0}
                showGlow={true}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>

        {/* Right Tab 3: Alerts */}
        <View style={styles.tabColumn}>
          <NavTabButton
            id="alerts"
            label="Alerts"
            isActive={currentTab === 'alerts'}
            hasBadge={true}
            onPress={() => handleTabPress('alerts')}
          />
        </View>

        {/* Right Tab 4: Profile */}
        <View style={styles.tabColumn}>
          <NavTabButton
            id="profile"
            label="Profile"
            isActive={currentTab === 'profile'}
            onPress={() => handleTabPress('profile')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  tabContentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    position: 'relative',
    zIndex: 5,
  },
  tabColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrbAnchor: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  orbTouchContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
