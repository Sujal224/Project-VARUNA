import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  Star,
  X,
  ShieldCheck,
  Thermometer,
  Waves,
  Wind,
  Sparkles,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';
import { MapMarkerLocation } from './InteractiveOceanMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SelectedLocationSheetProps {
  location: MapMarkerLocation;
  onClose?: () => void;
  onAlertsPress?: () => void;
}

export const SelectedLocationSheet: React.FC<SelectedLocationSheetProps> = ({
  location,
  onClose,
  onAlertsPress,
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaved(!isSaved);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose?.();
  };

  const handleAlertsTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAlertsPress?.();
  };

  return (
    <View style={styles.sheetContainer}>
      {/* 1. Top Drag Handle Pill */}
      <View style={styles.handleWrapper}>
        <View style={styles.dragHandle} />
      </View>

      {/* 2. Header Row: "• Selected Location", Favorite Star, Close */}
      <View style={styles.headerRow}>
        <View style={styles.headerIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.headerIndicatorText}>Selected Location</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleFavorite}
            style={[styles.headerActionBtn, isSaved && styles.actionBtnActive]}
          >
            <Star
              size={15}
              color={isSaved ? '#fbbf24' : '#94a3b8'}
              fill={isSaved ? '#fbbf24' : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClose}
            style={styles.headerActionBtn}
          >
            <X size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Location Coordinates & Region */}
      <View style={styles.titleSection}>
        <Text style={styles.coordinateTitle}>{location.coordinates}</Text>
        <Text style={styles.regionSubtitle}>{location.region}</Text>
      </View>

      {/* 4. Safe Conditions Status Pill */}
      <View style={styles.conditionRow}>
        <View style={styles.conditionPill}>
          <ShieldCheck size={13} color="#00e5ff" />
          <Text style={styles.conditionText}>{location.condition}</Text>
        </View>
      </View>

      {/* 5. Four Marine Metric Cards */}
      <View style={styles.metricsGrid}>
        {/* Card 1: Sea Temp */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Thermometer size={13} color="#00e5ff" />
            <Text style={styles.metricLabel}>Sea Temp</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValueNum}>{location.metrics.seaTemp.split(' ')[0]}</Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
          <Text style={styles.metricTrendText}>{location.metrics.tempTrend}</Text>

          {/* Smooth Blue Wave Sparkline */}
          <View style={styles.cardSparkline}>
            <Svg width="100%" height={22} viewBox="0 0 80 22">
              <Defs>
                <LinearGradient id="waveGradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 0 16 Q 20 8, 40 14 T 80 8 L 80 22 L 0 22 Z"
                fill="url(#waveGradBlue)"
              />
              <Path
                d="M 0 16 Q 20 8, 40 14 T 80 8"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1.6"
              />
            </Svg>
          </View>
        </View>

        {/* Card 2: Wave Height */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Waves size={13} color="#00e5ff" />
            <Text style={styles.metricLabel}>Wave Height</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValueNum}>{location.metrics.waveHeight.split(' ')[0]}</Text>
            <Text style={styles.metricUnit}>m</Text>
          </View>
          <Text style={styles.metricTrendText}>{location.metrics.waveStatus}</Text>

          {/* Smooth Ocean Wave Sparkline */}
          <View style={styles.cardSparkline}>
            <Svg width="100%" height={22} viewBox="0 0 80 22">
              <Defs>
                <LinearGradient id="waveGradTeal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#00b4d8" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#00b4d8" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 0 14 Q 22 20, 44 10 T 80 12 L 80 22 L 0 22 Z"
                fill="url(#waveGradTeal)"
              />
              <Path
                d="M 0 14 Q 22 20, 44 10 T 80 12"
                fill="none"
                stroke="#00b4d8"
                strokeWidth="1.6"
              />
            </Svg>
          </View>
        </View>

        {/* Card 3: Wind Speed */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Wind size={13} color="#00e5ff" />
            <Text style={styles.metricLabel}>Wind Speed</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValueNum}>{location.metrics.windSpeed.split(' ')[0]}</Text>
            <Text style={styles.metricUnit}>km/h</Text>
          </View>
          <Text style={styles.metricTrendText}>{location.metrics.windStatus}</Text>

          {/* Smooth Calming Wind Sparkline */}
          <View style={styles.cardSparkline}>
            <Svg width="100%" height={22} viewBox="0 0 80 22">
              <Defs>
                <LinearGradient id="waveGradWind" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 0 8 Q 24 16, 50 12 T 80 18 L 80 22 L 0 22 Z"
                fill="url(#waveGradWind)"
              />
              <Path
                d="M 0 8 Q 24 16, 50 12 T 80 18"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.6"
              />
            </Svg>
          </View>
        </View>

        {/* Card 4: Chlorophyll */}
        <View style={styles.metricCard}>
          <View style={styles.metricTopRow}>
            <Sparkles size={13} color="#10b981" />
            <Text style={styles.metricLabel}>Chlorophyll</Text>
          </View>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValueNum}>{location.metrics.chlorophyll.split(' ')[0]}</Text>
            <Text style={styles.metricUnit}>mg/m³</Text>
          </View>
          <Text style={[styles.metricTrendText, { color: '#10b981' }]}>
            {location.metrics.chloroStatus}
          </Text>

          {/* Smooth Emerald Bloom Sparkline */}
          <View style={styles.cardSparkline}>
            <Svg width="100%" height={22} viewBox="0 0 80 22">
              <Defs>
                <LinearGradient id="waveGradEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                  <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path
                d="M 0 18 Q 22 6, 45 15 T 80 8 L 80 22 L 0 22 Z"
                fill="url(#waveGradEmerald)"
              />
              <Path
                d="M 0 18 Q 22 6, 45 15 T 80 8"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.6"
              />
            </Svg>
          </View>
        </View>
      </View>

      {/* 6. Nearby Alerts Section */}
      <View style={styles.alertsSection}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAlertsTap}
          style={styles.alertsHeaderRow}
        >
          <Text style={styles.alertsSectionTitle}>Nearby Alerts</Text>
          <View style={styles.activeAlertsPill}>
            <Text style={styles.activeAlertsText}>2 Active</Text>
            <ChevronRight size={13} color="#f59e0b" />
          </View>
        </TouchableOpacity>

        {/* 2 Side-by-side Alert Cards */}
        <View style={styles.alertCardsRow}>
          {/* Card 1: Strong Current */}
          <View style={styles.alertCard}>
            <View style={styles.alertIconWrapperAmber}>
              <Waves size={16} color="#f59e0b" />
            </View>
            <View style={styles.alertTextColumn}>
              <Text style={styles.alertCardTitle} numberOfLines={1}>
                Strong Current
              </Text>
              <Text style={styles.alertCardSeverityAmber}>Moderate</Text>
            </View>
          </View>

          {/* Card 2: Small Craft Advisory */}
          <View style={styles.alertCard}>
            <View style={styles.alertIconWrapperPurple}>
              <AlertTriangle size={16} color="#c084fc" />
            </View>
            <View style={styles.alertTextColumn}>
              <Text style={styles.alertCardTitle} numberOfLines={1}>
                Small Craft Advisory
              </Text>
              <Text style={styles.alertCardSeverityPurple}>Low Risk</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: 'rgba(5, 13, 24, 0.94)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  handleWrapper: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2e3d52',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  headerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e676',
    shadowColor: '#00e676',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  headerIndicatorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#94a3b8',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  titleSection: {
    marginTop: 6,
  },
  coordinateTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 26,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  regionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#8da2be',
    marginTop: 2,
  },
  conditionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  conditionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#00e5ff',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(8, 20, 36, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingTop: 9,
    paddingBottom: 0,
    overflow: 'hidden',
    position: 'relative',
    height: 92,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#8da2be',
    flexShrink: 1,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 3,
  },
  metricValueNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  metricUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8.5,
    color: '#8da2be',
  },
  metricTrendText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: '#00e5ff',
    marginTop: 1,
  },
  cardSparkline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
  },
  alertsSection: {
    marginTop: 14,
    gap: 9,
  },
  alertsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertsSectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  activeAlertsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  activeAlertsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#f59e0b',
  },
  alertCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alertCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 20, 36, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 9,
  },
  alertIconWrapperAmber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconWrapperPurple: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextColumn: {
    flex: 1,
    gap: 1,
  },
  alertCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ffffff',
  },
  alertCardSeverityAmber: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#f59e0b',
  },
  alertCardSeverityPurple: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    color: '#c084fc',
  },
});
