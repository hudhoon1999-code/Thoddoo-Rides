import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDriverStore } from '../../src/store/driverStore';

const C = {
  teal: '#1CC7C1', ocean: '#0E7490', coral: '#FF7A59',
  sand: '#F8F4EC', dark: '#0F172A', gray: '#64748B', white: '#FFFFFF',
  green: '#2F855A', light: '#F1F5F9',
};

export default function DriverProfileScreen() {
  const router = useRouter();
  const { driver, status, earnings, reset } = useDriverStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          if (driver?.id) {
            await firestore().collection('drivers').doc(driver.id).update({
              isOnline: false, status: 'offline',
            });
          }
          await auth().signOut();
          reset();
          router.replace('/auth');
        },
      },
    ]);
  };

  if (!driver) return null;

  const statusColor = {
    offline: C.gray,
    available: C.green,
    on_trip: C.teal,
  }[status];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {driver.profilePhoto ? (
          <Image source={{ uri: driver.profilePhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {driver.name?.[0]?.toUpperCase() || 'D'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.phone}>{driver.phone}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status === 'offline' ? 'Offline' : status === 'available' ? 'Available' : 'On Trip'}
          </Text>
        </View>
      </View>

      {/* Rating + rides */}
      <View style={styles.statsRow}>
        {[
          { icon: '⭐', val: driver.rating?.toFixed(1) || '—', label: 'Rating' },
          { icon: '🚐', val: driver.totalRides || 0, label: 'Total Rides' },
          { icon: '💰', val: `MVR ${driver.earnings?.toFixed(0) || 0}`, label: 'Lifetime' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Vehicle info */}
      {driver.vehicle && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vehicle</Text>
          <View style={styles.vehicleCard}>
            {driver.vehicle.photo && (
              <Image source={{ uri: driver.vehicle.photo }} style={styles.vehiclePhoto} />
            )}
            <View style={styles.vehicleInfo}>
              {[
                ['Type', driver.vehicle.type === 'motorcycle' ? '🛵 Motorcycle' : '🚐 Golf Buggy'],
                ['Plate', driver.vehicle.plateNumber],
                ['Model', driver.vehicle.model],
                ['Seats', driver.vehicle.seats],
              ].map(([lbl, val]) => (
                <View key={String(lbl)} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{lbl}</Text>
                  <Text style={styles.infoVal}>{val}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Menu items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          {[
            { icon: '📋', label: 'Ride History', onPress: () => {} },
            { icon: '🔔', label: 'Notifications', onPress: () => {} },
            { icon: '📞', label: 'Contact Support', onPress: () => {} },
            { icon: '📄', label: 'Terms & Conditions', onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuRow}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Driver ID */}
      <View style={styles.driverIdBox}>
        <Text style={styles.driverIdLabel}>Driver ID</Text>
        <Text style={styles.driverIdVal}>THD-{driver.id?.slice(-4).toUpperCase()}</Text>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutLabel}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.sand },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 28,
    backgroundColor: C.white,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 12 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44, marginBottom: 12,
    backgroundColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 34, fontWeight: '800', color: C.white },
  name: { fontSize: 22, fontWeight: '800', color: C.dark },
  phone: { fontSize: 14, color: C.gray, marginTop: 3, marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, padding: 20 },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '800', color: C.dark },
  statLabel: { fontSize: 11, color: C.gray, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.gray, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  vehicleCard: { backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  vehiclePhoto: { width: '100%', height: 140, resizeMode: 'cover' },
  vehicleInfo: { padding: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.light },
  infoLabel: { fontSize: 13, color: C.gray },
  infoVal: { fontSize: 13, fontWeight: '600', color: C.dark },
  menuCard: { backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.light },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: C.dark, fontWeight: '500' },
  menuChevron: { fontSize: 20, color: C.gray },
  driverIdBox: { margin: 20, backgroundColor: C.ocean + '10', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.ocean + '20' },
  driverIdLabel: { fontSize: 11, color: C.gray, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  driverIdVal: { fontSize: 18, fontWeight: '800', color: C.ocean, fontFamily: 'monospace' },
  signOutBtn: { marginHorizontal: 20, backgroundColor: '#FFF5F5', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  signOutLabel: { color: C.coral, fontSize: 15, fontWeight: '700' },
});
