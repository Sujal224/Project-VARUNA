import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  Fish,
  CloudSun,
  Waves,
  AlertTriangle,
  Compass,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';
import { TabType } from '../navigation/BottomNavBar';

interface QuickActionsRowProps {
  onSelectAction: (actionId: string, tab?: TabType) => void;
  onSeeAll?: () => void;
}

interface ActionItem {
  id: string;
  label: string;
  tab?: TabType;
  icon: React.ReactNode;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onSelectAction,
  onSeeAll,
}) => {
  const actions: ActionItem[] = [
    {
      id: 'pfz',
      label: 'Find PFZ',
      tab: 'map',
      icon: <Fish size={18} color="#38bdf8" />,
    },
    {
      id: 'weather',
      label: 'Check Weather',
      tab: 'home',
      icon: <CloudSun size={18} color="#38bdf8" />,
    },
    {
      id: 'tides',
      label: 'Tide & Currents',
      tab: 'home',
      icon: <Waves size={18} color="#38bdf8" />,
    },
    {
      id: 'alerts',
      label: 'Safety Alerts',
      tab: 'alerts',
      icon: <AlertTriangle size={18} color="#38bdf8" />,
    },
    {
      id: 'safe_route',
      label: 'Safe Route',
      tab: 'map',
      icon: <Compass size={18} color="#38bdf8" />,
    },
  ];

  const handlePress = (item: ActionItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectAction(item.id, item.tab);
  };

  const handleSeeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeeAll?.();
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSeeAll}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight size={13} color="#8da2be" />
        </TouchableOpacity>
      </View>

      {/* 5 Liquid Glass Tiles Horizontal Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsScroll}
      >
        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => handlePress(item)}
            style={styles.actionCard}
          >
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.actionLabel} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 18,
    color: '#ffffff',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 15,
    color: '#8da2be',
  },
  actionsScroll: {
    gap: 10,
  },
  actionCard: {
    width: 68,
    height: 82,
    backgroundColor: 'rgba(8, 20, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 12,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});
