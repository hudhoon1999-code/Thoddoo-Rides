// passenger-app/app/(tabs)/home.tsx
// HOME SCREEN — Booking interface with live OSM map, routing, and driver tracking.

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../src/theme/tokens';
import { VehicleType } from '../../../shared/types';
import { HOME_SHORTCUTS, POPULAR_LOCATIONS } from '../../../shared/constants/thoddoo-locations';
import { useAuthStore } from '../../src/store/authStore';
import { useLocationStore } from '../../src/store/locationStore';
import { useMapStore } from '../../src/store/mapStore';
import { VehicleCard } from '../../src/components/cards/VehicleCard';
import ThoddooMapView from '../../src/components/map/ThoddooMapView';
import { LocationSearch } from '../../src/components/forms/LocationSearch';
import { getRoute } from '../../src/services/routingService';
import { subscribeToNearbyDrivers } from '../../src/services/driverTrackingService';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = Math.min(height * 0.38, 300);

const VEHICLES = [
  {
    type: VehicleType.BUGGY_6,
    label: 'Buggy',
    seats: '2–6 Seats',
    priceRange: 'MVR 30–50',
    eta: '3 min',
    emoji: '🚐',
    tagline: 'Comfortable',
  },
  {
    type: VehicleType.MOTORCYCLE,
    label: 'Motorcycle',
    seats: '1 Seat',
    priceRange: 'MVR 20–30',
    eta: '2 min',
    emoji: '🛵',
    tagline: 'Fast & Solo',
  },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { pickup, dropoff, setPickup, setDropoff } = useLocationStore();
  const {
    nearbyDrivers, activeRoute,
    setNearbyDrivers, setActiveRoute, setRouteFetching, isRouteFetching,
  } = useMapStore();

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(VehicleType.BUGGY_6);
  const [showSearch, setShowSearch] = useState<'pickup' | 'dropoff' | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  // Subscribe to nearby available drivers
  useEffect(() => {
    const unsub = subscribeToNearbyDrivers(setNearbyDrivers);
    return unsub;
  }, [setNearbyDrivers]);

  // Fetch route whenever pickup or dropoff changes
  useEffect(() => {
    if (!pickup || !dropoff) {
      setActiveRoute(null);
      return;
    }
    let cancelled = false;
    setRouteFetching(true);
    getRoute(
      { latitude: pickup.coordinates.latitude, longitude: pickup.coordinates.longitude },
      { latitude: dropoff.coordinates.latitude, longitude: dropoff.coordinates.longitude },
    ).then((route) => {
      if (!cancelled) {
        setActiveRoute(route);
        setRouteFetching(false);
      }
    });
    return () => { cancelled = true; };
  }, [pickup, dropoff, setActiveRoute, setRouteFetching]);

  const handleRequestRide = useCallback(() => {
    if (!pickup || !dropoff) return;
    router.push('/booking/confirm');
  }, [pickup, dropoff]);

  const pickupGeo = pickup
    ? { latitude: pickup.coordinates.latitude, longitude: pickup.coordinates.longitude }
    : null;
  const dropoffGeo = dropoff
    ? { latitude: dropoff.coordinates.latitude, longitude: dropoff.coordinates.longitude }
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1CC7C1', '#0E7490']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>{user?.name || 'Traveller'} 👋</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
              <Text style={styles.notifEmoji}>🔔</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Live Island Map ─────────────────────────── */}
        <View style={styles.mapCard}>
          <ThoddooMapView
            pickup={pickupGeo}
            dropoff={dropoffGeo}
            nearbyDrivers={nearbyDrivers}
            activeRoute={activeRoute}
            showPOIs
            showNearbyDrivers
            showControls
            showRouteInfo
            mapHeight={MAP_HEIGHT}
            style={styles.map}
          />
          {isRouteFetching && (
            <View style={styles.routeLoadingBadge}>
              <ActivityIndicator size="small" color={Colors.lagoonTeal} />
              <Text style={styles.routeLoadingText}>Finding route…</Text>
            </View>
          )}
          {/* Driver count badge */}
          {nearbyDrivers.length > 0 && (
            <View style={styles.driverCountBadge}>
              <Text style={styles.driverCountText}>
                🚐 {nearbyDrivers.length} driver{nearbyDrivers.length > 1 ? 's' : ''} nearby
              </Text>
            </View>
          )}
        </View>

        {/* ─── Location Card ───────────────────────────── */}
        <View style={[styles.locationCard, Shadows.lg]}>
          {/* Pickup row */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => setShowSearch('pickup')}
          >
            <View style={[styles.locationDot, { backgroundColor: Colors.palmGreen }]} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={[styles.locationValue, !pickup && styles.placeholder]}>
                {pickup?.nameEn || 'Choose pickup location'}
              </Text>
            </View>
            <Text style={styles.locationArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.locationDivider}>
            <View style={styles.dividerLine} />
            <TouchableOpacity
              style={styles.swapBtn}
              onPress={() => {
                if (pickup && dropoff) {
                  const temp = pickup;
                  setPickup(dropoff);
                  setDropoff(temp);
                }
              }}
            >
              <Text style={styles.swapEmoji}>⇅</Text>
            </TouchableOpacity>
          </View>

          {/* Dropoff row */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => setShowSearch('dropoff')}
          >
            <View style={[styles.locationDot, { backgroundColor: Colors.coralSunset }]} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Drop-off</Text>
              <Text style={[styles.locationValue, !dropoff && styles.placeholder]}>
                {dropoff?.nameEn || 'Choose destination'}
              </Text>
            </View>
            <Text style={styles.locationArrow}>›</Text>
          </TouchableOpacity>

          {/* Quick shortcuts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.shortcuts}
            contentContainerStyle={styles.shortcutsContent}
          >
            {HOME_SHORTCUTS.map((shortcut) => (
              <TouchableOpacity
                key={shortcut.id}
                style={styles.shortcutChip}
                onPress={() => {
                  const loc = POPULAR_LOCATIONS.find((l) => l.id === shortcut.id);
                  if (loc) setDropoff(loc);
                }}
              >
                <Text style={styles.shortcutEmoji}>{shortcut.icon}</Text>
                <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Vehicle Selection ────────────────────────── */}
        <Text style={styles.sectionTitle}>Choose Your Ride</Text>
        <View style={styles.vehicleGrid}>
          {VEHICLES.map((vehicle) => (
            <VehicleCard
              key={vehicle.type}
              vehicle={vehicle}
              isSelected={selectedVehicle === vehicle.type}
              onSelect={() => setSelectedVehicle(vehicle.type)}
            />
          ))}
        </View>

        {/* ─── Request Button ───────────────────────────── */}
        <TouchableOpacity
          style={[styles.requestBtn, (!pickup || !dropoff) && styles.requestBtnDisabled]}
          onPress={handleRequestRide}
          disabled={!pickup || !dropoff}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              pickup && dropoff
                ? [Colors.lagoonTeal, Colors.deepOcean]
                : ['#9CA3AF', '#6B7280']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.requestBtnGradient}
          >
            <Text style={styles.requestBtnText}>
              {pickup && dropoff ? '🏝 Request Ride' : 'Set Pickup & Drop-off'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Location Search Modal */}
      {showSearch && (
        <LocationSearch
          type={showSearch}
          onSelect={(location) => {
            if (showSearch === 'pickup') setPickup(location);
            else setDropoff(location);
            setShowSearch(null);
          }}
          onClose={() => setShowSearch(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radii['3xl'],
    borderBottomRightRadius: Radii['3xl'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontFamily: 'Sora-Bold',
    fontSize: Typography.sizes.xl,
    color: Colors.white,
  },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifEmoji: { fontSize: 20 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

  // Map
  mapCard: {
    borderRadius: Radii.card,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    ...Shadows.lg,
  },
  map: { borderRadius: Radii.card },
  routeLoadingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.glassBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  routeLoadingText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  driverCountBadge: {
    position: 'absolute',
    top: 12,
    right: 60,
    backgroundColor: Colors.glassBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    ...Shadows.sm,
  },
  driverCountText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Location card
  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.card,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  locationDot: { width: 12, height: 12, borderRadius: 6, marginRight: Spacing.md },
  locationTextContainer: { flex: 1 },
  locationLabel: {
    fontFamily: 'Nunito',
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  placeholder: { color: Colors.textTertiary },
  locationArrow: { fontSize: 20, color: Colors.textTertiary, marginLeft: Spacing.sm },
  locationDivider: { flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  dividerLine: {
    flex: 1, height: 1, backgroundColor: Colors.border, marginLeft: Spacing.xl,
  },
  swapBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  swapEmoji: { fontSize: 16, color: Colors.lagoonTeal, fontWeight: '700' },

  shortcuts: { marginTop: Spacing.md },
  shortcutsContent: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  shortcutChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.background, borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  shortcutEmoji: { fontSize: 14 },
  shortcutLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  sectionTitle: {
    fontFamily: 'Sora-SemiBold',
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  vehicleGrid: { gap: Spacing.md, marginBottom: Spacing.lg },

  requestBtn: {
    borderRadius: Radii.button, marginBottom: Spacing.xl,
    overflow: 'hidden', ...Shadows.tealGlow,
  },
  requestBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  requestBtnGradient: { paddingVertical: Spacing.base + 2, alignItems: 'center' },
  requestBtnText: {
    fontFamily: 'Sora-Bold', fontSize: Typography.sizes.lg,
    color: Colors.white, letterSpacing: 0.3,
  },
});
