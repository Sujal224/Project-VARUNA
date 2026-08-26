import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  AudioWaveform as Waveform,
  Fish,
  CloudSun,
  Waves,
  Navigation,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Database,
  Download,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { VarunaOrb } from '../components/brand/VarunaOrb';
import { VarunaWordmark } from '../components/brand/VarunaWordmark';
import { OceanRadarVisualizer } from '../components/map/OceanRadarVisualizer';
import { ConditionMetricCard } from '../components/conditions/ConditionMetricCard';
import { VarunaInsightCard } from '../components/insights/VarunaInsightCard';
import { QuickActionsRow } from '../components/common/QuickActionsRow';
import { ShinyText } from '../components/common/ShinyText';

import { ExplainableAiModal } from '../components/insights/ExplainableAiModal';
import { telemetryService } from '../../data/services/telemetryService';
import { useLiveTelemetry } from '../../data/hooks/useLiveTelemetry';
import { LocationSearchModal } from '../components/common/LocationSearchModal';
import { OceanMetric } from '../../domain/models/types';
import { TabType } from '../components/navigation/BottomNavBar';


interface HomeScreenProps {
  onNavigateTab: (tab: TabType) => void;
  onAskAi: (query?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onAskAi,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0) + 6;

  const telemetry = useLiveTelemetry();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pfz');
  const [explainModalVisible, setExplainModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const seaTemp = telemetry.conditions?.sea_temperature ?? 28.4;
  const waveHeight = telemetry.conditions?.wave_height ?? 1.2;
  const windSpeed = telemetry.conditions?.wave_speed ?? 14.0;
  const currentSpeed = telemetry.conditions?.current_speed_knots ?? 1.4;
  const chlorophyll = telemetry.conditions?.chlorophyll ?? 2.4;

  const liveMetrics: OceanMetric[] = [
    {
      id: 'metric-sea-temp',
      name: 'Sea Temp',
      value: `${seaTemp}`,
      unit: '°C',
      delta: '↑ 0.3°C',
      status: 'Optimal (28.4°C)',
      trend: 'up',
      icon: 'thermometer',
      sparkline: [27.8, 28.0, 28.2, 28.1, 28.3, 28.4, seaTemp],
      colorMode: 'cyan',
    },
    {
      id: 'metric-wave-height',
      name: 'Wave Height',
      value: `${waveHeight}`,
      unit: 'm',
      delta: `${telemetry.conditions?.swell_period_sec ?? 9}s`,
      status: waveHeight > 2.0 ? 'Elevated Swell' : 'Stable Swell',
      trend: waveHeight > 2.0 ? 'up' : 'stable',
      icon: 'waves',
      sparkline: [0.9, 1.0, 1.1, 1.3, 1.2, 1.1, waveHeight],
      colorMode: waveHeight > 2.0 ? 'amber' : 'cyan',
    },
    {
      id: 'metric-wind-speed',
      name: 'Wind Speed',
      value: `${windSpeed}`,
      unit: 'km/h',
      delta: `${telemetry.conditions?.wind_direction_deg ?? 120}°`,
      status: `Gusts ${telemetry.weather?.current?.wind_gust_kmh ?? 19} km/h`,
      trend: windSpeed > 25 ? 'up' : 'down',
      icon: 'wind',
      sparkline: [12, 13, 15, 14, 16, 15, windSpeed],
      colorMode: 'cyan',
    },
    {
      id: 'metric-chlorophyll',
      name: 'Pelagic Flow',
      value: `${currentSpeed}`,
      unit: 'kts',
      delta: `${chlorophyll} mg/m³`,
      status: 'High Productivity',
      trend: 'up',
      icon: 'science',
      sparkline: [1.2, 1.3, 1.5, 1.4, 1.6, 1.5, currentSpeed],
      colorMode: 'emerald',
    },
  ];


  const primaryInsight = telemetryService.getPrimaryInsight();

  const handleFilterPress = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
    if (filterId === 'pfz' || filterId === 'safe_route') {
      onNavigateTab('map');
    } else if (filterId === 'alerts') {
      onNavigateTab('alerts');
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAskAi(searchQuery);
      setSearchQuery('');
    } else {
      setLocationModalVisible(true);
    }
  };


  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#02060e" translucent />

      <View style={styles.safeContainer}>
        {/* Top App Header with Apple-like Inset Precision */}
        <View style={[styles.topHeader, { paddingTop: topPadding }]}>
          {/* Left: Brand Identity with Glowing Liquid Glass Varuna Orb & Exact Vector Wordmark */}
          <View style={styles.brandGroup}>
            <VarunaOrb size={32} />
            <VarunaWordmark scale={0.62} />
          </View>

          {/* Right: Offline Ready Pill, Bell Notification, Captain Avatar */}
          <View style={styles.headerActions}>
            <View style={styles.offlineReadyPill}>
              <Waveform size={11} color="#00e676" />
              <Text style={styles.offlineReadyText}>Offline Ready</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('alerts')}
              style={styles.headerIconButton}
            >
              <Bell size={16} color="#e2edfd" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('profile')}
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

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroHeadline}>
              Safer Seas.{'\n'}Smarter Decisions.
            </Text>
            <ShinyText
              text="Your AI partner for the ocean."
              fontSize={14}
              fontFamily="Inter_500Medium"
              baseColor="#8da2be"
              shinyColor="#ffffff"
              accentColor="#38bdf8"
            />
          </View>

          {/* AI Search / Prompt Capsule (Liquid Glass Style) */}
          <View style={styles.searchGateway}>
            <View style={styles.searchOrbWrapper}>
              <VarunaOrb size={40} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Ask VARUNA anything..."
              placeholderTextColor="#8da2be"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigateTab('ai')}
              style={styles.micButton}
            >
              <Waveform size={20} color="#38bdf8" />
            </TouchableOpacity>
          </View>

          {/* Quick Intelligence Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterPress('pfz')}
              style={[
                styles.filterPill,
                selectedFilter === 'pfz' && styles.filterPillActive,
              ]}
            >
              <Fish
                size={14}
                color={selectedFilter === 'pfz' ? '#00e5ff' : '#8da2be'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'pfz' && styles.filterTextActive,
                ]}
              >
                PFZ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterPress('weather')}
              style={[
                styles.filterPill,
                selectedFilter === 'weather' && styles.filterPillActive,
              ]}
            >
              <CloudSun
                size={14}
                color={selectedFilter === 'weather' ? '#00e5ff' : '#8da2be'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'weather' && styles.filterTextActive,
                ]}
              >
                Weather
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterPress('tides')}
              style={[
                styles.filterPill,
                selectedFilter === 'tides' && styles.filterPillActive,
              ]}
            >
              <Waves
                size={14}
                color={selectedFilter === 'tides' ? '#00e5ff' : '#8da2be'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'tides' && styles.filterTextActive,
                ]}
              >
                Tides
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterPress('safe_route')}
              style={[
                styles.filterPill,
                selectedFilter === 'safe_route' && styles.filterPillActive,
              ]}
            >
              <Navigation
                size={14}
                color={selectedFilter === 'safe_route' ? '#00e5ff' : '#8da2be'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'safe_route' && styles.filterTextActive,
                ]}
              >
                Safe Route
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleFilterPress('alerts')}
              style={[
                styles.filterPill,
                selectedFilter === 'alerts' && styles.filterPillActive,
              ]}
            >
              <AlertTriangle
                size={14}
                color={selectedFilter === 'alerts' ? '#00e5ff' : '#8da2be'}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'alerts' && styles.filterTextActive,
                ]}
              >
                Alerts
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Ocean Radar & Bathymetry Geospatial Visualizer Section */}
          <OceanRadarVisualizer
            onPressPfz={() => onNavigateTab('map')}
            onPressCyclone={() => onNavigateTab('alerts')}
          />

          {/* Real-Time Conditions Master Liquid Glass Container */}
          <View style={styles.conditionsSection}>
            <View style={styles.conditionsHeader}>
              <View style={styles.conditionsTitleRow}>
                <Text style={styles.conditionsTitle}>Real-Time Conditions</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLocationModalVisible(true);
                }}
                style={styles.locationSelector}
              >
                <MapPin size={13} color="#00e5ff" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {telemetry.locationName || 'Bay of Bengal'}
                </Text>
                <ChevronRight size={14} color="#8da2be" />
              </TouchableOpacity>
            </View>

            {/* Smooth Horizontal Carousel for 4 Metric Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.metricsScroll}
            >
              {liveMetrics.map((metric) => (
                <ConditionMetricCard key={metric.id} metric={metric} />
              ))}
            </ScrollView>
          </View>

          {/* VARUNA AI Insight Card */}
          <VarunaInsightCard
            insight={primaryInsight}
            onViewPfzMap={() => onNavigateTab('map')}
            onExplain={() => setExplainModalVisible(true)}
          />

          {/* Quick Actions Row */}
          <QuickActionsRow
            onSelectAction={(_id, tab) => tab && onNavigateTab(tab)}
            onSeeAll={() => onNavigateTab('map')}
          />

          {/* Offline Ready Module */}
          <View style={styles.offlineCard}>
            <View style={styles.offlineCardLeft}>
              <View style={styles.offlineIconCircle}>
                <Database size={18} color="#00e5ff" />
              </View>
              <View style={styles.offlineTextGroup}>
                <View style={styles.offlineTitleRow}>
                  <Text style={styles.offlineCardTitle}>Offline Ready</Text>
                  <View style={styles.betaTag}>
                    <Text style={styles.betaTagText}>BETA</Text>
                  </View>
                </View>
                <Text style={styles.offlineCardSubtitle}>
                  Core features work without internet using cached data.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onNavigateTab('profile')}
              style={styles.manageDataButton}
            >
              <Download size={13} color="#ffffff" />
              <Text style={styles.manageDataText}>Manage Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Explainable AI Modal */}
        <ExplainableAiModal
          visible={explainModalVisible}
          insight={primaryInsight}
          onClose={() => setExplainModalVisible(false)}
        />

        {/* Global Location Search & Port Selector Modal */}
        <LocationSearchModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          onSelectLocation={(coords, name, region) => {
            telemetry.selectLocation(coords, name, region);
          }}
          onResetToGps={() => {
            telemetry.resetToGps();
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: 7.5,
    paddingVertical: 4.5,
    borderRadius: 9999,
  },
  offlineReadyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
    color: '#00e676',
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 135,
    gap: 16,
  },
  heroSection: {
    gap: 5,
    marginTop: 2,
  },
  heroHeadline: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: '#ffffff',
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 17,
    color: '#8da2be',
  },
  searchGateway: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 20, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 6,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchOrbWrapper: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  filterScroll: {
    gap: 7,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(8, 20, 38, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 9999,
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    borderTopColor: 'rgba(0, 229, 255, 0.6)',
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#8da2be',
  },
  filterTextActive: {
    color: '#00e5ff',
    fontFamily: 'Inter_600SemiBold',
  },
  conditionsSection: {
    backgroundColor: 'rgba(6, 18, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  conditionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  conditionsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
    lineHeight: 18,
    color: '#ffffff',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00e676',
  },
  liveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
    textTransform: 'uppercase',
    color: '#00e676',
    letterSpacing: 0.5,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8da2be',
  },
  metricsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 4,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 20, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  offlineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  offlineIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineTextGroup: {
    flex: 1,
    gap: 2,
  },
  offlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: '#ffffff',
  },
  betaTag: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  betaTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#00e676',
    letterSpacing: 0.4,
  },
  offlineCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 14,
    color: '#8da2be',
  },
  manageDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 119, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(0, 150, 255, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  manageDataText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
  },
});
