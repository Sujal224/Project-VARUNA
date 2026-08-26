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
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import { OceanRadarVisualizer } from '../components/map/OceanRadarVisualizer';
import { ConditionMetricCard } from '../components/conditions/ConditionMetricCard';
import { VarunaInsightCard } from '../components/insights/VarunaInsightCard';
import { QuickActionsRow } from '../components/common/QuickActionsRow';
import { ExplainableAiModal } from '../components/insights/ExplainableAiModal';
import { telemetryService } from '../../data/services/telemetryService';
import { TabType } from '../components/navigation/BottomNavBar';

interface HomeScreenProps {
  onNavigateTab: (tab: TabType) => void;
  onAskAi: (query?: string) => void;
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
      onNavigateTab('ai');
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#02060e" translucent />
      <AtmosphericBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top App Header */}
        <View style={styles.topHeader}>
          {/* Left: Brand Identity with Glowing Varuna Orb */}
          <View style={styles.brandGroup}>
            <VarunaOrb size={38} />
            <View style={styles.brandTitleContainer}>
              <Text style={styles.brandName}>VARUNA</Text>
              <Text style={styles.brandTagline}>MARINE INTELLIGENCE</Text>
            </View>
          </View>

          {/* Right: Offline Ready Pill, Bell Notification, Captain Avatar */}
          <View style={styles.headerActions}>
            <View style={styles.offlineReadyPill}>
              <Waveform size={14} color="#00e676" />
              <Text style={styles.offlineReadyText}>Offline Ready</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('alerts')}
              style={styles.headerIconButton}
            >
              <Bell size={18} color="#e2edfd" />
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

          {/* AI Search / Prompt Capsule */}
          <View style={styles.searchGateway}>
            <View style={styles.searchOrbWrapper}>
              <VarunaOrb size={34} />
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

          {/* Center Ocean Bathymetry & Radar Visualizer */}
          <OceanRadarVisualizer
            onPressPfz={() => onNavigateTab('map')}
            onPressCyclone={() => onNavigateTab('alerts')}
          />

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
                <MapPin size={13} color="#8da2be" />
                <Text style={styles.locationText}>Bay of Bengal</Text>
                <ChevronRight size={14} color="#8da2be" />
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
    gap: 2,
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
    fontSize: 7.5,
    lineHeight: 9,
    letterSpacing: 1.2,
    color: '#8da2be',
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
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  offlineReadyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#00e676',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 23, 40, 0.65)',
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e5ff',
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
    paddingTop: 14,
    paddingBottom: 110,
    gap: 20,
  },
  heroSection: {
    gap: 6,
    marginTop: 4,
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
    fontSize: 14,
    lineHeight: 18,
    color: '#8da2be',
  },
  searchGateway: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 20, 36, 0.65)',
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
    backgroundColor: 'rgba(8, 20, 36, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#8da2be',
  },
  filterTextActive: {
    color: '#00e5ff',
    fontFamily: 'Inter_600SemiBold',
  },
  conditionsSection: {
    gap: 12,
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
    lineHeight: 18,
    color: '#ffffff',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#00e676',
    letterSpacing: 0.6,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8da2be',
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
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 20, 36, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
  },
  offlineCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  offlineIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
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
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 15,
    color: '#00e676',
  },
  betaTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  betaTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#8da2be',
  },
  offlineCardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 13,
    color: '#8da2be',
  },
  manageDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  manageDataText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#ffffff',
  },
});

