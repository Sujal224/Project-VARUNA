import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Ship,
  HardDrive,
  Radio,
  Settings,
  RefreshCw,
  Trash2,
  DownloadCloud,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import { telemetryService } from '../../data/services/telemetryService';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0) + 6;

  const vessel = telemetryService.getVessel();
  const offlineStatus = telemetryService.getOfflineStatus();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#02060e" translucent />
      <AtmosphericBackground />

      <View style={styles.safeContainer}>
        {/* Header with Apple-like Inset Precision */}
        <View style={[styles.topHeader, { paddingTop: topPadding }]}>
          <Text style={styles.headerTitle}>Vessel & Offline System</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.settingsButton}
          >
            <Settings size={17} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Captain & Vessel Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=160&auto=format&fit=crop&q=80',
                }}
                style={styles.avatarLarge}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.captainName}>Captain R. Sharma</Text>
                <Text style={styles.vesselCallSign}>
                  Master Mariner • {vessel.name} ({vessel.callSign})
                </Text>
                <View style={styles.vesselStatusPill}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.vesselStatusText}>Active Voyage • {vessel.speedKnots} kts</Text>
                </View>
              </View>
            </View>

            {/* Vessel Telemetry Specs */}
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Heading</Text>
                <Text style={styles.specValue}>{vessel.heading}°</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Destination</Text>
                <Text style={styles.specValue}>{vessel.destination}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Fuel Reserve</Text>
                <Text style={styles.specValueEmerald}>{vessel.fuelPercent}%</Text>
              </View>
            </View>
          </View>

          {/* Offline Intelligence & Tile Cache Management */}
          <View style={styles.sectionHeaderRow}>
            <HardDrive size={16} color={Colors.primary} />
            <Text style={styles.sectionHeaderTitle}>Offline Data Engine</Text>
          </View>

          <View style={styles.cacheCard}>
            <View style={styles.cacheRow}>
              <View>
                <Text style={styles.cacheTitle}>Oceanographic Tile Cache</Text>
                <Text style={styles.cacheSubtitle}>
                  {offlineStatus.cachedSectorsCount} sectors cached • {Math.round(offlineStatus.cacheSizeBytes / (1024 * 1024))} MB used
                </Text>
              </View>
              <View style={styles.syncedBadge}>
                <ShieldCheck size={13} color={Colors.success} />
                <Text style={styles.syncedText}>Synced</Text>
              </View>
            </View>

            <View style={styles.cacheDivider} />

            <View style={styles.cacheDetailsGrid}>
              <View style={styles.cacheDetailBox}>
                <Text style={styles.cacheDetailNumber}>{offlineStatus.cachedTilesCount}</Text>
                <Text style={styles.cacheDetailLabel}>Bathymetric Tiles</Text>
              </View>
              <View style={styles.cacheDetailBox}>
                <Text style={styles.cacheDetailNumber}>6</Text>
                <Text style={styles.cacheDetailLabel}>PFZ Sectors</Text>
              </View>
              <View style={styles.cacheDetailBox}>
                <Text style={styles.cacheDetailNumber}>48 hr</Text>
                <Text style={styles.cacheDetailLabel}>Weather Cache</Text>
              </View>
            </View>

            {/* Offline Sync Actions */}
            <View style={styles.cacheActionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                style={styles.syncButton}
              >
                <RefreshCw size={14} color="#ffffff" />
                <Text style={styles.syncButtonText}>Update All Sectors</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={styles.clearCacheButton}
              >
                <Trash2 size={14} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences & System Settings */}
          <View style={styles.sectionHeaderRow}>
            <Radio size={16} color={Colors.primary} />
            <Text style={styles.sectionHeaderTitle}>Telemetry Sync & Units</Text>
          </View>

          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Bathymetry Depth Units</Text>
                <Text style={styles.settingSubtitle}>Meters (m)</Text>
              </View>
              <ChevronRight size={16} color={Colors.onSurfaceVariant} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Speed & Distance</Text>
                <Text style={styles.settingSubtitle}>Knots / Nautical Miles (nm)</Text>
              </View>
              <ChevronRight size={16} color={Colors.onSurfaceVariant} />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Automatic Pre-voyage Cache</Text>
                <Text style={styles.settingSubtitle}>Enabled when docked or on Wi-Fi</Text>
              </View>
              <ShieldCheck size={16} color={Colors.success} />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#02060e',
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
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 25,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(28, 43, 60, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 16,
  },
  profileCard: {
    backgroundColor: 'rgba(28, 43, 60, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  captainName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
  vesselCallSign: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  vesselStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.success,
  },
  vesselStatusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.success,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  specBox: {
    flex: 1,
    backgroundColor: 'rgba(18, 33, 49, 0.6)',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  specLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    textTransform: 'uppercase',
    color: Colors.onSurfaceVariant,
  },
  specValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#ffffff',
  },
  specValueEmerald: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.success,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  cacheCard: {
    backgroundColor: 'rgba(18, 33, 49, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  cacheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cacheTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  cacheSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  syncedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.success,
  },
  cacheDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cacheDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cacheDetailBox: {
    alignItems: 'center',
    gap: 2,
  },
  cacheDetailNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
  cacheDetailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  cacheActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  syncButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
  },
  syncButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
  },
  clearCacheButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsList: {
    backgroundColor: 'rgba(28, 43, 60, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#ffffff',
  },
  settingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});
