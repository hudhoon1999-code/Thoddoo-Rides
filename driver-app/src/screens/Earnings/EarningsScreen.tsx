import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../src/theme/tokens';

const PERIODS = ['Today', 'This Week', 'This Month'];

// Mock data — replace with Firestore queries
const MOCK_RIDES = [
  { id: '1', date: 'Today, 3:42 PM',   from: 'Ferry Jetty',         to: 'Palm Leaf Guesthouse', fare: 50, commission: 8,  net: 42 },
  { id: '2', date: 'Today, 1:15 PM',   from: 'Lemongrass Guesthouse', to: 'Tourist Beach',      fare: 30, commission: 5,  net: 25 },
  { id: '3', date: 'Today, 10:00 AM',  from: 'Sky Blue Resort',     to: 'Ferry Jetty',           fare: 55, commission: 8,  net: 47 },
  { id: '4', date: 'Yesterday, 8PM',   from: 'Tropical Beach Club', to: 'Blue Heaven',           fare: 35, commission: 5,  net: 30 },
  { id: '5', date: 'Yesterday, 5PM',   from: 'Main Beach',          to: 'Mahmal Lodge',          fare: 25, commission: 4,  net: 21 },
  { id: '6', date: 'Mon, 11:30 AM',    from: 'Health Centre',       to: 'Ferry Jetty',           fare: 40, commission: 6,  net: 34 },
];

const STATS = {
  today: { rides: 3, gross: 135, commission: 21, net: 114 },
  week:  { rides: 6, gross: 235, commission: 36, net: 199 },
  month: { rides: 42, gross: 1840, commission: 276, net: 1564 },
};

export default function EarningsScreen() {
  const [period, setPeriod] = useState('Today');

  const stats = period === 'Today'
    ? STATS.today
    : period === 'This Week'
      ? STATS.week
      : STATS.month;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0E7490', '#1CC7C1']} style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>MVR {stats.net}</Text>
            <Text style={styles.summaryLabel}>Net Earnings</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats.rides}</Text>
            <Text style={styles.summaryLabel}>Rides</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>MVR {stats.gross}</Text>
            <Text style={styles.summaryLabel}>Gross</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Commission breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Gross Fare</Text>
          <Text style={styles.breakdownValue}>MVR {stats.gross}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Platform Fee (15%)</Text>
          <Text style={[styles.breakdownValue, { color: '#EF4444' }]}>-MVR {stats.commission}</Text>
        </View>
        <View style={[styles.breakdownItem, styles.breakdownTotal]}>
          <Text style={styles.breakdownTotalLabel}>Your Earnings</Text>
          <Text style={styles.breakdownTotalValue}>MVR {stats.net}</Text>
        </View>
      </View>

      {/* Ride list */}
      <Text style={styles.listTitle}>Ride History</Text>
      <FlatList
        data={MOCK_RIDES}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            <View style={styles.rideLeft}>
              <Text style={styles.rideDate}>{item.date}</Text>
              <View style={styles.routeRow}>
                <View style={styles.routeDot} />
                <Text style={styles.routeText} numberOfLines={1}>{item.from}</Text>
              </View>
              <View style={[styles.routeRow, { marginTop: 3 }]}>
                <View style={[styles.routeDot, styles.routeDotEnd]} />
                <Text style={styles.routeText} numberOfLines={1}>{item.to}</Text>
              </View>
            </View>
            <View style={styles.rideRight}>
              <Text style={styles.rideNet}>MVR {item.net}</Text>
              <Text style={styles.rideGross}>of MVR {item.fare}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#F8F4EC' },

  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 16 },

  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  periodChipActive: { backgroundColor: '#fff' },
  periodText:       { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  periodTextActive: { color: '#0E7490' },

  summaryRow:    { flexDirection: 'row', alignItems: 'center' },
  summaryItem:   { flex: 1, alignItems: 'center' },
  summaryValue:  { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  summaryLabel:  { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  breakdown: {
    margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  breakdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  breakdownTotal:      { borderBottomWidth: 0, marginTop: 4, paddingTop: 12 },
  breakdownLabel:      { fontSize: 14, color: tokens.colors.textSecondary },
  breakdownValue:      { fontSize: 14, fontWeight: '600', color: tokens.colors.textPrimary },
  breakdownTotalLabel: { fontSize: 15, fontWeight: '700', color: tokens.colors.textPrimary },
  breakdownTotalValue: { fontSize: 18, fontWeight: '800', color: '#0E7490' },

  listTitle: { fontSize: 13, fontWeight: '700', color: tokens.colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },
  list:      { paddingHorizontal: 16, paddingBottom: 40 },

  rideCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  rideLeft:  { flex: 1 },
  rideDate:  { fontSize: 11, color: tokens.colors.textMuted, marginBottom: 6 },
  routeRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1CC7C1' },
  routeDotEnd: { backgroundColor: '#FF7A59' },
  routeText: { fontSize: 13, fontWeight: '500', color: tokens.colors.textPrimary, flex: 1 },
  rideRight: { alignItems: 'flex-end', paddingLeft: 12 },
  rideNet:   { fontSize: 16, fontWeight: '800', color: '#0E7490' },
  rideGross: { fontSize: 12, color: tokens.colors.textMuted, marginTop: 2 },
});
