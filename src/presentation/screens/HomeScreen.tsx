import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import {
  Radio,
  Bell,
  AudioWaveform as Waveform,
  Fish,
  Cloud,
  Waves,
  Navigation,
  AlertTriangle,
  MapPin,
  ChevronRight,
  HardDrive,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { VarunaOrb } from '../components/brand/VarunaOrb';
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import { ConditionMetricCard } from '../components/conditions/ConditionMetricCard';
import { VarunaInsightCard } from '../components/insights/VarunaInsightCard';
import { ExplainableAiModal } from '../components/insights/ExplainableAiModal';
import { MarineMapPreview } from '../components/map/MarineMapPreview';
import { telemetryService } from '../../data/services/telemetryService';
import { TabType } from '../components/navigation/BottomNavBar';

interface HomeScreenProps {
  onNavigateTab: (tab: TabType) => void;
  onAskAi: (query: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onAskAi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pfz');
  const [explainModalVisible, setExplainModalVisible] = useState(false);

  const metrics = telemetryService.getMetrics();
  const primaryInsight = telemetryService.getPrimaryInsight();
  const pfzZone = telemetryService.getPfzZones()[0];
  const vessel = telemetryService.getVessel();
  const offlineStatus = telemetryService.getOfflineStatus();

  const handleFilterPress = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
    if (filterId === 'map' || filterId === 'pfz' || filterId === 'safe_route') {
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
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#051424" translucent />
      <AtmosphericBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top App Header */}
        <View style={styles.topHeader}>
          {/* Brand Identity & Status */}
          <View style={styles.brandGroup}>
            <VarunaOrb size={36} />
            <View style={styles.brandTitleContainer}>
              <Text style={styles.brandName}>VARUNA</Text>
              <Text style={styles.brandTagline}>MARINE INTELLIGENCE</Text>
            </View>
          </View>

          {/* Right Header Actions: Offline Ready, Bell, Captain Avatar */}
          <View style={styles.headerActions}>
            <View style={styles.offlineReadyPill}>
              <Radio size={13} color={Colors.primary} />
              <Text style={styles.offlineReadyText}>Offline Ready</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('alerts')}
              style={styles.headerIconButton}
            >
              <Bell size={18} color={Colors.onSurface} />
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
            <Text style={styles.heroSubtext}>Your AI partner for the ocean.</Text>
          </View>

          {/* AI Search / Voice Interaction Gateway */}
          <View style={styles.searchGateway}>
            <View style={styles.searchOrbWrapper}>
              <VarunaOrb size={38} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Ask VARUNA anything..."
              placeholderTextColor={Colors.onSurfaceVariant}
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
              <Waveform size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Quick Intelligence Filters */}
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
              <Fish size={15} color={selectedFilter === 'pfz' ? Colors.primary : Colors.onSurfaceVariant} />
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
              <Cloud size={15} color={selectedFilter === 'weather' ? Colors.primary : Colors.onSurfaceVariant} />
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
              <Waves size={15} color={selectedFilter === 'tides' ? Colors.primary : Colors.onSurfaceVariant} />
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
              <Navigation size={15} color={selectedFilter === 'safe_route' ? Colors.primary : Colors.onSurfaceVariant} />
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
              <AlertTriangle size={15} color={selectedFilter === 'alerts' ? Colors.primary : Colors.onSurfaceVariant} />
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

          {/* Real-Time Conditions 4-Metric Grid */}
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
                onPress={() => onNavigateTab('map')}
                style={styles.locationSelector}
              >
                <MapPin size={13} color={Colors.primary} />
                <Text style={styles.locationText}>Bay of Bengal</Text>
                <ChevronRight size={14} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.metricsGrid}>
              {metrics.map((metric) => (
                <View key={metric.id} style={styles.metricGridItem}>
                  <ConditionMetricCard metric={metric} />
                </View>
              ))}
            </View>
          </View>

          {/* VARUNA Insight Component */}
          <VarunaInsightCard
            insight={primaryInsight}
            onViewPfzMap={() => onNavigateTab('map')}
            onExplain={() => setExplainModalVisible(true)}
          />

          {/* Interactive Geospatial Map Preview */}
          <View style={styles.mapSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Marine Intelligence Grid</Text>
              <Text style={styles.sectorText}>Sector Alpha • Active</Text>
            </View>
            <MarineMapPreview
              zone={pfzZone}
              vessel={vessel}
              onExpandMap={() => onNavigateTab('map')}
            />
          </View>

          {/* Offline Intelligence Banner */}
          <View style={styles.offlineCard}>
            <View style={styles.offlineCardLeft}>
              <HardDrive size={18} color={Colors.primary} />
              <View>
                <Text style={styles.offlineCardTitle}>Offline Ready Cache</Text>
                <Text style={styles.offlineCardSubtitle}>
                  {offlineStatus.cachedSectorsCount} sectors & bathymetry tiles synced ({Math.round(offlineStatus.cacheSizeBytes / (1024 * 1024))} MB)
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('profile')}
              style={styles.manageDataButton}
            >
              <Text style={styles.manageDataText}>Manage</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Explainable AI Modal */}
        <ExplainableAiModal
          visible={explainModalVisible}
          insight={primaryInsight}
          onClose={() => setExplainModalVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#051424',
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitleContainer: {
    gap: 1,
  },
  brandName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 2,
    color: '#ffffff',
  },
  brandTagline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 1.2,
    color: Colors.onSurfaceVariant,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  offlineReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  offlineReadyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.primary,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 22,
  },
  heroSection: {
    gap: 4,
    marginTop: 6,
  },
  heroHeadline: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: '#ffffff',
  },
  heroSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  searchGateway: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 6,
    position: 'relative',
  },
  searchOrbWrapper: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#ffffff',
    paddingHorizontal: 4,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  filterPillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  filterTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  conditionsSection: {
    backgroundColor: 'rgba(18, 33, 49, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  conditionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  liveText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  metricGridItem: {
    width: '48%',
  },
  mapSection: {
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  sectorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(28, 43, 60, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
  },
  offlineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  offlineCardTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  offlineCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  manageDataButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  manageDataText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.primary,
  },
});
