import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, ArrowRight, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { VarunaInsight } from '../../../domain/models/types';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
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
      {/* Radial soft background illumination */}
      <LinearGradient
        colors={['rgba(49, 49, 192, 0.15)', 'transparent']}
        style={styles.ambientGlow}
      />

      <View style={styles.contentRow}>
        {/* Left Side: Insight Text & Actions */}
        <View style={styles.textSection}>
          {/* Header Badge */}
          <View style={styles.badgeRow}>
            <Sparkles size={18} color={Colors.secondary} />
            <Text style={styles.badgeTitle}>VARUNA Insight</Text>
            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>{insight.timestamp}</Text>
            </View>
          </View>

          {/* Headline Recommendation */}
          <Text style={styles.headlineText}>{insight.headline}</Text>

          {/* Supporting Rationale */}
          <Text style={styles.explanationText}>{insight.explanation}</Text>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePfzPress}
              style={styles.primaryButtonWrapper}
            >
              <LinearGradient
                colors={['#3131c0', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>View PFZ Map</Text>
                <ArrowRight size={14} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleExplainPress}
              style={styles.secondaryButton}
            >
              <Star size={13} color={Colors.secondary} />
              <Text style={styles.secondaryButtonText}>Why this?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: Confidence Ring */}
        <View style={styles.ringSection}>
          <ConfidenceRing percent={insight.confidencePercent} size={96} strokeWidth={5} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  ambientGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
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
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 16,
    color: '#ffffff',
  },
  timeTag: {
    backgroundColor: 'rgba(18, 33, 49, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  timeTagText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    lineHeight: 11,
    color: Colors.onSurfaceVariant,
  },
  headlineText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    lineHeight: 21,
    color: '#ffffff',
  },
  explanationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: Colors.onSurfaceVariant,
    opacity: 0.85,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  primaryButtonWrapper: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
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
    backgroundColor: 'rgba(18, 33, 49, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  secondaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    color: Colors.onSurface,
  },
  ringSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
