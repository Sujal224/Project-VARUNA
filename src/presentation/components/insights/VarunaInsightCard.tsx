import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowRight, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { VarunaInsight } from '../../../domain/models/types';
import { Colors } from '../../../theme/colors';
import { ConfidenceRing } from '../common/ConfidenceRing';

interface VarunaInsightCardProps {
  insight: VarunaInsight;
  onViewPfzMap?: () => void;
  onExplain?: () => void;
}

export const VarunaInsightCard: React.FC<VarunaInsightCardProps> = ({
  insight,
  onViewPfzMap,
  onExplain,
}) => {
  const handlePfzPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewPfzMap?.();
  };

  const handleExplainPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onExplain?.();
  };

  return (
    <View style={styles.container}>
      {/* Ambient Blue/Indigo Glow in Top Corner */}
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.18)', 'rgba(0, 229, 255, 0.06)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.8 }}
        style={styles.ambientGlow}
      />

      <View style={styles.contentRow}>
        {/* Left Side: Insight Text & Actions */}
        <View style={styles.textSection}>
          {/* Header Badge */}
          <View style={styles.badgeRow}>
            <Sparkles size={16} color="#38bdf8" />
            <Text style={styles.badgeTitle}>VARUNA Insight</Text>
            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>{insight.timestamp || 'Just now'}</Text>
            </View>
          </View>

          {/* Headline Recommendation */}
          <Text style={styles.headlineText}>{insight.headline}</Text>

          {/* Supporting Rationale */}
          <Text style={styles.explanationText}>{insight.explanation}</Text>

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePfzPress}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>View PFZ Map</Text>
              <ArrowRight size={14} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleExplainPress}
              style={styles.secondaryButton}
            >
              <Star size={12} color="#38bdf8" fill="#38bdf8" />
              <Text style={styles.secondaryButtonText}>Why this recommendation?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: Confidence Ring */}
        <View style={styles.ringSection}>
          <ConfidenceRing percent={insight.confidencePercent} size={92} strokeWidth={6} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(8, 20, 36, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 220,
    height: 180,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  textSection: {
    flex: 1,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: '#ffffff',
  },
  timeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    marginLeft: 2,
  },
  timeTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#94a3b8',
  },
  headlineText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: '#ffffff',
  },
  explanationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 15,
    color: '#8da2be',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
    color: '#cbd5e1',
  },
  ringSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
});

