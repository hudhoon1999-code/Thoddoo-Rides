// passenger-app/src/components/forms/LocationSearch.tsx
// Full-screen location picker with search + popular shortcuts.

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Modal, Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThoddooLocation } from '../../../../shared/types';
import {
  POPULAR_LOCATIONS, ALL_THODDOO_LOCATIONS, searchLocations,
} from '../../../../shared/constants/thoddoo-locations';
import { Colors, Spacing, Radii, Typography } from '../../theme/tokens';

const CATEGORY_ICONS: Record<string, string> = {
  guesthouse:    '🏠',
  ferry_jetty:   '⛴',
  beach:         '🏖',
  school:        '🏫',
  mosque:        '🕌',
  health:        '🏥',
  government:    '🏛',
  other:         '📍',
};

const CATEGORY_COLORS: Record<string, string> = {
  guesthouse:    '#FF7A59',
  ferry_jetty:   '#0E7490',
  beach:         '#F6AD55',
  school:        '#805AD5',
  mosque:        '#2F855A',
  health:        '#FC8181',
  government:    '#3182CE',
  other:         '#9CA3AF',
};

interface LocationSearchProps {
  type: 'pickup' | 'dropoff';
  onSelect: (location: ThoddooLocation) => void;
  onClose: () => void;
}

export function LocationSearch({ type, onSelect, onClose }: LocationSearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => searchLocations(query),
    [query],
  );

  const displayList = query.trim().length > 0 ? results : POPULAR_LOCATIONS;

  const renderItem = ({ item }: { item: ThoddooLocation }) => {
    const icon  = CATEGORY_ICONS[item.category]  ?? '📍';
    const color = CATEGORY_COLORS[item.category] ?? '#9CA3AF';
    return (
      <TouchableOpacity
        style={styles.locationItem}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.locationIcon, { backgroundColor: color + '22' }]}>
          <Text style={styles.locationIconText}>{icon}</Text>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.nameEn}</Text>
          {item.nameDv && <Text style={styles.locationSub}>{item.nameDv}</Text>}
        </View>
        <Text style={styles.locationArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {type === 'pickup' ? '📍 Choose Pickup' : '🏁 Choose Destination'}
          </Text>
        </View>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>
          {query.trim() ? `Results for "${query}"` : 'Popular Locations'}
        </Text>

        {/* Location list */}
        <FlatList
          data={displayList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No locations found</Text>
          }
        />
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,42,46,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.78,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii['3xl'],
    borderTopRightRadius: Radii['3xl'],
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  closeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  title: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    padding: 0,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.base,
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.md,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIconText: { fontSize: 18 },
  locationInfo: { flex: 1 },
  locationName: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  locationSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  locationArrow: {
    fontSize: 20,
    color: Colors.textTertiary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: Typography.sizes.base,
    marginTop: Spacing.xl,
  },
});
