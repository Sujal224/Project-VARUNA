import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import {
  Search,
  SlidersHorizontal,
  Bell,
  Crosshair,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { VarunaOrb } from '../components/brand/VarunaOrb';
import { VarunaWordmark } from '../components/brand/VarunaWordmark';
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import {
  InteractiveOceanMap,
  MapMarkerLocation,
} from '../components/map/InteractiveOceanMap';
import {
  MapFloatingControls,
  MapControlTab,
} from '../components/map/MapFloatingControls';
import { SelectedLocationSheet } from '../components/map/SelectedLocationSheet';
import { TabType } from '../components/navigation/BottomNavBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapScreenProps {
  onNavigateTab?: (tab: TabType) => void;
}

const DEFAULT_LOCATION: MapMarkerLocation = {
  id: 'pfz-main',
  type: 'pfz',
  name: 'Potential Fishing Zone',
  region: 'Bay of Bengal',
  coordinates: '14.23°N, 88.57°E',
  lat: 14.23,
  lng: 88.57,
  condition: 'Safe Conditions',
  metrics: {
    seaTemp: '28.4 °C',
    tempTrend: '↑ 0.3°C',
    waveHeight: '0.8 – 1.2 m',
    waveStatus: '• Stable',
    windSpeed: '14 km/h',
    windStatus: '↓ Calming',
    chlorophyll: '2.4 mg/m³',
    chloroStatus: '• High',
  },
  alerts: [
    { id: 'a1', title: 'Strong Current', severity: 'Moderate', type: 'current' },
    { id: 'a2', title: 'Small Craft Advisory', severity: 'Low Risk', type: 'advisory' },
  ],
};

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeControlTab, setActiveControlTab] = useState<MapControlTab>('layers');
  const [selectedLocation, setSelectedLocation] = useState<MapMarkerLocation>(DEFAULT_LOCATION);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [sheetVisible, setSheetVisible] = useState<boolean>(true);

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleLocateMe = () => {
    setSelectedLocation(DEFAULT_LOCATION);
    setSheetVisible(true);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#02060e" translucent />
      <AtmosphericBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header - Exact Brand Design */}
        <View style={styles.topHeader}>
          {/* Left: Brand Identity with Glowing Liquid Glass Varuna Orb & Exact Vector Wordmark */}
          <View style={styles.brandGroup}>
            <VarunaOrb size={38} />
            <VarunaWordmark scale={0.72} />
          </View>

          {/* Right: GPS Locked Status Pill, Bell Notification, Captain Avatar */}
          <View style={styles.headerRightActions}>
            <View style={styles.statusPill}>
              <Crosshair size={12} color="#00e5ff" />
              <Text style={styles.statusText}>GPS Locked</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigateTab?.('alerts');
              }}
              style={styles.headerIconButton}
            >
              <Bell size={18} color="#e2edfd" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigateTab?.('profile');
              }}
              style={styles.avatarButton}
            >
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Search Component */}
        <View style={styles.searchFloatingWrapper}>
          <View style={styles.searchBar}>
            <Search size={18} color="#8da2be" strokeWidth={1.8} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location, coordinates..."
              placeholderTextColor="#8da2be"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={styles.filterButton}
            >
              <SlidersHorizontal size={18} color="#8da2be" strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable / Interactive Canvas Area */}
        <ScrollView
          style={styles.scrollCanvas}
          contentContainerStyle={styles.scrollCanvasContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* 3. Interactive Map Canvas Container */}
          <View style={styles.mapViewport}>
            <InteractiveOceanMap
              activeLayer={activeControlTab}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                setSheetVisible(true);
              }}
              zoomLevel={zoomLevel}
            />

            {/* 4. Floating Map Controls (Left vertical & Right zoom/locate) */}
            <MapFloatingControls
              activeTab={activeControlTab}
              onSelectTab={(tab) => setActiveControlTab(tab)}
              onLocateMe={handleLocateMe}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </View>

          {/* 5. Selected Location Bottom Sheet */}
          {sheetVisible && (
            <View style={styles.sheetWrapper}>
              <SelectedLocationSheet
                location={selectedLocation}
                onClose={() => setSheetVisible(false)}
                onAlertsPress={() => onNavigateTab?.('alerts')}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#02060e',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    zIndex: 50,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#00e5ff',
    letterSpacing: 0.2,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 20, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  searchFloatingWrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    zIndex: 50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#ffffff',
    paddingVertical: 0,
  },
  filterButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  scrollCanvas: {
    flex: 1,
  },
  scrollCanvasContent: {
    paddingBottom: 110,
  },
  mapViewport: {
    position: 'relative',
    width: '100%',
  },
  sheetWrapper: {
    marginTop: -28,
    zIndex: 35,
  },
});
