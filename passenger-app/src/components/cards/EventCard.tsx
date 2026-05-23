// passenger-app/src/components/cards/EventCard.tsx
// ============================================================
// EVENT CARD — Nightlife-oriented card with glow effects
// ============================================================

import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { IslandEvent } from '../../types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const CATEGORY_CONFIG = {
  dj_night: { emoji: '🎧', label: 'DJ Night', gradient: ['#0E7490', '#1a1a2e'] as const },
  karaoke: { emoji: '🎤', label: 'Karaoke', gradient: ['#7B2D8B', '#0E7490'] as const },
  pool_party: { emoji: '🏊', label: 'Pool Party', gradient: ['#1CC7C1', '#2F855A'] as const },
  beach_event: { emoji: '🏖️', label: 'Beach Event', gradient: ['#FF7A59', '#FFB347'] as const },
  island_special: { emoji: '🌴', label: 'Island Special', gradient: ['#FF7A59', '#0E7490'] as const },
};

interface EventCardProps {
  event: IslandEvent;
  onRideThere: () => void;
}

export function EventCard({ event, onRideThere }: EventCardProps) {
  const config = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.island_special;
  const timeStr = format(new Date(event.startTime), 'h:mm a');
  const dateStr = format(new Date(event.startTime), 'EEE, MMM d');

  return (
    <View style={[styles.card, event.isFeatured && styles.cardFeatured, Shadows.lg]}>
      {/* Background gradient (placeholder for image) */}
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageBg}
      >
        <Text style={styles.categoryEmoji}>{config.emoji}</Text>
        {event.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Featured</Text>
          </View>
        )}
        {/* Category badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{config.label}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{event.titleEn}</Text>

        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaEmoji}>📍</Text>
            <Text style={styles.metaText} numberOfLines={1}>{event.venue.nameEn}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaEmoji}>🕐</Text>
            <Text style={styles.metaText}>{dateStr} · {timeStr}</Text>
          </View>
        </View>

        {event.descriptionEn && (
          <Text style={styles.description} numberOfLines={2}>
            {event.descriptionEn}
          </Text>
        )}

        {/* Action row */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rideBtn} onPress={onRideThere}>
            <LinearGradient
              colors={[Colors.lagoonTeal, Colors.deepOcean]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rideBtnGradient}
            >
              <Text style={styles.rideBtnText}>🏝 Ride There</Text>
            </LinearGradient>
          </TouchableOpacity>

          {event.price !== undefined && (
            <View style={styles.priceTag}>
              <Text style={styles.priceCurrency}>MVR</Text>
              <Text style={styles.priceAmount}>{event.price}</Text>
            </View>
          )}
          {event.price === undefined && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>Free Entry</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    overflow: 'hidden',
  },
  cardFeatured: {
    borderWidth: 1.5,
    borderColor: Colors.lagoonTeal,
  },
  imageBg: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryEmoji: {
    fontSize: 56,
    opacity: 0.6,
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  featuredText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
    color: '#FFD700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  categoryText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.base,
  },
  title: {
    fontFamily: 'Sora-Bold',
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  meta: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaEmoji: { fontSize: 13 },
  metaText: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  description: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  rideBtn: {
    flex: 1,
    borderRadius: Radii.button,
    overflow: 'hidden',
  },
  rideBtnGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  rideBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  priceTag: {
    alignItems: 'center',
  },
  priceCurrency: {
    fontFamily: 'Nunito',
    fontSize: 10,
    color: Colors.textTertiary,
  },
  priceAmount: {
    fontFamily: 'Sora-Bold',
    fontSize: Typography.sizes.xl,
    color: Colors.textPrimary,
  },
  freeBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
  },
  freeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: Typography.sizes.sm,
    color: Colors.palmGreen,
  },
});
