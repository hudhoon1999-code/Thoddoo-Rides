import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { tokens } from '../../src/theme/tokens';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const CATEGORIES = ['All', 'Water', 'Nightlife', 'Wellness', 'Tours'];

const ACTIVITIES = [
  {
    id: '1', title: 'Pool Day Access', category: 'Water',
    venue: 'Sky Blue Resort', time: 'Daily 9AM–6PM',
    price: 'MVR 150', emoji: '🏊', color: ['#1CC7C1', '#0E7490'] as [string, string],
    description: 'Full day access to the resort's infinity pool with ocean views.',
    tag: 'Popular',
  },
  {
    id: '2', title: 'Aqua Zumba', category: 'Wellness',
    venue: 'Tropical Beach Club', time: 'Tue & Thu 5PM',
    price: 'MVR 100', emoji: '💃', color: ['#FF7A59', '#E63946'] as [string, string],
    description: 'High-energy dance fitness in the water. All levels welcome.',
    tag: 'New',
  },
  {
    id: '3', title: 'Night Snorkeling', category: 'Water',
    venue: 'Main Beach Jetty', time: 'Nightly 8PM',
    price: 'MVR 200', emoji: '🤿', color: ['#0E7490', '#023E8A'] as [string, string],
    description: 'Discover bioluminescent plankton and night reef life.',
    tag: null,
  },
  {
    id: '4', title: 'Island Buggy Tour', category: 'Tours',
    venue: 'Meets at Jetty', time: 'Daily 7AM & 4PM',
    price: 'MVR 180', emoji: '🚐', color: ['#2F855A', '#276749'] as [string, string],
    description: 'Full island loop with local guide. Farm visits included.',
    tag: 'Bestseller',
  },
  {
    id: '5', title: 'Karaoke Night', category: 'Nightlife',
    venue: 'Thilana Lounge', time: 'Fri & Sat 9PM',
    price: 'Free entry', emoji: '🎤', color: ['#805AD5', '#553C9A'] as [string, string],
    description: 'Sing your heart out with English and Russian song packs.',
    tag: 'Tonight',
  },
  {
    id: '6', title: 'Sunset Kayaking', category: 'Water',
    venue: 'Tourist Beach', time: 'Daily 5:30PM',
    price: 'MVR 120', emoji: '🛶', color: ['#FF7A59', '#F6AD55'] as [string, string],
    description: 'Paddle around the island as the sky turns golden.',
    tag: null,
  },
  {
    id: '7', title: 'Beach Yoga', category: 'Wellness',
    venue: 'Main Beach', time: 'Daily 7AM',
    price: 'Free', emoji: '🧘', color: ['#2F855A', '#1CC7C1'] as [string, string],
    description: 'Morning yoga on the sand with ocean sound meditation.',
    tag: 'Free',
  },
  {
    id: '8', title: 'DJ Night', category: 'Nightlife',
    venue: 'Sky Blue Resort', time: 'Sat 10PM',
    price: 'MVR 50', emoji: '🎧', color: ['#1A0533', '#6B21A8'] as [string, string],
    description: 'International DJ set with tropical cocktails.',
    tag: 'Hot',
  },
];

export default function ActivitiesScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? ACTIVITIES
    : ACTIVITIES.filter((a) => a.category === activeCategory);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activities</Text>
        <Text style={styles.headerSub}>Things to do on Thoddoo</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.filterLabel, activeCategory === cat && styles.filterLabelActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.88}
            onPress={() => {}}
          >
            <LinearGradient
              colors={item.color}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              {/* Tag */}
              {item.tag && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              )}

              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardVenue}>{item.venue}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </LinearGradient>

            {/* Bottom strip */}
            <View style={styles.cardBottom}>
              <Text style={styles.cardPrice}>{item.price}</Text>
              <TouchableOpacity
                style={styles.rideBtn}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.rideBtnText}>Ride →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8F4EC' },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: tokens.colors.textPrimary },
  headerSub:   { fontSize: 14, color: tokens.colors.textSecondary, marginTop: 2 },

  filterRow:   { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  filterChip:  {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: tokens.colors.primary, borderColor: tokens.colors.primary },
  filterLabel:      { fontSize: 13, fontWeight: '600', color: tokens.colors.textSecondary },
  filterLabelActive: { color: '#fff' },

  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  row:  { justifyContent: 'space-between', marginBottom: 12 },

  card: {
    width: CARD_W, borderRadius: 18, overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardGradient: { padding: 16, paddingBottom: 20, minHeight: 160 },
  tag: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  emoji:     { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#fff', lineHeight: 18, marginBottom: 4 },
  cardVenue: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  cardTime:  { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  cardBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#fff',
  },
  cardPrice: { fontSize: 13, fontWeight: '700', color: tokens.colors.textPrimary },
  rideBtn:   {
    backgroundColor: tokens.colors.primary,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
  },
  rideBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
