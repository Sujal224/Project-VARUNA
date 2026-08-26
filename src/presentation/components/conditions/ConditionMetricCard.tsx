import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Thermometer, Waves, Wind, FlaskConical, ArrowUp, ArrowDown } from 'lucide-react-native';
import { OceanMetric } from '../../../domain/models/types';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Sparkline } from '../common/Sparkline';

interface ConditionMetricCardProps {
  metric: OceanMetric;
}

export const ConditionMetricCard: React.FC<ConditionMetricCardProps> = ({ metric }) => {
  const isEmerald = metric.colorMode === 'emerald';
  const accentColor = isEmerald ? Colors.success : Colors.primary;
  const statusColor = isEmerald ? Colors.success : Colors.primary;

  const renderIcon = () => {
    const iconSize = 16;
    const iconColor = isEmerald ? Colors.success : Colors.onSurfaceVariant;

    switch (metric.icon) {
      case 'thermometer':
        return <Thermometer size={iconSize} color={iconColor} />;
      case 'waves':
        return <Waves size={iconSize} color={iconColor} />;
      case 'wind':
        return <Wind size={iconSize} color={iconColor} />;
      case 'science':
        return <FlaskConical size={iconSize} color={iconColor} />;
      default:
        return <Waves size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View
      style={[
        styles.card,
        isEmerald && styles.cardEmeraldBorder,
      ]}
    >
      {/* Subtle bottom wave gradient backdrop */}
      <View style={styles.sparklineContainer}>
        <Sparkline
          data={metric.sparkline}
          width={130}
          height={28}
          color={accentColor}
        />
      </View>

      {/* Card Header: Icon + Metric Name */}
      <View style={styles.headerRow}>
        {renderIcon()}
        <Text style={styles.metricName}>{metric.name}</Text>
      </View>

      {/* Primary Telemetry Value */}
      <View style={styles.valueRow}>
        <Text style={styles.valueText}>{metric.value}</Text>
        <Text style={styles.unitText}>{metric.unit}</Text>
      </View>

      {/* Secondary Status & Trend Indicator */}
      <View style={styles.statusRow}>
        {metric.trend === 'up' && (
          <ArrowUp size={11} color={statusColor} style={styles.trendIcon} />
        )}
        {metric.trend === 'down' && (
          <ArrowDown size={11} color={statusColor} style={styles.trendIcon} />
        )}
        {metric.trend === 'stable' && (
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        )}
        <Text style={[styles.statusText, { color: statusColor }]}>
          {metric.status.replace(/^[↑↓]\s*/, '')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(28, 43, 60, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardEmeraldBorder: {
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(52, 211, 153, 0.5)',
  },
  sparklineContainer: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricName: {
    ...Typography.labelSm,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  valueText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 21,
    lineHeight: 25,
    color: '#ffffff',
  },
  unitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
    marginLeft: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
  },
});
