import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRideStore } from '../../src/store/rideStore';
import { useLocationStore } from '../../src/store/locationStore';

const COLORS = {
  teal: '#1CC7C1',
  ocean: '#0E7490',
  coral: '#FF7A59',
  sand: '#F8F4EC',
  green: '#2F855A',
  white: '#FFFFFF',
  dark: '#0F172A',
  gray: '#64748B',
  lightGray: '#F1F5F9',
};

const VEHICLE_META: Record<
  string,
  { emoji: string; label: string; seats: string }
> = {
  motorcycle: { emoji: '🛵', label: 'Motorcycle', seats: '1 passenger' },
  buggy_6: { emoji: '🚐', label: 'Buggy (6-seat)', seats: 'Up to 6' },
  buggy_12: { emoji: '🚌', label: 'Buggy (12-seat)', seats: 'Up to 12' },
};

export default function BookingConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    vehicleType: string;
    fare: string;
    pickupAddress: string;
    dropoffAddress: string;
  }>();

  const { requestRide, isLoading } = useRideStore();
  const { currentLocation } = useLocationStore();

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const vehicleType = params.vehicleType || 'motorcycle';
  const fare = parseFloat(params.fare || '25');
  const meta = VEHICLE_META[vehicleType] || VEHICLE_META.motorcycle;

  const commission = Math.round(fare * 0.15 * 100) / 100;
  const totalDisplay = `MVR ${fare.toFixed(0)}`;

  const handleConfirm = async () => {
    if (!currentLocation) return;

    const rideId = await requestRide({
      vehicleType,
      pickupAddress: params.pickupAddress || 'Current Location',
      dropoffAddress: params.dropoffAddress || 'Destination',
      pickupCoords: currentLocation,
      dropoffCoords: currentLocation, // In real app, from dropoff selection
      fare,
    });

    if (rideId) {
      router.replace(`/tracking/${rideId}`);
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={() => router.back()}
        activeOpacity={1}
      />

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>Confirm Your Ride</Text>

          {/* Route summary */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddress} numberOfLines={2}>
                  {params.pickupAddress || 'Current Location'}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeRow}>
              <View style={[styles.routeDot, styles.routeDotDest]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeAddress} numberOfLines={2}>
                  {params.dropoffAddress || 'Destination'}
                </Text>
              </View>
            </View>
          </View>

          {/* Vehicle */}
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleEmoji}>{meta.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName}>{meta.label}</Text>
              <Text style={styles.vehicleSeats}>{meta.seats}</Text>
            </View>
            <Text style={styles.fareAmount}>{totalDisplay}</Text>
          </View>

          {/* Fare breakdown */}
          <View style={styles.fareCard}>
            <Text style={styles.fareCardTitle}>Fare Details</Text>
            <View style={styles.fareRow}>
              <Text style={styles.fareRowLabel}>Base fare</Text>
              <Text style={styles.fareRowValue}>MVR {fare.toFixed(0)}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareRowLabel}>Platform fee</Text>
              <Text style={styles.fareRowValue}>MVR 0</Text>
            </View>
            <View style={styles.fareDivider} />
            <View style={styles.fareRow}>
              <Text style={styles.fareTotalLabel}>Total</Text>
              <Text style={styles.fareTotalValue}>{totalDisplay}</Text>
            </View>
            <Text style={styles.cashNote}>💵 Cash payment to driver</Text>
          </View>

          {/* ETA hint */}
          <View style={styles.etaRow}>
            <Text style={styles.etaIcon}>⚡</Text>
            <Text style={styles.etaText}>
              Drivers typically arrive in{' '}
              <Text style={{ fontWeight: '700', color: COLORS.teal }}>
                3–8 minutes
              </Text>{' '}
              on Thoddoo Island
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            <Text style={styles.confirmLabel}>
              {isLoading ? 'Finding Driver...' : `Request ${meta.label}`}
            </Text>
            {!isLoading && <Text style={styles.confirmFare}>{totalDisplay}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 20,
  },
  routeCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.teal,
    marginTop: 4,
  },
  routeDotDest: {
    backgroundColor: COLORS.coral,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#CBD5E1',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 20,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFFE',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.teal + '40',
    gap: 12,
  },
  vehicleEmoji: {
    fontSize: 28,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  vehicleSeats: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 1,
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ocean,
  },
  fareCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  fareCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareRowLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  fareRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 10,
  },
  fareTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  fareTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ocean,
  },
  cashNote: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  etaIcon: {
    fontSize: 16,
  },
  etaText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 20,
  },
  confirmBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmLabel: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  confirmFare: {
    color: COLORS.white + 'CC',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelLabel: {
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '500',
  },
});
