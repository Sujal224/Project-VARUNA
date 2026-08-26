import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useLiveTelemetry } from '../../data/hooks/useLiveTelemetry';
import { LocationSearchModal } from '../components/common/LocationSearchModal';
import { mapRepository } from '../../data/repositories/mapRepository';



const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MapScreenProps {
  onNavigateTab?: (tab: TabType) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigateTab }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0) + 6;

  const telemetry = useLiveTelemetry();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeControlTab, setActiveControlTab] = useState<MapControlTab>('layers');
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const defaultLiveLocation: MapMarkerLocation = {
    id: 'pfz-main',
    type: 'pfz',
    name: telemetry.locationName || 'Potential Fishing Zone',
    region: telemetry.regionName || 'Bay of Bengal',
    coordinates: `${telemetry.coordinates.latitude.toFixed(2)}°N, ${telemetry.coordinates.longitude.toFixed(2)}°E`,
    lat: telemetry.coordinates.latitude,
    lng: telemetry.coordinates.longitude,
    condition: telemetry.risk?.level === 'LOW' ? 'Safe Conditions' : 'Advisory Active',
    metrics: {
      seaTemp: `${telemetry.conditions?.sea_temperature ?? 28.4} °C`,
      tempTrend: '↑ 0.3°C',
      waveHeight: `${telemetry.conditions?.wave_height ?? 1.2} m`,
      waveStatus: '• Stable',
      windSpeed: `${telemetry.conditions?.wave_speed ?? 14} km/h`,
      windStatus: '↓ Calming',
      chlorophyll: `${telemetry.conditions?.chlorophyll ?? 2.4} mg/m³`,
      chloroStatus: '• High',
    },
    alerts: [
      { id: 'a1', title: 'Strong Current', severity: 'Moderate', type: 'current' },
      { id: 'a2', title: 'Small Craft Advisory', severity: 'Low Risk', type: 'advisory' },
    ],
  };

  const [selectedLocation, setSelectedLocation] = useState<MapMarkerLocation>(defaultLiveLocation);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [sheetVisible, setSheetVisible] = useState<boolean>(true);

  // Synchronize location when live telemetry arrives or user selects a place
  useEffect(() => {
    if (telemetry.conditions) {
      setSelectedLocation((prev) => ({
        ...prev,
        name: telemetry.locationName || prev.name,
        region: telemetry.regionName || prev.region,
        coordinates: `${telemetry.coordinates.latitude.toFixed(2)}°N, ${telemetry.coordinates.longitude.toFixed(2)}°E`,
        lat: telemetry.coordinates.latitude,
        lng: telemetry.coordinates.longitude,
        metrics: {
          ...prev.metrics,
          seaTemp: `${telemetry.conditions?.sea_temperature} °C`,
          waveHeight: `${telemetry.conditions?.wave_height} m`,
          windSpeed: `${telemetry.conditions?.wave_speed} km/h`,
        },
      }));
    }
  }, [telemetry.conditions, telemetry.coordinates, telemetry.locationName]);

  const handleSearchSubmit = async () => {
    if (searchQuery.trim().length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        const results = await mapRepository.searchLocations(searchQuery, 1);
        if (results && results.length > 0) {
          const match = results[0];
          telemetry.selectLocation(
            { latitude: match.latitude, longitude: match.longitude },
            match.name,
            match.region || undefined
          );
          setSelectedLocation({
            id: `loc-${match.id}`,
            type: match.is_marine_port ? 'anchor' : 'pfz',
            name: match.name,
            region: match.region || 'Marine Sector',
            coordinates: match.formatted_coordinates,
            lat: match.latitude,
            lng: match.longitude,
            condition: 'Live Telemetry Synced',
            metrics: {
              seaTemp: `${telemetry.conditions?.sea_temperature ?? 28.4} °C`,
              tempTrend: '↑ 0.2°C',
              waveHeight: `${telemetry.conditions?.wave_height ?? 1.2} m`,
              waveStatus: '• Stable',
              windSpeed: `${telemetry.conditions?.wave_speed ?? 14} km/h`,
              windStatus: '↓ Optimal',
              chlorophyll: `${telemetry.conditions?.chlorophyll ?? 2.4} mg/m³`,
              chloroStatus: '• High',
            },
            alerts: [
              { id: 'a1', title: 'Open-Meteo Synced', severity: 'Low Risk', type: 'advisory' },
            ],
          });
          setSheetVisible(true);
          setZoomLevel(1.15);
          setSearchQuery('');
          return;
        }
      } catch (err) {
        console.warn('Search error:', err);
      }
      setSearchModalVisible(true);
    } else {
      setSearchModalVisible(true);
    }
  };


  const handleLocateMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lat = telemetry.coordinates.latitude;
    const lng = telemetry.coordinates.longitude;
    const speed = telemetry.gpsState.speedKnots;

    setSelectedLocation({
      id: 'vessel-varuna',
      type: 'vessel',
      name: 'Matsya Setu IV (Command)',
      region: 'Visakhapatnam Transit Channel',
      coordinates: `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
      lat,
      lng,
      condition: `Safe Navigation (${speed} kts)`,
      metrics: {
        seaTemp: `${telemetry.conditions?.sea_temperature ?? 28.4} °C`,
        tempTrend: '↑ 0.1°C',
        waveHeight: `${telemetry.conditions?.wave_height ?? 1.1} m`,
        waveStatus: '• Calm',
        windSpeed: `${telemetry.conditions?.wave_speed ?? 14} km/h`,
        windStatus: '↓ ESE',
        chlorophyll: `${telemetry.conditions?.chlorophyll ?? 2.4} mg/m³`,
        chloroStatus: '• Optimal',
      },
      alerts: [
        { id: 'a1', title: 'Clear Nav Channel', severity: 'Low Risk', type: 'advisory' },
        { id: 'a2', title: 'AIS Telemetry Active', severity: 'Low Risk', type: 'advisory' },
      ],
    });
    setSheetVisible(true);
    setZoomLevel(1.2);
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

      <View style={styles.safeContainer}>
        {/* Top Header - Exact Brand Design with Luxury Clearance */}
        <View style={[styles.topHeader, { paddingTop: topPadding }]}>
          {/* Left: Brand Identity with Glowing Liquid Glass Varuna Orb & Exact Vector Wordmark */}
          <View style={styles.brandGroup}>
            <VarunaOrb size={32} />
            <VarunaWordmark scale={0.62} />
          </View>

          {/* Right: GPS Locked Status Pill, Bell Notification, Captain Avatar */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (telemetry.permissionStatus !== 'granted') {
                  telemetry.requestGpsPermission();
                } else {
                  handleLocateMe();
                }
              }}
              style={[
                styles.statusPill,
                telemetry.permissionStatus === 'denied' && styles.statusPillDenied,
                telemetry.permissionStatus === 'requesting' && styles.statusPillPending,
              ]}
            >
              <Crosshair
                size={11}
                color={
                  telemetry.isGpsLocked
                    ? '#00e5ff'
                    : telemetry.permissionStatus === 'requesting'
                    ? '#f59e0b'
                    : '#8da2be'
                }
              />
              <Text
                style={[
                  styles.statusText,
                  telemetry.permissionStatus === 'denied' && styles.statusTextDenied,
                  telemetry.permissionStatus === 'requesting' && styles.statusTextPending,
                ]}
              >
                {telemetry.isGpsLocked
                  ? 'GPS Locked'
                  : telemetry.permissionStatus === 'requesting'
                  ? 'Acquiring GPS...'
                  : telemetry.permissionStatus === 'denied'
                  ? 'GPS Off (Tap)'
                  : 'Enable GPS'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNavigateTab?.('alerts');
              }}
              style={styles.headerIconButton}
            >
              <Bell size={16} color="#e2edfd" />
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSearchModalVisible(true);
              }}
              style={styles.filterButton}
            >
              <SlidersHorizontal size={18} color="#00e5ff" strokeWidth={1.8} />
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
              userCoordinates={telemetry.coordinates}
              speedKnots={telemetry.gpsState.speedKnots}
              headingDeg={telemetry.gpsState.headingDeg}
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

        {/* Global Location Search & Port Selector Modal */}
        <LocationSearchModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
          onSelectLocation={(coords, name, region) => {
            telemetry.selectLocation(coords, name, region);
            setSelectedLocation({
              id: `loc-${name.toLowerCase().replace(/\s+/g, '-')}`,
              type: 'pfz',
              name,
              region: region || 'Marine Sector',
              coordinates: `${coords.latitude.toFixed(2)}°N, ${coords.longitude.toFixed(2)}°E`,
              lat: coords.latitude,
              lng: coords.longitude,
              condition: 'Live Telemetry Synced',
              metrics: {
                seaTemp: `${telemetry.conditions?.sea_temperature ?? 28.4} °C`,
                tempTrend: '↑ 0.2°C',
                waveHeight: `${telemetry.conditions?.wave_height ?? 1.2} m`,
                waveStatus: '• Stable',
                windSpeed: `${telemetry.conditions?.wave_speed ?? 14} km/h`,
                windStatus: '↓ Optimal',
                chlorophyll: `${telemetry.conditions?.chlorophyll ?? 2.4} mg/m³`,
                chloroStatus: '• High',
              },
              alerts: [
                { id: 'a1', title: 'Open-Meteo Synced', severity: 'Low Risk', type: 'advisory' },
              ],
            });
            setSheetVisible(true);
            setZoomLevel(1.15);
          }}
          onResetToGps={() => {
            telemetry.resetToGps();
            handleLocateMe();
          }}
          currentCoords={telemetry.coordinates}
          currentLocationName={telemetry.locationName}
          isCustomLocation={telemetry.isCustomLocation}
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeContainer: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 50,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: 7.5,
    paddingVertical: 4.5,
    borderRadius: 20,
  },
  statusPillDenied: {
    backgroundColor: 'rgba(141, 162, 190, 0.08)',
    borderColor: 'rgba(141, 162, 190, 0.25)',
  },
  statusPillPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
    color: '#00e5ff',
    letterSpacing: 0.2,
  },
  statusTextDenied: {
    color: '#8da2be',
  },
  statusTextPending: {
    color: '#f59e0b',
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 20, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00e5ff',
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
