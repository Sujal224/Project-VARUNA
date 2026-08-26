import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Waves, Wind, Hexagon, ArrowUp, ArrowDown } from 'lucide-react-native';
import { OceanMetric } from '../../../domain/models/types';
import { Sparkline } from '../common/Sparkline';

interface ConditionMetricCardProps {
  metric: OceanMetric;
}

interface MetricTheme {
  primary: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeBorder: string;
  statusBg: string;
  statusText: string;
}

const getMetricTheme = (id: string, colorMode?: string): MetricTheme => {
  switch (id) {
    case 'sea_temp':
      return {
        primary: '#00e5ff',
        cardBg: 'rgba(7, 22, 48, 0.85)',
        cardBorder: 'rgba(0, 229, 255, 0.24)',
        badgeBg: 'rgba(0, 229, 255, 0.14)',
        badgeBorder: 'rgba(0, 229, 255, 0.3)',
        statusBg: 'rgba(0, 229, 255, 0.14)',
        statusText: '#00e5ff',
      };
    case 'wave_height':
      return {
        primary: '#38bdf8',
        cardBg: 'rgba(6, 20, 50, 0.85)',
        cardBorder: 'rgba(56, 189, 248, 0.24)',
        badgeBg: 'rgba(56, 189, 248, 0.14)',
        badgeBorder: 'rgba(56, 189, 248, 0.3)',
        statusBg: 'rgba(56, 189, 248, 0.14)',
        statusText: '#38bdf8',
      };
    case 'wind_speed':
      return {
        primary: '#818cf8',
        cardBg: 'rgba(10, 22, 54, 0.85)',
        cardBorder: 'rgba(129, 140, 248, 0.24)',
        badgeBg: 'rgba(129, 140, 248, 0.14)',
        badgeBorder: 'rgba(129, 140, 248, 0.3)',
        statusBg: 'rgba(129, 140, 248, 0.14)',
        statusText: '#818cf8',
      };
    case 'chlorophyll':
      return {
        primary: '#00e676',
        cardBg: 'rgba(5, 26, 40, 0.85)',
        cardBorder: 'rgba(0, 230, 118, 0.26)',
        badgeBg: 'rgba(0, 230, 118, 0.14)',
        badgeBorder: 'rgba(0, 230, 118, 0.32)',
        statusBg: 'rgba(0, 230, 118, 0.15)',
        statusText: '#00e676',
      };
    default:
      return {
        primary: '#00e5ff',
        cardBg: 'rgba(7, 22, 48, 0.85)',
        cardBorder: 'rgba(0, 229, 255, 0.24)',
        badgeBg: 'rgba(0, 229, 255, 0.14)',
        badgeBorder: 'rgba(0, 229, 255, 0.3)',
        statusBg: 'rgba(0, 229, 255, 0.14)',
        statusText: '#00e5ff',
      };
  }
};

export const ConditionMetricCard: React.FC<ConditionMetricCardProps> = ({ metric }) => {
  const theme = getMetricTheme(metric.id, metric.colorMode);

  const renderIcon = () => {
    const iconSize = 12;
    switch (metric.icon) {
      case 'thermometer':
        return <Thermometer size={iconSize} color={theme.primary} strokeWidth={2.2} />;
      case 'waves':
        return <Waves size={iconSize} color={theme.primary} strokeWidth={2.2} />;
      case 'wind':
        return <Wind size={iconSize} color={theme.primary} strokeWidth={2.2} />;
      case 'science':
      default:
        if (metric.id === 'chlorophyll') {
          return <Hexagon size={iconSize} color={theme.primary} strokeWidth={2.2} />;
        }
        return <Waves size={iconSize} color={theme.primary} strokeWidth={2.2} />;
    }
  };

  const getCleanStatusText = () => {
    if (metric.id === 'sea_temp') return '0.3°C';
    if (metric.id === 'wind_speed') return 'Calming';
    if (metric.id === 'chlorophyll') return 'High';
    return metric.status.replace(/^[↑↓●\s]+/, '');
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {/* Background Luminous Wave Sparkline */}
      <View style={styles.sparklineContainer} pointerEvents="none">
        <Sparkline
          data={metric.sparkline}
          width={124}
          height={32}
          color={theme.primary}
        />
      </View>

      {/* Tier 1: Header (Icon Badge + Full Metric Title) */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: theme.badgeBg,
              borderColor: theme.badgeBorder,
            },
          ]}
        >
          {renderIcon()}
        </View>
        <Text style={styles.metricName} numberOfLines={1}>
          {metric.name}
        </Text>
      </View>

      {/* Tier 2: Hero Value Readout with Clean Typography */}
      <View style={styles.valueRow}>
        <Text style={styles.valueText}>
          {metric.value}
        </Text>
        <Text style={styles.unitText}>{metric.unit}</Text>
      </View>

      {/* Tier 3: Telemetry Status & Trend Pill */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: theme.statusBg,
            },
          ]}
        >
          {metric.id === 'sea_temp' ? (
            <ArrowUp size={9} color={theme.statusText} strokeWidth={2.6} style={styles.trendIcon} />
          ) : metric.id === 'wind_speed' ? (
            <ArrowDown size={9} color={theme.statusText} strokeWidth={2.6} style={styles.trendIcon} />
          ) : (
            <View style={[styles.statusDot, { backgroundColor: theme.statusText }]} />
          )}
          <Text style={[styles.statusText, { color: theme.statusText }]}>
            {getCleanStatusText()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 122,
    minHeight: 118,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 11,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: -1,
    right: -4,
    left: -4,
    opacity: 0.75,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 3,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    color: '#94a3b8',
    flex: 1,
    letterSpacing: -0.1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 3,
    zIndex: 3,
  },
  valueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    lineHeight: 21,
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  unitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 14,
    color: '#8da2be',
    marginLeft: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendIcon: {
    marginRight: 0,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 0.2,
  },
});
