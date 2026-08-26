/**
 * VARUNA Location Search & Port Selector Modal
 * Powered by Open-Meteo Geocoding, Indian Maritime Port Directory, and Live GPS Sync.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Search,
  X,
  MapPin,
  Anchor,
  Compass,
  Navigation,
  Check,
  Globe,
  Radio,
} from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';
import { LocationSearchResult } from '../../../domain/models/location';
import { mapRepository } from '../../../data/repositories/mapRepository';
import { Coordinates } from '../../../domain/models/mapIntelligence';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (coords: Coordinates, name: string, region?: string) => void;
  onResetToGps: () => void;
  currentCoords?: Coordinates;
  currentLocationName?: string;
  isCustomLocation?: boolean;
}

const PRESET_CHIPS = [
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, region: 'Bay of Bengal' },
  { name: 'Mumbai Port', lat: 18.9500, lon: 72.8500, region: 'Arabian Sea' },
  { name: 'Chennai Port', lat: 13.0827, lon: 80.2930, region: 'Coromandel Coast' },
  { name: 'Paradip Port', lat: 20.3167, lon: 86.6167, region: 'Bay of Bengal' },
  { name: 'Cochin Port', lat: 9.9667, lon: 76.2667, region: 'Laccadive Sea' },
  { name: 'Port Blair', lat: 11.6667, lon: 92.7500, region: 'Andaman Sea' },
];

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  onResetToGps,
  currentCoords,
  currentLocationName,
  isCustomLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Load initial port list when modal opens
  useEffect(() => {
    if (visible) {
      loadLocations('');
    } else {
      setQuery('');
    }
  }, [visible]);

  const loadLocations = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const data = await mapRepository.searchLocations(searchQuery, 10);
      setResults(data);
    } catch (err) {
      console.warn('[LocationSearchModal] search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      loadLocations(text);
    }, 250);
  };

  const handleSelect = (item: LocationSearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectLocation(
      { latitude: item.latitude, longitude: item.longitude },
      item.name,
      item.region || item.country || undefined
    );
    onClose();
  };

  const handlePresetSelect = (preset: (typeof PRESET_CHIPS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectLocation(
      { latitude: preset.lat, longitude: preset.lon },
      preset.name,
      preset.region
    );
    onClose();
  };

  const handleGpsReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onResetToGps();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouchArea} />
        </TouchableWithoutFeedback>

        <View style={styles.modalSheet}>
          {/* Handle Drag Bar */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Select Location</Text>
              <Text style={styles.headerSubtitle}>
                Search any port, city, or coordinates globally
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={18} color="#8da2be" />
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Search size={18} color="#00e5ff" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search port, city, or '17.38, 83.25'..."
              placeholderTextColor="#8da2be"
              value={query}
              onChangeText={handleQueryChange}
              autoFocus
              returnKeyType="search"
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#00e5ff" style={styles.clearButton} />
            ) : query.length > 0 ? (
              <TouchableOpacity
                onPress={() => handleQueryChange('')}
                style={styles.clearButton}
              >
                <X size={16} color="#8da2be" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Quick Preset Port Chips */}
          <View style={styles.presetSection}>
            <Text style={styles.presetLabel}>Major Ports & Basins</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={PRESET_CHIPS}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.presetList}
              renderItem={({ item }) => {
                const isSelected =
                  currentLocationName?.toLowerCase().includes(item.name.toLowerCase()) ||
                  (currentCoords &&
                    Math.abs(currentCoords.latitude - item.lat) < 0.05 &&
                    Math.abs(currentCoords.longitude - item.lon) < 0.05);

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePresetSelect(item)}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipSelected,
                    ]}
                  >
                    <Anchor
                      size={12}
                      color={isSelected ? '#00e5ff' : '#8da2be'}
                    />
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Device GPS Live Fix Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGpsReset}
            style={[
              styles.gpsOptionCard,
              !isCustomLocation && styles.gpsOptionCardActive,
            ]}
          >
            <View style={styles.gpsOptionLeft}>
              <View
                style={[
                  styles.gpsIconCircle,
                  !isCustomLocation && styles.gpsIconCircleActive,
                ]}
              >
                <Navigation
                  size={15}
                  color={!isCustomLocation ? '#00e5ff' : '#8da2be'}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </View>
              <View>
                <View style={styles.gpsTitleRow}>
                  <Text style={styles.gpsTitle}>Use Live Vessel GPS</Text>
                  {!isCustomLocation && (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.gpsSubtitle}>
                  Streams continuous real-time coordinates from onboard hardware
                </Text>
              </View>
            </View>
            {!isCustomLocation && <Check size={18} color="#00e5ff" />}
          </TouchableOpacity>

          {/* Search Results List */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeading}>
              {query ? 'Matching Locations' : 'Maritime Ports & Coastal Hubs'}
            </Text>

            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              renderItem={({ item }) => {
                const isSelected =
                  currentLocationName === item.name ||
                  (currentCoords &&
                    Math.abs(currentCoords.latitude - item.latitude) < 0.02 &&
                    Math.abs(currentCoords.longitude - item.longitude) < 0.02);

                return (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.resultCard,
                      isSelected && styles.resultCardSelected,
                    ]}
                  >
                    <View style={styles.resultLeft}>
                      <View
                        style={[
                          styles.resultIconBox,
                          item.is_marine_port && styles.resultIconBoxPort,
                        ]}
                      >
                        {item.is_marine_port ? (
                          <Anchor size={16} color="#00e5ff" />
                        ) : (
                          <Globe size={16} color="#38bdf8" />
                        )}
                      </View>
                      <View style={styles.resultTextGroup}>
                        <View style={styles.resultNameRow}>
                          <Text style={styles.resultName}>{item.name}</Text>
                          {item.is_marine_port && (
                            <View style={styles.portBadge}>
                              <Text style={styles.portBadgeText}>PORT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.resultRegion} numberOfLines={1}>
                          {item.region || item.country || 'Coastal Sector'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.resultRight}>
                      <Text style={styles.resultCoords}>
                        {item.formatted_coordinates}
                      </Text>
                      {isSelected && <Check size={16} color="#00e5ff" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.emptyContainer}>
                    <Compass size={32} color="rgba(141, 162, 190, 0.4)" />
                    <Text style={styles.emptyText}>No matching locations found</Text>
                    <Text style={styles.emptySubtext}>
                      Try searching city names or exact GPS like 17.38, 83.25
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 4, 10, 0.82)',
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#040d1a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8da2be',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 20, 38, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 24, 48, 0.92)',
    borderWidth: 1.2,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    color: '#ffffff',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
  },
  presetSection: {
    marginBottom: 12,
  },
  presetLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8da2be',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetList: {
    gap: 7,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8, 20, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  presetChipSelected: {
    backgroundColor: 'rgba(0, 229, 255, 0.14)',
    borderColor: '#00e5ff',
  },
  presetChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#8da2be',
  },
  presetChipTextSelected: {
    color: '#00e5ff',
    fontFamily: 'Inter_600SemiBold',
  },
  gpsOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 20, 38, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 11,
    marginBottom: 12,
  },
  gpsOptionCardActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderColor: 'rgba(0, 229, 255, 0.35)',
  },
  gpsOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  gpsIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(141, 162, 190, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsIconCircleActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
  },
  gpsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#ffffff',
  },
  activeTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    color: '#00e5ff',
    letterSpacing: 0.3,
  },
  gpsSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    color: '#8da2be',
    marginTop: 1,
  },
  resultsContainer: {
    flex: 1,
    maxHeight: 280,
  },
  resultsHeading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: '#8da2be',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsList: {
    gap: 8,
    paddingBottom: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 20, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 10,
  },
  resultCardSelected: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  resultIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconBoxPort: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
  resultTextGroup: {
    flex: 1,
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#ffffff',
  },
  portBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.18)',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  portBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 7.5,
    color: '#00e5ff',
    letterSpacing: 0.4,
  },
  resultRegion: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8da2be',
    marginTop: 1,
  },
  resultRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  resultCoords: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
    color: '#38bdf8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 6,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13.5,
    color: '#ffffff',
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#8da2be',
    textAlign: 'center',
    maxWidth: 240,
  },
});
