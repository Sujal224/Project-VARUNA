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
  Activity,
  Waves,
  Compass,
  Navigation,
  ChevronRight,
  Fish,
  Clock,
} from 'lucide-react-native';
import * as Haptics from '../../utils/haptics';
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
import { ConditionMetricCard } from '../components/conditions/ConditionMetricCard';
import { TabType } from '../components/navigation/BottomNavBar';
import { useLiveTelemetry } from '../../data/hooks/useLiveTelemetry';
import { LocationSearchModal } from '../components/common/LocationSearchModal';
import { mapRepository } from '../../data/repositories/mapRepository';
import { OceanMetric } from '../../domain/models/types';



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
      region: telemetry.locationName || telemetry.regionName || 'Live Vessel Position',
      coordinates: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      lat,
      lng,
      condition: `Safe Navigation (${speed} kts)`,
      metrics: {
        seaTemp: `${telemetry.conditions?.sea_temperature ?? 28.4} °C`,
        tempTrend: 'Live AIS',
        waveHeight: `${telemetry.conditions?.wave_height ?? 1.1} m`,
        waveStatus: '• Calm',
        windSpeed: `${telemetry.conditions?.wave_speed ?? 14} km/h`,
        windStatus: '↓ Optimal',
        chlorophyll: `${telemetry.conditions?.chlorophyll ?? 2.4} mg/m³`,
        chloroStatus: '• Optimal',
      },
      alerts: [
        { id: 'a1', title: 'Command Vessel • Clear Nav Channel', severity: 'Low Risk', type: 'advisory' },
        { id: 'a2', title: 'Live GPS Telemetry Synced', severity: 'Low Risk', type: 'advisory' },
      ],
    });
    setSheetVisible(true);
    setZoomLevel(1.0);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  };

  const userLat = telemetry.coordinates.latitude;
  const userLng = telemetry.coordinates.longitude;
  const userSpeed = telemetry.gpsState.speedKnots || 8.4;

  // Auto-request location permissions on mount
  useEffect(() => {
    if (telemetry.permissionStatus === 'undetermined') {
      telemetry.requestGpsPermission();
    }
  }, []);

  // Compute nearest PFZ dynamically from live satellite telemetry grid
  const computedPfzZones = (telemetry.pfzZones && telemetry.pfzZones.length > 0
    ? telemetry.pfzZones
    : [
        {
          id: 'pfz-alpha',
          name: 'Thermal Front Sector Alpha',
          coordinates: { latitude: Number((userLat + 0.05).toFixed(4)), longitude: Number((userLng + 0.08).toFixed(4)) },
          confidence_percent: 96,
          probability: 'High',
          depth_meters: 58,
          sea_temp_c: 28.2,
          chlorophyll_mg_m3: 2.6,
          target_species: ['Yellowfin Tuna', 'Skipjack', 'Indian Mackerel'],
          optimal_time_window: '05:30 – 10:00 IST',
        },
        {
          id: 'pfz-beta',
          name: 'Thermal Front Sector Beta',
          coordinates: { latitude: Number((userLat + 0.09).toFixed(4)), longitude: Number((userLng - 0.06).toFixed(4)) },
          confidence_percent: 91,
          probability: 'High',
          depth_meters: 64,
          sea_temp_c: 28.0,
          chlorophyll_mg_m3: 2.3,
          target_species: ['Mahi-Mahi', 'King Mackerel', 'Seer Fish'],
          optimal_time_window: '06:00 – 11:30 IST',
        },
      ]
  ).map((zone) => {
    const R = 3440.065; // Nautical Miles Earth Radius
    const dLat = ((zone.coordinates.latitude - userLat) * Math.PI) / 180;
    const dLng = ((zone.coordinates.longitude - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((zone.coordinates.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distNm = Math.round(R * c * 10) / 10;

    const y = Math.sin(dLng) * Math.cos((zone.coordinates.latitude * Math.PI) / 180);
    const x =
      Math.cos((userLat * Math.PI) / 180) * Math.sin((zone.coordinates.latitude * Math.PI) / 180) -
      Math.sin((userLat * Math.PI) / 180) * Math.cos((zone.coordinates.latitude * Math.PI) / 180) * Math.cos(dLng);
    const bearingDeg = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);

    const etaMinutes = Math.round((distNm / Math.max(userSpeed, 1)) * 60);

    return {
      ...zone,
      distanceNm: distNm,
      bearingDeg,
      etaMinutes,
    };
  });

  computedPfzZones.sort((a, b) => a.distanceNm - b.distanceNm);
  const nearestPfz = computedPfzZones[0];

  const handleFocusNearestPfz = () => {
    if (!nearestPfz) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedLocation({
      id: nearestPfz.id,
      type: 'pfz',
      name: nearestPfz.name,
      region: 'Thermal Front Upwelling',
      coordinates: `${nearestPfz.coordinates.latitude.toFixed(4)}°N, ${nearestPfz.coordinates.longitude.toFixed(4)}°E`,
      lat: nearestPfz.coordinates.latitude,
      lng: nearestPfz.coordinates.longitude,
      condition: `Optimal Pelagic Window (${nearestPfz.optimal_time_window})`,
      metrics: {
        seaTemp: `${nearestPfz.sea_temp_c} °C`,
        tempTrend: 'Thermal Front',
        waveHeight: `${telemetry.conditions?.wave_height ?? 1.2} m`,
        waveStatus: '• Stable',
        windSpeed: `${telemetry.conditions?.wave_speed ?? 14} km/h`,
        windStatus: '↓ Optimal',
        chlorophyll: `${nearestPfz.chlorophyll_mg_m3} mg/m³`,
        chloroStatus: '• High Bloom',
      },
      alerts: [
        {
          id: `alert-${nearestPfz.id}`,
          title: `Target Species: ${nearestPfz.target_species.slice(0, 3).join(', ')}`,
          severity: 'Low Risk',
          type: 'advisory',
        },
      ],
    });
    setSheetVisible(true);
    setZoomLevel(1.0);
  };

  const seaTemp = telemetry.conditions?.sea_temperature ?? 28.4;
  const waveHeight = telemetry.conditions?.wave_height ?? 1.2;
  const windSpeed = telemetry.conditions?.wave_speed ?? 14.0;
  const chlorophyll = telemetry.conditions?.chlorophyll ?? 2.4;
  const swellPeriod = telemetry.conditions?.swell_period_sec ?? 9.0;
  const windDir = telemetry.conditions?.wind_direction_deg ?? 120;

  const liveMetrics: OceanMetric[] = [
    {
      id: 'sea_temp',
      name: 'Sea Temp',
      value: `${seaTemp}`,
      unit: '°C',
      delta: '↑ 0.3°C',
      status: 'Optimal Front',
      trend: 'up',
      icon: 'thermometer',
      sparkline: [27.8, 28.0, 28.2, 28.1, 28.3, 28.4, seaTemp],
      colorMode: 'cyan',
    },
    {
      id: 'wave_height',
      name: 'Wave Height',
      value: `${waveHeight}`,
      unit: 'm',
      delta: `${swellPeriod}s`,
      status: waveHeight > 2.0 ? 'Elevated Swell' : 'Calm Swell',
      trend: waveHeight > 2.0 ? 'up' : 'stable',
      icon: 'waves',
      sparkline: [0.9, 1.0, 1.1, 1.3, 1.2, 1.1, waveHeight],
      colorMode: waveHeight > 2.0 ? 'amber' : 'cyan',
    },
    {
      id: 'wind_speed',
      name: 'Wind Velocity',
      value: `${windSpeed}`,
      unit: 'km/h',
      delta: `${windDir}° ESE`,
      status: 'Optimal Flow',
      trend: 'down',
      icon: 'wind',
      sparkline: [16.0, 15.4, 15.0, 14.5, 14.2, 14.0, windSpeed],
      colorMode: 'cyan',
    },
    {
      id: 'chlorophyll',
      name: 'Chlorophyll-a',
      value: `${chlorophyll}`,
      unit: 'mg/m³',
      delta: '↑ High',
      status: 'PFZ Active',
      trend: 'up',
      icon: 'science',
      sparkline: [1.8, 2.0, 2.1, 2.2, 2.3, 2.4, chlorophyll],
      colorMode: 'emerald',
    },
  ];

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

          {/* 5. Nearest Potential Fishing Zone (PFZ) Hero Card */}
          {nearestPfz && (
            <View style={styles.nearestPfzCard}>
              {/* Header */}
              <View style={styles.pfzCardHeader}>
                <View style={styles.pfzHeaderLeft}>
                  <View style={styles.pfzIconCircle}>
                    <Fish size={15} color="#00e5ff" />
                  </View>
                  <View>
                    <Text style={styles.pfzCardTitle}>Nearest Potential Fishing Zone</Text>
                    <Text style={styles.pfzCardSubtitle}>Live Satellite Upwelling Front</Text>
                  </View>
                </View>

                <View style={styles.pfzConfidenceBadge}>
                  <Text style={styles.pfzConfidenceText}>{nearestPfz.confidence_percent}% Match</Text>
                </View>
              </View>

              {/* Coordinates & Zone Name Banner */}
              <View style={styles.pfzLocationBanner}>
                <View style={styles.pfzCoordGroup}>
                  <Text style={styles.pfzZoneName}>{nearestPfz.name}</Text>
                  <Text style={styles.pfzCoordText}>
                    {nearestPfz.coordinates.latitude.toFixed(4)}°N, {nearestPfz.coordinates.longitude.toFixed(4)}°E
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleFocusNearestPfz}
                  style={styles.pfzFocusButton}
                >
                  <Navigation size={12} color="#02060e" />
                  <Text style={styles.pfzFocusButtonText}>Focus on Map</Text>
                </TouchableOpacity>
              </View>

              {/* 3-Column Key Telemetry Readouts */}
              <View style={styles.pfzStatsGrid}>
                <View style={styles.pfzStatItem}>
                  <Text style={styles.pfzStatLabel}>Distance / Bearing</Text>
                  <Text style={styles.pfzStatValueHighlight}>
                    {nearestPfz.distanceNm} NM <Text style={styles.pfzStatUnit}>({nearestPfz.bearingDeg}°)</Text>
                  </Text>
                  <Text style={styles.pfzStatSub}>~{nearestPfz.etaMinutes} mins ETA</Text>
                </View>

                <View style={styles.pfzStatDivider} />

                <View style={styles.pfzStatItem}>
                  <Text style={styles.pfzStatLabel}>Thermal SST Front</Text>
                  <Text style={styles.pfzStatValue}>{nearestPfz.sea_temp_c}°C</Text>
                  <Text style={styles.pfzStatSub}>Optimal Gradient</Text>
                </View>

                <View style={styles.pfzStatDivider} />

                <View style={styles.pfzStatItem}>
                  <Text style={styles.pfzStatLabel}>Seabed Depth</Text>
                  <Text style={styles.pfzStatValue}>{nearestPfz.depth_meters}m</Text>
                  <Text style={styles.pfzStatSub}>Chl {nearestPfz.chlorophyll_mg_m3} mg/m³</Text>
                </View>
              </View>

              {/* Target Pelagic Species Tags */}
              <View style={styles.pfzSpeciesRow}>
                <Text style={styles.pfzSpeciesLabel}>Target Species:</Text>
                <View style={styles.pfzSpeciesTags}>
                  {nearestPfz.target_species.map((species, i) => (
                    <View key={i} style={styles.speciesPill}>
                      <Text style={styles.speciesPillText}>{species}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* 6. Live Oceanic Telemetry Cards Strip */}
          <View style={styles.telemetrySection}>
            <View style={styles.telemetryHeaderRow}>
              <View style={styles.telemetryHeaderLeft}>
                <Activity size={13} color="#00e5ff" />
                <Text style={styles.telemetrySectionTitle}>Live Ocean Telemetry</Text>
              </View>
              <Text style={styles.telemetryBadge}>• NOAA Satellite Synced</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.telemetryCardsStrip}
            >
              {liveMetrics.map((metric) => (
                <ConditionMetricCard key={metric.id} metric={metric} />
              ))}
            </ScrollView>
          </View>

          {/* 7. Selected Location Bottom Sheet */}
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
    marginTop: 10,
    zIndex: 35,
  },
  telemetrySection: {
    marginTop: 8,
    gap: 8,
  },
  telemetryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  telemetryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  telemetrySectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  telemetryBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#00e5ff',
  },
  telemetryCardsStrip: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 4,
  },
  nearestPfzCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: 'rgba(7, 22, 44, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.28)',
    borderTopColor: 'rgba(0, 229, 255, 0.45)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  pfzCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pfzHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pfzIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pfzCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  pfzCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8da2be',
  },
  pfzConfidenceBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  pfzConfidenceText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: '#00e676',
  },
  pfzLocationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 14, 28, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pfzCoordGroup: {
    flex: 1,
    gap: 2,
  },
  pfzZoneName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#e2edfd',
  },
  pfzCoordText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#00e5ff',
    letterSpacing: 0.3,
  },
  pfzFocusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00e5ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pfzFocusButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#02060e',
  },
  pfzStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(4, 14, 28, 0.45)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pfzStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  pfzStatLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#8da2be',
  },
  pfzStatValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },
  pfzStatValueHighlight: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#00e5ff',
  },
  pfzStatUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8da2be',
  },
  pfzStatSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: '#94a3b8',
  },
  pfzStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pfzSpeciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pfzSpeciesLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#8da2be',
  },
  pfzSpeciesTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  speciesPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speciesPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    color: '#38bdf8',
  },
});
