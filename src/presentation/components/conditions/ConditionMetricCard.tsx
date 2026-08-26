import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Waves, Wind, Hexagon, ArrowUp, ArrowDown } from 'lucide-react-native';
import { OceanMetric } from '../../../domain/models/types';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Sparkline } from '../common/Sparkline';

interface ConditionMetricCardProps {
  metric: OceanMetric;
}

export const ConditionMetricCard: React.FC<ConditionMetricCardProps> = ({ metric }) => {
  const isEmerald = metric.colorMode === 'emerald' || metric.id === 'chlorophyll';
  const isSeaTemp = metric.id === 'sea_temp';

  const accentColor = isEmerald ? '#00e676' : '#00e5ff';
  const statusColor = isSeaTemp ? '#00e5ff' : isEmerald ? '#00e676' : '#00e676';

  const renderIcon = () => {
    const iconSize = 16;
    const iconColor = '#8da2be';

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
      {/* Background Micro Ocean Wave Sparkline */}
      <View style={styles.sparklineContainer}>
        <Sparkline
          data={metric.sparkline}
          width={160}
          height={38}
          color={accentColor}
        />
      </View>

      {/* Top Header: Icon + Metric Name */}
      <View style={styles.headerRow}>
        {renderIcon()}
        <Text style={styles.metricName}>{metric.name}</Text>
      </View>

      {/* Primary Metric Value */}
      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{metric.value}</Text>
        <Text style={styles.unitText}>{metric.unit}</Text>
      </View>

      {/* Bottom Trend & Status Indicator */}
      <View style={styles.statusRow}>
        {metric.id === 'sea_temp' ? (
          <ArrowUp size={12} color={statusColor} strokeWidth={2.5} style={styles.trendIcon} />
        ) : metric.id === 'wind_speed' ? (
          <ArrowDown size={12} color={statusColor} strokeWidth={2.5} style={styles.trendIcon} />
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
    backgroundColor: 'rgba(8, 20, 36, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 114,
    justifyContent: 'space-between',
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    left: -5,
    opacity: 0.75,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
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
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    lineHeight: 24,
    color: '#ffffff',
    letterSpacing: -0.2,
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
    gap: 5,
    zIndex: 2,
  },
  trendIcon: {
    marginRight: -1,
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

