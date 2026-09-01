import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Compass,
  Ship,
  Globe,
  Anchor,
  Crosshair,
  Plus,
  Minus,
} from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';

export type MapControlTab = 'layers' | 'vessels' | 'heatmap' | 'more';

interface MapFloatingControlsProps {
  activeTab: MapControlTab;
  onSelectTab: (tab: MapControlTab) => void;
  onLocateMe: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MapFloatingControls: React.FC<MapFloatingControlsProps> = ({
  activeTab,
  onSelectTab,
  onLocateMe,
  onZoomIn,
  onZoomOut,
}) => {
  const handleTabPress = (tab: MapControlTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTab(tab);
  };

  const handleLocatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLocateMe();
  };

  const handleZoomPress = (direction: 'in' | 'out') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (direction === 'in') onZoomIn();
    else onZoomOut();
  };

  return (
    <View style={styles.controlsLayer} pointerEvents="box-none">
      {/* 1. Left Vertical Floating Control Bar */}
      <View style={styles.leftControlColumn}>
        {/* Tab 1: Nautical Basemap */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('layers')}
          style={[
            styles.controlButton,
            activeTab === 'layers' && styles.controlButtonActive,
          ]}
        >
          {activeTab === 'layers' && <View style={styles.activeDotBadge} />}
          <Compass
            size={18}
            color={activeTab === 'layers' ? '#00e5ff' : '#8da2be'}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.controlLabel,
              activeTab === 'layers' && styles.controlLabelActive,
            ]}
          >
            Nautical
          </Text>
        </TouchableOpacity>

        {/* Tab 2: AIS Fleet Radar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('vessels')}
          style={[
            styles.controlButton,
            activeTab === 'vessels' && styles.controlButtonActive,
          ]}
        >
          {activeTab === 'vessels' && <View style={styles.activeDotBadge} />}
          <Ship
            size={18}
            color={activeTab === 'vessels' ? '#00e5ff' : '#8da2be'}
            strokeWidth={1.8}
          />
          <Text
            style={[
              styles.controlLabel,
              activeTab === 'vessels' && styles.controlLabelActive,
            ]}
          >
            AIS Fleet
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Satellite Imagery */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('heatmap')}
          style={[
            styles.controlButton,
            activeTab === 'heatmap' && styles.controlButtonActive,
          ]}
        >
          {activeTab === 'heatmap' && <View style={styles.activeDotBadge} />}
          <Globe
            size={18}
            color={activeTab === 'heatmap' ? '#00e5ff' : '#8da2be'}
            strokeWidth={1.8}
          />
          <Text
            style={[
              styles.controlLabel,
              activeTab === 'heatmap' && styles.controlLabelActive,
            ]}
          >
            Satellite
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Seamarks & Hazards */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleTabPress('more')}
          style={[
            styles.controlButton,
            activeTab === 'more' && styles.controlButtonActive,
          ]}
        >
          {activeTab === 'more' && <View style={styles.activeDotBadge} />}
          <Anchor
            size={18}
            color={activeTab === 'more' ? '#00e5ff' : '#8da2be'}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.controlLabel,
              activeTab === 'more' && styles.controlLabelActive,
            ]}
          >
            Seamarks
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Right Floating Zoom & Locate Controls */}
      <View style={styles.rightControlColumn}>
        {/* Locate Me Round Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLocatePress}
          style={styles.locateButton}
        >
          <Crosshair size={19} color="#e2edfd" strokeWidth={1.8} />
        </TouchableOpacity>

        {/* Zoom In & Zoom Out Stacked Pill */}
        <View style={styles.zoomPill}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleZoomPress('in')}
            style={styles.zoomButtonHalf}
          >
            <Plus size={19} color="#e2edfd" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.zoomDivider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleZoomPress('out')}
            style={styles.zoomButtonHalf}
          >
            <Minus size={19} color="#e2edfd" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsLayer: {
    position: 'absolute',
    top: 155,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 40,
    pointerEvents: 'box-none',
  },
  leftControlColumn: {
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(8, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(5, 28, 48, 0.95)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    borderTopColor: 'rgba(0, 229, 255, 0.65)',
    shadowColor: '#00e5ff',
    shadowOpacity: 0.25,
  },
  activeDotBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
  controlLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8.5,
    color: '#8da2be',
  },
  controlLabelActive: {
    color: '#00e5ff',
    fontFamily: 'Inter_600SemiBold',
  },
  rightControlColumn: {
    gap: 12,
    alignItems: 'center',
    marginTop: 65,
  },
  locateButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(8, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomPill: {
    width: 42,
    height: 80,
    borderRadius: 21,
    backgroundColor: 'rgba(8, 20, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomButtonHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
});
