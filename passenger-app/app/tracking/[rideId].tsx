// passenger-app/app/tracking/[rideId].tsx
// ============================================================
// RIDE TRACKING SCREEN — Live driver tracking + event promo
// ============================================================

import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Linking, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring,
} from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../src/theme/tokens';

const { width, height } = Dimensions.get('window');

// Placeholder driver data (replace with Firestore realtime listener)
const MOCK_DRIVER = {
  name: 'Jamaal',
  driverCode: 'THD-4022',
  rating: 4.8,
  ratingCount: 1222,
  phone: '+9609XXXXXX',
  whatsapp: '+9609XXXXXX',
  vehicleType: 'Buggy',
  eta: '3 min',
  status: 'arriving', // arriving | arrived | in_progress
};

const PROMO_EVENTS = [
  { id: '1', title: 'Live DJ Tonight', venue: 'Tropical Beach Club', emoji: '🎧' },
  { id: '2', title: 'Aqua Zumba', venue: 'Sky Blue Resort', time: '11:00 AM Tomorrow', emoji: '🏊' },
];

export default function TrackingScreen() {
  const { rideId } = useLocalSearchParams();
  const pulseScale = useSharedValue(1);

  // Pulse animation for driver location indicator
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const handleCallDriver = () => Linking.openURL(`tel:${MOCK_DRIVER.phone}`);
  const handleWhatsAppDriver = () =>
    Linking.openURL(`https://wa.me/${MOCK_DRIVER.whatsapp}?text=Hi, I'm your Thoddoo Rides passenger`);

  return (
    <View style={styles.container}>
      {/* Map placeholder (replace with MapView) */}
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#B2DFDB', '#80CBC4', '#4DB6AC']}
          style={styles.mapPlaceholder}
        >
          {/* Island road lines would be drawn here with SVG */}
          <Text style={styles.mapPlaceholderText}>🗺 Live Map</Text>
          <Text style={styles.mapSubtext}>Thoddoo Island</Text>

          {/* Pulsing driver location */}
          <View style={styles.driverPinContainer}>
            <Animated.View style={[styles.driverPulse, pulseStyle]} />
            <View style={styles.driverPin}>
              <Text style={styles.driverPinEmoji}>🚐</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Back button */}
      <SafeAreaView style={styles.backContainer} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BlurView intensity={80} style={styles.backBlur}>
            <Text style={styles.backArrow}>←</Text>
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Status pill */}
      <View style={styles.statusPill}>
        <LinearGradient
          colors={[Colors.lagoonTeal, Colors.deepOcean]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statusGradient}
        >
          <Text style={styles.statusEmoji}>🚐</Text>
          <Text style={styles.statusText}>Buggy is on the way</Text>
          <Text style={styles.statusEta}>· {MOCK_DRIVER.eta}</Text>
        </LinearGradient>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        {/* Driver info */}
        <View style={styles.driverCard}>
          {/* Avatar */}
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {MOCK_DRIVER.name.charAt(0)}
            </Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{MOCK_DRIVER.name}</Text>
            <View style={styles.driverMeta}>
              <Text style={styles.driverRating}>
                ⭐ {MOCK_DRIVER.rating} ({MOCK_DRIVER.ratingCount})
              </Text>
              <Text style={styles.driverCode}>{MOCK_DRIVER.driverCode}</Text>
            </View>
            <Text style={styles.vehicleType}>🚐 {MOCK_DRIVER.vehicleType}</Text>
          </View>

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCallDriver}>
            <LinearGradient
              colors={[Colors.lagoonTeal, Colors.deepOcean]}
              style={styles.actionBtnGradient}
            >
              <Text style={styles.actionBtnEmoji}>📞</Text>
              <Text style={styles.actionBtnText}>Call Driver</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsAppDriver}>
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              style={styles.actionBtnGradient}
            >
              <Text style={styles.actionBtnEmoji}>💬</Text>
              <Text style={styles.actionBtnText}>Chat Driver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Ride</Text>
        </TouchableOpacity>

        {/* What's happening today */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsSectionTitle}>What's happening today? 🎉</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PROMO_EVENTS.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.promoCard}
                onPress={() => router.push('/(tabs)/events')}
              >
                <LinearGradient
                  colors={['#0E7490', '#1a1a2e']}
                  style={styles.promoGradient}
                >
                  <Text style={styles.promoEmoji}>{event.emoji}</Text>
                  <Text style={styles.promoTitle}>{event.title}</Text>
                  <Text style={styles.promoVenue}>{event.venue}</Text>
                  <View style={styles.promoRideBtn}>
                    <Text style={styles.promoRideBtnText}>Ride There →</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.55,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontFamily: 'Sora-Bold',
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
  },
  mapSubtext: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  driverPinContainer: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(28,199,193,0.4)',
  },
  driverPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.tealGlow,
  },
  driverPinEmoji: { fontSize: 22 },

  backContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  backBtn: {
    margin: Spacing.base,
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  backBlur: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  backArrow: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusPill: {
    position: 'absolute',
    top: '30%',
    left: Spacing.base,
    right: Spacing.base,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  statusEmoji: { fontSize: 18 },
  statusText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  statusEta: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.8)',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii['3xl'],
    borderTopRightRadius: Radii['3xl'],
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    top: height * 0.48,
    ...Shadows.xl,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lagoonTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontFamily: 'Sora-Bold',
    fontSize: 22,
    color: Colors.white,
  },
  driverInfo: { flex: 1 },
  driverName: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  driverMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 2,
  },
  driverRating: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  driverCode: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.sm,
    color: Colors.lagoonTeal,
  },
  vehicleType: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: Radii.button,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  actionBtnEmoji: { fontSize: 16 },
  actionBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
  },
  cancelText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.error,
  },
  eventsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.base,
  },
  eventsSectionTitle: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  promoCard: {
    width: width * 0.55,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  promoGradient: {
    padding: Spacing.md,
  },
  promoEmoji: { fontSize: 28, marginBottom: 4 },
  promoTitle: {
    fontFamily: 'Sora-Bold',
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  promoVenue: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  promoRideBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  promoRideBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
    color: Colors.white,
  },
});
