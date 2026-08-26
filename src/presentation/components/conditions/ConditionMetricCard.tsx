import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Waves, Wind, Hexagon, ArrowUp, ArrowDown } from 'lucide-react-native';
import { OceanMetric } from '../../../domain/models/types';
import { Sparkline } from '../common/Sparkline';

interface ConditionMetricCardProps {
  metric: OceanMetric;
}

export const ConditionMetricCard: React.FC<ConditionMetricCardProps> = ({ metric }) => {
  const isEmerald = metric.colorMode === 'emerald' || metric.id === 'chlorophyll';
  const isSeaTemp = metric.id === 'sea_temp';

  const accentColor = isEmerald ? '#00e676' : '#00e5ff';
  const statusColor = isEmerald ? '#00e676' : '#00e5ff';

  const renderIcon = () => {
    const iconSize = 16;
    const iconColor = isEmerald ? '#34d399' : '#38bdf8';

    switch (metric.icon) {
      case 'thermometer':
        return <Thermometer size={iconSize} color={iconColor} />;
      case 'waves':
        return <Waves size={iconSize} color={iconColor} />;
      case 'wind':
        return <Wind size={iconSize} color={iconColor} />;
      case 'science':
      default:
        if (metric.id === 'chlorophyll') {
          return <Hexagon size={iconSize} color={iconColor} />;
        }
        return <Waves size={iconSize} color={iconColor} />;
    }
  };

  const getCleanStatusText = () => {
    if (metric.id === 'sea_temp') return '0.3°C';
    if (metric.id === 'wind_speed') return 'Calming';
    return metric.status.replace(/^[↑↓●\s]+/, '');
  };

  return (
    <View style={styles.card}>
      {/* Background Luminous Wave Sparkline */}
      <View style={styles.sparklineContainer}>
        <Sparkline
          data={metric.sparkline}
          width={160}
          height={38}
          color={accentColor}
        />
      </View>

      {/* Top Header: Icon + Metric Label */}
      <View style={styles.headerRow}>
        {renderIcon()}
        <Text style={styles.metricName}>{metric.name}</Text>
      </View>

      {/* Primary Value Readout */}
      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{metric.value}</Text>
        <Text style={styles.unitText}>{metric.unit}</Text>
      </View>

      {/* Bottom Status & Trend */}
      <View style={styles.statusRow}>
        {metric.id === 'sea_temp' ? (
          <ArrowUp size={11} color={statusColor} strokeWidth={2.5} style={styles.trendIcon} />
        ) : metric.id === 'wind_speed' ? (
          <ArrowDown size={11} color={statusColor} strokeWidth={2.5} style={styles.trendIcon} />
        ) : (
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        )}
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getCleanStatusText()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(9, 23, 44, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 114,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    left: -4,
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  metricName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 15,
    color: '#8da2be',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
    zIndex: 2,
  },
  valueText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 24,
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  unitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 16,
    color: '#8da2be',
    marginLeft: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  trendIcon: {
    marginRight: 0,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});
