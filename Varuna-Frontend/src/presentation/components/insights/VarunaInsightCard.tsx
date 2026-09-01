import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowRight, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from '../../../utils/haptics';
import { VarunaInsight } from '../../../domain/models/types';
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
      {/* Top-Edge Liquid Glass Specular Sheen Gradient */}
      <LinearGradient
        colors={['rgba(56, 189, 248, 0.14)', 'rgba(37, 99, 235, 0.06)', 'transparent']}
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
              <ArrowRight size={13} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleExplainPress}
              style={styles.secondaryButton}
            >
              <Star size={11} color="#38bdf8" fill="#38bdf8" />
              <Text style={styles.secondaryButtonText}>Why this recommendation?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: Confidence Ring */}
        <View style={styles.ringSection}>
          <ConfidenceRing percent={insight.confidencePercent} size={92} strokeWidth={6.5} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(7, 18, 38, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 240,
    height: 190,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
    fontSize: 14,
    lineHeight: 18,
    color: '#ffffff',
  },
  timeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    marginLeft: 2,
  },
  timeTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#8da2be',
  },
  headlineText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
  },
  explanationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
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
    gap: 5,
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9999,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    lineHeight: 14,
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 11,
    paddingVertical: 8,
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
    paddingLeft: 2,
  },
});
