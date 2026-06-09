// passenger-app/app/tracking/[rideId].tsx
// RIDE TRACKING SCREEN — Real-time driver location from Firestore + OSM map.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Linking, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../src/theme/tokens';
import ThoddooMapView from '../../src/components/map/ThoddooMapView';
import {
  subscribeToDriverLocation,
  getDriverProfile,
  type LiveDriver,
} from '../../src/services/driverTrackingService';
import { GeoPoint } from '../../../shared/types';
import { HOTELS, RESTAURANTS } from '../../../shared/constants/thoddoo-map-data';
import { getRoute, formatDuration, type RouteResult } from '../../src/services/routingService';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.52;

const PROMO_EVENTS = [
  { id: '1', title: 'Live DJ Tonight', venue: 'Tropical Beach Club', emoji: '🎧' },
  { id: '2', title: 'Aqua Zumba', venue: 'Sky Blue Resort', time: '11:00 AM', emoji: '🏊' },
];

// Demo pickup/dropoff from real GPS data — replaced by actual Firestore ride doc in production.
const DEMO_PICKUP:  GeoPoint = { latitude: 4.4393688, longitude: 72.9608828 }; // Manta Stay area
const DEMO_DROPOFF: GeoPoint = { latitude: 4.4367485, longitude: 72.9619019 }; // Mango House area

export default function TrackingScreen() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();

  const [driver, setDriver] = useState<LiveDriver | null>(null);
  const [driverLocation, setDriverLocation] = useState<GeoPoint | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [rideStatus, setRideStatus] = useState<'arriving' | 'arrived' | 'in_progress'>('arriving');

  const driverIdRef = useRef<string | null>(null);

  // ── Load driver profile from Firestore ────────────────────
  useEffect(() => {
    // In production, fetch the ride document to get the driverId.
    // For now we demo with the first available driver ID from rideId context.
    const demoDriverId = rideId ?? 'demo-driver';
    driverIdRef.current = demoDriverId;

    getDriverProfile(demoDriverId).then((profile) => {
      if (profile) {
        setDriver(profile);
        setDriverLocation(profile.location);
      } else {
        // Fallback demo driver
        setDriver({
          id: 'demo',
          name: 'Jamaal',
          driverCode: 'THD-4022',
          vehicleType: 'buggy_6',
          rating: 4.8,
          location: { latitude: 4.1620, longitude: 72.9945 },
          status: 'available',
        });
        setDriverLocation({ latitude: 4.1620, longitude: 72.9945 });
      }
    });
  }, [rideId]);

  // ── Real-time driver location ──────────────────────────────
  useEffect(() => {
    const id = driverIdRef.current;
    if (!id) return;
    const unsub = subscribeToDriverLocation(
      id,
      (loc) => setDriverLocation(loc),
      (err) => console.warn('Driver location error:', err),
    );
    return unsub;
  }, [driverIdRef.current]);

  // ── Fetch route from driver → pickup ──────────────────────
  useEffect(() => {
    if (!driverLocation) return;
    let cancelled = false;
    getRoute(driverLocation, DEMO_PICKUP).then((route) => {
      if (!cancelled && route) setActiveRoute(route);
    });
    return () => { cancelled = true; };
  }, [driverLocation]);

  const handleCall = useCallback(() => {
    Linking.openURL(`tel:+960XXXXXXX`);
  }, []);

  const handleWhatsApp = useCallback(() => {
    Linking.openURL(`https://wa.me/960XXXXXXX?text=Hi, I'm your Thoddoo Rides passenger`);
  }, []);

  const eta = activeRoute ? formatDuration(activeRoute.durationMin) : '—';

  return (
    <View style={styles.container}>
      {/* ── Full-screen map ── */}
      <View style={styles.mapContainer}>
        <ThoddooMapView
          pickup={DEMO_PICKUP}
          dropoff={DEMO_DROPOFF}
          driverLocation={driverLocation}
          activeRoute={activeRoute}
          showPOIs={false}
          showNearbyDrivers={false}
          showControls
          showRouteInfo={false}
          mapHeight={MAP_HEIGHT}
          style={{ borderRadius: 0 }}
        />
      </View>

      {/* ── Back button ── */}
      <SafeAreaView style={styles.backContainer} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <BlurView intensity={80} style={styles.backBlur}>
            <Text style={styles.backArrow}>←</Text>
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── ETA status pill ── */}
      <View style={styles.statusPill}>
        <LinearGradient
          colors={[Colors.lagoonTeal, Colors.deepOcean]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statusGradient}
        >
          <Text style={styles.statusEmoji}>🚐</Text>
          <Text style={styles.statusText}>Buggy is on the way</Text>
          <Text style={styles.statusEta}>· {eta}</Text>
        </LinearGradient>
      </View>

      {/* ── Bottom sheet ── */}
      <View style={styles.bottomSheet}>
        {/* Driver card */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {driver?.name?.charAt(0) ?? 'D'}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver?.name ?? 'Driver'}</Text>
            <View style={styles.driverMeta}>
              <Text style={styles.driverRating}>
                ⭐ {driver?.rating?.toFixed(1) ?? '5.0'}
              </Text>
              <Text style={styles.driverCode}>{driver?.driverCode ?? '—'}</Text>
            </View>
            <Text style={styles.vehicleType}>🚐 Buggy</Text>
          </View>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <LinearGradient
              colors={[Colors.lagoonTeal, Colors.deepOcean]}
              style={styles.actionBtnGradient}
            >
              <Text style={styles.actionBtnEmoji}>📞</Text>
              <Text style={styles.actionBtnText}>Call Driver</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp}>
            <LinearGradient colors={['#25D366', '#128C7E']} style={styles.actionBtnGradient}>
              <Text style={styles.actionBtnEmoji}>💬</Text>
              <Text style={styles.actionBtnText}>Chat Driver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Ride</Text>
        </TouchableOpacity>

        {/* Events promo */}
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
    position: 'absolute', top: 0, left: 0, right: 0,
    height: MAP_HEIGHT,
  },
  backContainer: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: {
    margin: Spacing.base,
    alignSelf: 'flex-start',
    borderRadius: 20, overflow: 'hidden',
  },
  backBlur: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
  },
  backArrow: { fontSize: 20, color: Colors.textPrimary, fontWeight: '600' },

  statusPill: {
    position: 'absolute',
    top: '28%', left: Spacing.base, right: Spacing.base,
    borderRadius: Radii.pill, overflow: 'hidden',
    ...Shadows.lg,
  },
  statusGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
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
    top: MAP_HEIGHT * 0.88,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radii['3xl'],
    borderTopRightRadius: Radii['3xl'],
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    ...Shadows.xl,
  },

  driverCard: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.base, gap: Spacing.md,
  },
  driverAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.lagoonTeal,
    alignItems: 'center', justifyContent: 'center',
  },
  driverAvatarText: {
    fontFamily: 'Sora-Bold', fontSize: 22, color: Colors.white,
  },
  driverInfo: { flex: 1 },
  driverName: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  driverMeta: { flexDirection: 'row', gap: Spacing.md, marginTop: 2 },
  driverRating: {
    fontFamily: 'Nunito', fontSize: Typography.sizes.sm, color: Colors.textSecondary,
  },
  driverCode: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.sm, color: Colors.lagoonTeal,
  },
  vehicleType: {
    fontFamily: 'Nunito', fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2,
  },
  chevron: { fontSize: 24, color: Colors.textTertiary },

  actionButtons: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  actionBtn: { flex: 1, borderRadius: Radii.button, overflow: 'hidden' },
  actionBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
  },
  actionBtnEmoji: { fontSize: 16 },
  actionBtnText: {
    fontFamily: 'Nunito-Bold', fontSize: Typography.sizes.base, color: Colors.white,
  },

  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.sm, marginBottom: Spacing.base },
  cancelText: {
    fontFamily: 'Nunito-SemiBold', fontSize: Typography.sizes.base, color: Colors.error,
  },

  eventsSection: {
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.base,
  },
  eventsSectionTitle: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.base, color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  promoCard: {
    width: width * 0.55, borderRadius: Radii.lg, overflow: 'hidden', marginRight: Spacing.md,
  },
  promoGradient: { padding: Spacing.md },
  promoEmoji: { fontSize: 28, marginBottom: 4 },
  promoTitle: {
    fontFamily: 'Sora-Bold', fontSize: Typography.sizes.base, color: Colors.white,
  },
  promoVenue: {
    fontFamily: 'Nunito', fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: Spacing.sm,
  },
  promoRideBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  promoRideBtnText: { fontFamily: 'Nunito-Bold', fontSize: 11, color: Colors.white },
});
