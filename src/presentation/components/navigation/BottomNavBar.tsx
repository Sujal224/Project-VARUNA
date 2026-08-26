import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Home, Map, Bell, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../theme/colors';
import { VarunaOrb } from '../brand/VarunaOrb';

const { width } = Dimensions.get('window');

export type TabType = 'home' | 'map' | 'ai' | 'alerts' | 'profile';

interface BottomNavBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const handleTabPress = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTab(tab);
  };

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFillObject} />

      <View style={styles.navBar}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('home')}
          style={styles.tabItem}
        >
          <Home
            size={22}
            color={currentTab === 'home' ? '#38bdf8' : '#8da2be'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'home' && styles.tabLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Map */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('map')}
          style={styles.tabItem}
        >
          <Map
            size={22}
            color={currentTab === 'map' ? '#38bdf8' : '#8da2be'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'map' && styles.tabLabelActive,
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>

        {/* Center Raised Signature VARUNA Orb */}
        <View style={styles.centerOrbWrapper}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleTabPress('ai')}
            style={styles.centerOrbButton}
          >
            <VarunaOrb
              size={56}
              active={currentTab === 'ai'}
              speed={currentTab === 'ai' ? 'fast' : 'normal'}
              intensity={currentTab === 'ai' ? 1.3 : 1.0}
            />
          </TouchableOpacity>
        </View>

        {/* Tab 4: Alerts */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('alerts')}
          style={styles.tabItem}
        >
          <View style={styles.alertIconContainer}>
            <Bell
              size={22}
              color={currentTab === 'alerts' ? '#38bdf8' : '#8da2be'}
            />
            <View style={styles.alertNotificationDot} />
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'alerts' && styles.tabLabelActive,
            ]}
          >
            Alerts
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('profile')}
          style={styles.tabItem}
        >
          <User
            size={22}
            color={currentTab === 'profile' ? '#38bdf8' : '#8da2be'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* iOS Home Indicator Bar */}
      <View style={styles.homeIndicatorWrapper}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3, 9, 18, 0.82)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    paddingBottom: 6,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 54,
    gap: 4,
  },
  tabLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#8da2be',
  },
  tabLabelActive: {
    color: '#38bdf8',
    fontFamily: 'Inter_500Medium',
  },
  centerOrbWrapper: {
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrbButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  alertIconContainer: {
    position: 'relative',
  },
  alertNotificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
    borderWidth: 1,
    borderColor: '#040b15',
  },
  homeIndicatorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 2,
  },
  homeIndicator: {
    width: 134,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    opacity: 0.6,
  },
});

