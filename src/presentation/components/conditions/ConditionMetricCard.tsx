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
        cardBg: 'rgba(7, 22, 46, 0.78)',
        cardBorder: 'rgba(0, 229, 255, 0.2)',
        badgeBg: 'rgba(0, 229, 255, 0.12)',
        badgeBorder: 'rgba(0, 229, 255, 0.25)',
        statusBg: 'rgba(0, 229, 255, 0.12)',
        statusText: '#00e5ff',
      };
    case 'wave_height':
      return {
        primary: '#38bdf8',
        cardBg: 'rgba(6, 20, 48, 0.78)',
        cardBorder: 'rgba(56, 189, 248, 0.2)',
        badgeBg: 'rgba(56, 189, 248, 0.12)',
        badgeBorder: 'rgba(56, 189, 248, 0.25)',
        statusBg: 'rgba(56, 189, 248, 0.12)',
        statusText: '#38bdf8',
      };
    case 'wind_speed':
      return {
        primary: '#60a5fa',
        cardBg: 'rgba(8, 22, 50, 0.78)',
        cardBorder: 'rgba(96, 165, 250, 0.2)',
        badgeBg: 'rgba(96, 165, 250, 0.12)',
        badgeBorder: 'rgba(96, 165, 250, 0.25)',
        statusBg: 'rgba(96, 165, 250, 0.12)',
        statusText: '#60a5fa',
      };
    case 'chlorophyll':
      return {
        primary: '#00e676',
        cardBg: 'rgba(5, 26, 38, 0.78)',
        cardBorder: 'rgba(0, 230, 118, 0.22)',
        badgeBg: 'rgba(0, 230, 118, 0.12)',
        badgeBorder: 'rgba(0, 230, 118, 0.28)',
        statusBg: 'rgba(0, 230, 118, 0.14)',
        statusText: '#00e676',
      };
    default:
      return {
        primary: '#00e5ff',
        cardBg: 'rgba(7, 22, 46, 0.78)',
        cardBorder: 'rgba(0, 229, 255, 0.2)',
        badgeBg: 'rgba(0, 229, 255, 0.12)',
        badgeBorder: 'rgba(0, 229, 255, 0.25)',
        statusBg: 'rgba(0, 229, 255, 0.12)',
        statusText: '#00e5ff',
      };
  }
};

export const ConditionMetricCard: React.FC<ConditionMetricCardProps> = ({ metric }) => {
  const theme = getMetricTheme(metric.id, metric.colorMode);

  const renderIcon = () => {
    const iconSize = 14;
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
      <View style={styles.sparklineContainer}>
        <Sparkline
          data={metric.sparkline}
          width={165}
          height={40}
          color={theme.primary}
        />
      </View>

      {/* Tier 1: Header (Icon Badge + Metric Title) */}
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
        <Text style={styles.metricName}>{metric.name}</Text>
      </View>

      {/* Tier 2: Hero Value Readout */}
      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{metric.value}</Text>
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
            <ArrowUp size={10} color={theme.statusText} strokeWidth={2.6} style={styles.trendIcon} />
          ) : metric.id === 'wind_speed' ? (
            <ArrowDown size={10} color={theme.statusText} strokeWidth={2.6} style={styles.trendIcon} />
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
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 122,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    left: -4,
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 15,
    color: '#94a3b8',
    letterSpacing: 0.2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 3,
    zIndex: 2,
  },
  valueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 26,
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  unitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 15,
    color: '#8da2be',
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendIcon: {
    marginRight: 1,
  },
  statusDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.3,
  },
});
