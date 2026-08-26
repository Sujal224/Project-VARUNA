import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
  const navHeight = 88; // Total canvas height including raised center dome

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
    <View style={[styles.floatingWrapper, { width: navWidth }]}>
      {/* 1. Precision Contoured Glass Backdrop (Monolithic Center Dome & Grazing Rim) */}
      <NavContourBackdrop width={navWidth} height={navHeight} />

      {/* 2. Tab Navigation Items Container */}
      <View style={[styles.tabContentBar, { width: navWidth }]}>
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

        {/* Center Raised Signature VARUNA Orb (Concentrically Nested in Center Dome) */}
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
                size={58}
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
    bottom: Platform.OS === 'ios' ? 22 : 14,
    alignSelf: 'center',
    height: 88,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  tabContentBar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    position: 'relative',
    zIndex: 5,
  },
  tabColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrbAnchor: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    top: -19, // Concentrically positions orb center at y=35 inside the raised dome
    zIndex: 10,
  },
  orbTouchContainer: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
