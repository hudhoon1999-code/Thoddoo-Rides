import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { COLLECTIONS } from '../../../../shared/firebase/config';

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

interface RideHistoryItem {
  id: string;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  status: string;
  driverName: string;
  completedAt: any;
  createdAt: any;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: COLORS.green, bg: '#F0FFF4' },
  cancelled: { label: 'Cancelled', color: COLORS.coral, bg: '#FFF5F5' },
  in_progress: { label: 'In Progress', color: COLORS.teal, bg: '#F0FFFE' },
};

const VEHICLE_EMOJI: Record<string, string> = {
  motorcycle: '🛵',
  buggy_6: '🚐',
  buggy_12: '🚌',
  buggy: '🚐',
};

export default function RideHistoryScreen() {
  const router = useRouter();
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection(COLLECTIONS.RIDES)
      .where('passengerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snap) => {
        const items: RideHistoryItem[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setRides(items);
        setIsLoading(false);
      });

    return unsubscribe;
  }, []);

  const formatDate = (ts: any): string => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalSpent = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.fare || 0), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{rides.filter(r => r.status === 'completed').length}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={[styles.statCard, { borderColor: COLORS.teal }]}>
          <Text style={[styles.statValue, { color: COLORS.teal }]}>
            MVR {totalSpent.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: COLORS.coral }]}>
            {rides.filter(r => r.status === 'cancelled').length}
          </Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.teal} />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏝</Text>
          <Text style={styles.emptyTitle}>No rides yet</Text>
          <Text style={styles.emptySubtitle}>
            Your ride history will appear here
          </Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.bookBtnLabel}>Book Your First Ride</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {rides.map((ride) => {
            const statusCfg = STATUS_CONFIG[ride.status] || STATUS_CONFIG.completed;
            const emoji = VEHICLE_EMOJI[ride.vehicleType] || '🚐';

            return (
              <View key={ride.id} style={styles.rideCard}>
                {/* Top row */}
                <View style={styles.rideTopRow}>
                  <View style={styles.vehicleTag}>
                    <Text style={styles.vehicleEmoji}>{emoji}</Text>
                    <Text style={styles.vehicleLabel}>
                      {ride.vehicleType === 'motorcycle'
                        ? 'Motorcycle'
                        : ride.vehicleType.replace('_', '-seat Buggy ')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusCfg.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusCfg.color }]}
                    >
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                {/* Route */}
                <View style={styles.routeSection}>
                  <View style={styles.routeRow}>
                    <View style={styles.routeDot} />
                    <Text style={styles.routeAddr} numberOfLines={1}>
                      {ride.pickupAddress}
                    </Text>
                  </View>
                  <View style={styles.routeConnector} />
                  <View style={styles.routeRow}>
                    <View style={[styles.routeDot, styles.routeDotDest]} />
                    <Text style={styles.routeAddr} numberOfLines={1}>
                      {ride.dropoffAddress}
                    </Text>
                  </View>
                </View>

                {/* Bottom row */}
                <View style={styles.rideBottomRow}>
                  <View>
                    {ride.driverName ? (
                      <Text style={styles.driverName}>
                        👤 {ride.driverName}
                      </Text>
                    ) : null}
                    <Text style={styles.rideDate}>{formatDate(ride.createdAt)}</Text>
                  </View>
                  <Text style={styles.rideFare}>
                    MVR {(ride.fare || 0).toFixed(0)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: COLORS.dark,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  bookBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  rideTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleEmoji: {
    fontSize: 18,
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  routeSection: {
    marginBottom: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.teal,
  },
  routeDotDest: {
    backgroundColor: COLORS.coral,
  },
  routeConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 3,
  },
  routeAddr: {
    flex: 1,
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '500',
  },
  rideBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  driverName: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  rideDate: {
    fontSize: 11,
    color: COLORS.gray,
  },
  rideFare: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ocean,
  },
});
