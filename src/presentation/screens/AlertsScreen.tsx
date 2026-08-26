import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  ShieldCheck,
  Wind,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { AtmosphericBackground } from '../components/brand/AtmosphericBackground';
import { telemetryService } from '../../data/services/telemetryService';
import { MarineAlert } from '../../domain/models/types';

export const AlertsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0) + 6;

  const alerts = telemetryService.getAlerts();

  const renderAlertCard = (alert: MarineAlert) => {
    const isAdvisory = alert.severity === 'Advisory';
    const isWarning = alert.severity === 'Warning' || alert.severity === 'Critical';
    const badgeBg = isWarning
      ? 'rgba(244, 63, 94, 0.15)'
      : isAdvisory
      ? 'rgba(251, 191, 36, 0.15)'
      : 'rgba(34, 211, 238, 0.12)';
    const badgeText = isWarning
      ? '#f43f5e'
      : isAdvisory
      ? Colors.warning
      : Colors.primary;

    return (
      <View key={alert.id} style={styles.alertCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <View style={[styles.severityBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.severityText, { color: badgeText }]}>
                {alert.severity}
              </Text>
            </View>
          </View>
          <View style={styles.locationTimeRow}>
            <Text style={styles.locationText}>{alert.location}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <View style={styles.timeRow}>
              <Clock size={11} color={Colors.onSurfaceVariant} />
              <Text style={styles.timeText}>{alert.timestamp}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.descriptionText}>{alert.description}</Text>

        {/* Action / Operational Advisory */}
        <View style={styles.advisoryBox}>
          <Text style={styles.advisoryLabel}>Recommended Action:</Text>
          <Text style={styles.advisoryText}>{alert.recommendedAction}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#02060e" translucent />
      <AtmosphericBackground />

      <View style={styles.safeContainer}>
        {/* Header with Apple-like Inset Precision */}
        <View style={[styles.topHeader, { paddingTop: topPadding }]}>
          <View>
            <Text style={styles.headerTitle}>Maritime Alert Center</Text>
            <Text style={styles.headerSubtitle}>
              Active advisories & environmental hazard tracking
            </Text>
          </View>

          <View style={styles.statusPill}>
            <ShieldCheck size={13} color={Colors.success} />
            <Text style={styles.statusText}>Safe Seas</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumber}>0</Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumberYellow}>1</Text>
              <Text style={styles.summaryLabel}>Advisory</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryNumberCyan}>2</Text>
              <Text style={styles.summaryLabel}>Info</Text>
            </View>
          </View>

          {/* List of Alerts */}
          {alerts.map((alert) => renderAlertCard(alert))}
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
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    lineHeight: 15,
    color: '#8da2be',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.success,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 14,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(28, 43, 60, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  summaryStat: {
    alignItems: 'center',
    gap: 2,
  },
  summaryNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  summaryNumberYellow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: Colors.warning,
  },
  summaryNumberCyan: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: Colors.primary,
  },
  summaryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  alertCard: {
    backgroundColor: 'rgba(18, 33, 49, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  locationTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  dotSeparator: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  descriptionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#d4e4fa',
  },
  advisoryBox: {
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  advisoryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  advisoryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#ffffff',
  },
});
