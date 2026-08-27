import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, CheckCircle2, Cpu, ShieldAlert, Waves } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { VarunaInsight } from '../../../domain/models/types';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { ConfidenceRing } from '../common/ConfidenceRing';

interface ExplainableAiModalProps {
  visible: boolean;
  insight: VarunaInsight;
  onClose: () => void;
}

export const ExplainableAiModal: React.FC<ExplainableAiModalProps> = ({
  visible,
  insight,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFillObject} />

        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Cpu size={20} color={Colors.primary} />
              <Text style={styles.headerTitle}>AI Decision Rationale</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Top Summary & Ring */}
            <View style={styles.topSummary}>
              <ConfidenceRing percent={insight.confidencePercent} size={90} strokeWidth={5} />
              <View style={styles.summaryTextContainer}>
                <Text style={styles.recommendationSummary}>
                  {insight.headline}
                </Text>
                <Text style={styles.confidenceSubtext}>
                  Synthesized across satellite bathymetry, SST, and meteorological buoys.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Contributing Factors */}
            <Text style={styles.sectionHeader}>Key Contributing Environmental Factors</Text>

            <View style={styles.factorsList}>
              {insight.factors.map((factor, index) => (
                <View key={index} style={styles.factorCard}>
                  <View style={styles.factorHeaderRow}>
                    <View style={styles.factorNameRow}>
                      <CheckCircle2 size={16} color={Colors.success} />
                      <Text style={styles.factorName}>{factor.name}</Text>
                    </View>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreText}>{factor.score}% match</Text>
                    </View>
                  </View>
                  <Text style={styles.factorDescription}>{factor.description}</Text>
                </View>
              ))}
            </View>

            {/* Safety & Operational Window */}
            <View style={styles.safetyBox}>
              <Waves size={16} color={Colors.primary} />
              <Text style={styles.safetyText}>
                Safety Margin: Swell and barometric metrics exceed standard nearshore safety margins by +34%.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Acknowledge & Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 7, 14, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#071524',
    borderWidth: 1,
    borderColor: 'rgba(138, 235, 255, 0.25)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
  topSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryTextContainer: {
    flex: 1,
    gap: 4,
  },
  recommendationSummary: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 19,
    color: '#ffffff',
  },
  confidenceSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 15,
    color: Colors.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  sectionHeader: {
    ...Typography.labelSm,
    color: Colors.primary,
    marginBottom: 12,
  },
  factorsList: {
    gap: 10,
  },
  factorCard: {
    backgroundColor: 'rgba(18, 33, 49, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  factorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  factorName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#ffffff',
  },
  scoreBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.success,
  },
  factorDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  safetyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: Colors.primary,
    flex: 1,
  },
  doneButton: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
});
