// passenger-app/app/(tabs)/events.tsx
// ============================================================
// EVENTS TAB — Island nightlife & events
// ============================================================

import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../src/theme/tokens';
import { useEventsStore } from '../../src/store/eventsStore';
import { EventCard } from '../../src/components/cards/EventCard';
import { IslandEvent } from '../../src/types';

type Tab = 'today' | 'week' | 'upcoming';

const TABS: { key: Tab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'upcoming', label: 'Upcoming' },
];

// Placeholder events for UI development
const PLACEHOLDER_EVENTS: IslandEvent[] = [
  {
    id: '1',
    titleEn: 'DJ Night at Tropical Beach Club',
    titleRu: 'DJ-вечеринка',
    descriptionEn: 'Dance the night away with top island DJs. Free entry before 10 PM.',
    category: 'dj_night' as any,
    venue: { id: 'tropical-beach-club', nameEn: 'Tropical Beach Club', coordinates: { latitude: 4.1628, longitude: 72.9955 }, category: 'activity_venue' as any },
    imageUrl: '',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    isFeatured: true,
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date(),
  },
  {
    id: '2',
    titleEn: 'Pool Party — Sky Blue Resort',
    descriptionEn: 'Splash, relax and party at the coolest pool on Thoddoo. Includes complimentary mocktails.',
    category: 'pool_party' as any,
    venue: { id: 'sky-blue-resort', nameEn: 'Sky Blue Resort', coordinates: { latitude: 4.1620, longitude: 72.9945 }, category: 'resort' as any },
    imageUrl: '',
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    isFeatured: false,
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date(),
  },
  {
    id: '3',
    titleEn: 'Karaoke Night',
    titleRu: 'Ночь Karaoke',
    descriptionEn: 'Grab the mic at Thilana Lounge. All languages welcome!',
    category: 'karaoke' as any,
    venue: { id: 'thilana-lounge', nameEn: 'Thilana Lounge', coordinates: { latitude: 4.1615, longitude: 72.9938 }, category: 'activity_venue' as any },
    imageUrl: '',
    startTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    isFeatured: false,
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date(),
  },
];

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('today');

  const handleRideThere = (event: IslandEvent) => {
    // Pre-fill destination in location store then go to home
    router.push({
      pathname: '/(tabs)/home',
      params: { destinationId: event.venue.id, eventId: event.id },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0E7490', '#1a1a2e']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Events 🎉</Text>
            <Text style={styles.headerSubtitle}>What's happening on the island</Text>
          </View>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Events list */}
      <FlatList
        data={PLACEHOLDER_EVENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌴</Text>
            <Text style={styles.emptyText}>No events today</Text>
            <Text style={styles.emptySubtext}>Check back soon for island events!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onRideThere={() => handleRideThere(item)}
          />
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: Spacing.base,
    borderBottomLeftRadius: Radii['3xl'],
    borderBottomRightRadius: Radii['3xl'],
  },
  headerContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: 'Sora-Bold',
    fontSize: Typography.sizes['3xl'],
    color: Colors.white,
  },
  headerSubtitle: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radii.pill,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radii.pill - 3,
  },
  tabActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: Colors.deepOcean,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.base },
  emptyText: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
});
