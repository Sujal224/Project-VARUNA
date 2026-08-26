import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Map, Bell, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../../theme/colors';
import { VarunaOrb } from '../brand/VarunaOrb';

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
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject} />

      <View style={styles.navBar}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('home')}
          style={styles.tabItem}
        >
          <Home
            size={20}
            color={currentTab === 'home' ? Colors.primary : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'home' && styles.tabLabelActive,
            ]}
          >
            Home
          </Text>
          {currentTab === 'home' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Tab 2: Map */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('map')}
          style={styles.tabItem}
        >
          <Map
            size={20}
            color={currentTab === 'map' ? Colors.primary : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'map' && styles.tabLabelActive,
            ]}
          >
            Map
          </Text>
          {currentTab === 'map' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Central Signature VARUNA Orb Action */}
        <View style={styles.centerOrbWrapper}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleTabPress('ai')}
            style={styles.centerOrbButton}
          >
            <VarunaOrb size={46} active={currentTab === 'ai'} />
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
              size={20}
              color={currentTab === 'alerts' ? Colors.primary : Colors.onSurfaceVariant}
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
          {currentTab === 'alerts' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Tab 5: Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('profile')}
          style={styles.tabItem}
        >
          <User
            size={20}
            color={currentTab === 'profile' ? Colors.primary : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            Profile
          </Text>
          {currentTab === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>
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
    backgroundColor: 'rgba(5, 20, 36, 0.75)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 20,
    paddingTop: 8,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 54,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  centerOrbWrapper: {
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOrbButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(5, 20, 36, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  alertIconContainer: {
    position: 'relative',
  },
  alertNotificationDot: {
    position: 'absolute',
    top: -1,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: '#051424',
  },
});
