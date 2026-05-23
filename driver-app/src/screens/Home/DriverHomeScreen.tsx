// driver-app/src/screens/Home/DriverHomeScreen.tsx
// ============================================================
// DRIVER HOME — Online/offline toggle + earnings + ride requests
// ============================================================

import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Animated as RNAnimated,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat,
  withSequence, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { DriverStatus } from '../../types';

const { width } = Dimensions.get('window');

// Mock incoming ride request
const MOCK_REQUEST = {
  id: 'req_123',
  passenger: 'Ahmed R.',
  pickup: 'Ferry Jetty',
  dropoff: 'Palm Leaf Guesthouse',
  distance: '0.4 km',
  fareMin: 30,
  fareMax: 40,
  vehicleType: 'Buggy',
  timeoutSeconds: 25,
};

export function DriverHomeScreen() {
  const [status, setStatus] = useState<DriverStatus>(DriverStatus.OFFLINE);
  const [showRequest, setShowRequest] = useState(false);
  const [countdown, setCountdown] = useState(MOCK_REQUEST.timeoutSeconds);

  const toggleScale = useSharedValue(1);
  const requestSlide = useSharedValue(300);
  const pulseOpacity = useSharedValue(0.6);

  // Toggle online/offline
  const handleToggle = () => {
    toggleScale.value = withSpring(0.9, {}, () => {
      toggleScale.value = withSpring(1);
    });

    if (status === DriverStatus.OFFLINE) {
      setStatus(DriverStatus.AVAILABLE);
      // Demo: show ride request after 3 seconds
      setTimeout(() => {
        setShowRequest(true);
        setCountdown(MOCK_REQUEST.timeoutSeconds);
        requestSlide.value = withSpring(0, { damping: 15 });
      }, 3000);
    } else {
      setStatus(DriverStatus.OFFLINE);
      setShowRequest(false);
    }
  };

  // Pulse animation when available
  useEffect(() => {
    if (status === DriverStatus.AVAILABLE) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.4, { duration: 700 }),
        ),
        -1, false
      );
    } else {
      pulseOpacity.value = withTiming(0.4);
    }
  }, [status]);

  // Countdown timer for ride request
  useEffect(() => {
    if (!showRequest) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setShowRequest(false);
          requestSlide.value = withTiming(300);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showRequest]);

  const toggleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleScale.value }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));
  const requestStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: requestSlide.value }],
  }));

  const statusConfig = {
    [DriverStatus.OFFLINE]: { color: '#9CA3AF', label: 'Offline', bg: '#F3F4F6' },
    [DriverStatus.AVAILABLE]: { color: Colors.palmGreen, label: 'Available', bg: Colors.successLight },
    [DriverStatus.ON_TRIP]: { color: Colors.warning, label: 'On Trip', bg: Colors.warningLight },
  };

  const cfg = statusConfig[status];

  return (
    <View style={styles.container}>
      {/* Header gradient */}
      <LinearGradient
        colors={['#0E7490', '#1CC7C1']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.driverName}>Jamaal 👋</Text>
            </View>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>THD-4022</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Toggle ────────────────────────────────────── */}
        <View style={styles.toggleSection}>
          {/* Status indicator */}
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Animated.View style={[styles.statusDot, { backgroundColor: cfg.color }, pulseStyle]} />
            <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          </View>

          {/* Big toggle button */}
          <Animated.View style={toggleStyle}>
            <TouchableOpacity onPress={handleToggle} activeOpacity={0.85}>
              <LinearGradient
                colors={status === DriverStatus.OFFLINE
                  ? ['#9CA3AF', '#6B7280']
                  : [Colors.lagoonTeal, Colors.deepOcean]
                }
                style={styles.toggleBtn}
              >
                <Text style={styles.toggleBtnEmoji}>
                  {status === DriverStatus.OFFLINE ? '▶' : '⏹'}
                </Text>
                <Text style={styles.toggleBtnText}>
                  {status === DriverStatus.OFFLINE ? 'Go Online' : 'Go Offline'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {status === DriverStatus.AVAILABLE && (
            <Text style={styles.waitingText}>
              🟢 Waiting for ride requests...
            </Text>
          )}
        </View>

        {/* ─── Earnings Cards ─────────────────────────── */}
        <Text style={styles.sectionTitle}>Today's Earnings</Text>
        <View style={styles.earningsGrid}>
          <EarningsCard label="Today" value="MVR 192" subtext="8 rides" emoji="💰" />
          <EarningsCard label="This Week" value="MVR 1,440" subtext="56 rides" emoji="📈" />
        </View>

        <View style={styles.earningsGrid}>
          <EarningsCard label="Rating" value="4.8 ⭐" subtext="1,222 reviews" emoji="🏆" />
          <EarningsCard label="Total Rides" value="340" subtext="since joining" emoji="🚐" />
        </View>

        {/* ─── Safety ──────────────────────────────────── */}
        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Safety</Text>
          <View style={styles.safetyButtons}>
            <TouchableOpacity style={styles.sosBtn}>
              <Text style={styles.sosText}>🆘 SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportBtn}>
              <Text style={styles.reportText}>⚠️ Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Incoming Ride Request Popup ──────────────── */}
      {showRequest && (
        <Animated.View style={[styles.requestPopup, requestStyle, Shadows.xl]}>
          <LinearGradient
            colors={['#FFFFFF', '#F0FDFA']}
            style={styles.requestContent}
          >
            {/* Timer bar */}
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerFill,
                  { width: `${(countdown / MOCK_REQUEST.timeoutSeconds) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.requestHeader}>
              <Text style={styles.requestTitle}>New Ride Request 🚐</Text>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{countdown}s</Text>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <View style={styles.requestLocation}>
                <View style={[styles.locationDot, { backgroundColor: Colors.palmGreen }]} />
                <Text style={styles.locationText}>{MOCK_REQUEST.pickup}</Text>
              </View>
              <View style={styles.requestLocation}>
                <View style={[styles.locationDot, { backgroundColor: Colors.coralSunset }]} />
                <Text style={styles.locationText}>{MOCK_REQUEST.dropoff}</Text>
              </View>
            </View>

            <View style={styles.requestMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaEmoji}>📍</Text>
                <Text style={styles.metaText}>{MOCK_REQUEST.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaEmoji}>💰</Text>
                <Text style={styles.metaText}>
                  MVR {MOCK_REQUEST.fareMin}–{MOCK_REQUEST.fareMax}
                </Text>
              </View>
            </View>

            <View style={styles.requestActions}>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => {
                  setShowRequest(false);
                  requestSlide.value = withTiming(300);
                }}
              >
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
                <LinearGradient
                  colors={[Colors.lagoonTeal, Colors.deepOcean]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.acceptBtnGradient}
                >
                  <Text style={styles.acceptBtnText}>Accept ✓</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

function EarningsCard({ label, value, subtext, emoji }: {
  label: string; value: string; subtext: string; emoji: string;
}) {
  return (
    <View style={[styles.earningsCard, Shadows.sm]}>
      <Text style={styles.earningsEmoji}>{emoji}</Text>
      <Text style={styles.earningsValue}>{value}</Text>
      <Text style={styles.earningsLabel}>{label}</Text>
      <Text style={styles.earningsSubtext}>{subtext}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingBottom: Spacing.xl, borderBottomLeftRadius: Radii['3xl'], borderBottomRightRadius: Radii['3xl'] },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  greeting: { fontFamily: 'Nunito', fontSize: Typography.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  driverName: { fontFamily: 'Sora-Bold', fontSize: Typography.sizes.xl, color: Colors.white },
  codeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.pill },
  codeText: { fontFamily: 'Nunito-Bold', fontSize: Typography.sizes.sm, color: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg },
  toggleSection: { alignItems: 'center', marginBottom: Spacing.xl },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs, borderRadius: Radii.pill, marginBottom: Spacing.lg },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontFamily: 'Nunito-Bold', fontSize: Typography.sizes.sm },
  toggleBtn: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, ...Shadows.tealGlow },
  toggleBtnEmoji: { fontSize: 40 },
  toggleBtnText: { fontFamily: 'Sora-Bold', fontSize: Typography.sizes.lg, color: Colors.white },
  waitingText: { fontFamily: 'Nunito', fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: Spacing.md },
  sectionTitle: { fontFamily: 'Sora-SemiBold', fontSize: Typography.sizes.lg, color: Colors.textPrimary, marginBottom: Spacing.md },
  earningsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  earningsCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radii.card, padding: Spacing.base },
  earningsEmoji: { fontSize: 24, marginBottom: 4 },
  earningsValue: { fontFamily: 'Sora-Bold', fontSize: Typography.sizes.xl, color: Colors.textPrimary },
  earningsLabel: { fontFamily: 'Nunito-SemiBold', fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  earningsSubtext: { fontFamily: 'Nunito', fontSize: Typography.sizes.xs, color: Colors.textTertiary },
  safetyCard: { backgroundColor: Colors.white, borderRadius: Radii.card, padding: Spacing.base, marginTop: Spacing.md, ...Shadows.sm },
  safetyTitle: { fontFamily: 'Sora-SemiBold', fontSize: Typography.sizes.base, color: Colors.textPrimary, marginBottom: Spacing.md },
  safetyButtons: { flexDirection: 'row', gap: Spacing.md },
  sosBtn: { flex: 1, backgroundColor: Colors.errorLight, borderRadius: Radii.button, paddingVertical: Spacing.md, alignItems: 'center' },
  sosText: { fontFamily: 'Nunito-Bold', fontSize: Typography.sizes.base, color: Colors.error },
  reportBtn: { flex: 1, backgroundColor: Colors.warningLight, borderRadius: Radii.button, paddingVertical: Spacing.md, alignItems: 'center' },
  reportText: { fontFamily: 'Nunito-Bold', fontSize: Typography.sizes.base, color: Colors.warning },
  // Request popup
  requestPopup: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: Radii['3xl'], borderTopRightRadius: Radii['3xl'], overflow: 'hidden' },
  requestContent: { padding: Spacing.xl, paddingTop: Spacing.lg },
  timerBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: Spacing.base, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: Colors.lagoonTeal, borderRadius: 2 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  requestTitle: { fontFamily: 'Sora-Bold', fontSize: Typography.sizes.xl, color: Colors.textPrimary },
  countdownBadge: { backgroundColor: Colors.coralSunset, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.pill },
  countdownText: { fontFamily: 'Sora-Bold', fontSize: Typography.sizes.lg, color: Colors.white },
  requestDetails: { gap: Spacing.sm, marginBottom: Spacing.md, backgroundColor: Colors.background, borderRadius: Radii.lg, padding: Spacing.md },
  requestLocation: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  locationDot: { width: 10, height: 10, borderRadius: 5 },
  locationText: { fontFamily: 'Nunito-SemiBold', fontSize: Typography.sizes.base, color: Colors.textPrimary, flex: 1 },
  requestMeta: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaEmoji: { fontSize: 16 },
  metaText: { fontFamily: 'Nunito-SemiBold', fontSize: Typography.sizes.base, color: Colors.textPrimary },
  requestActions: { flexDirection: 'row', gap: Spacing.md },
  declineBtn: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radii.button },
  declineBtnText: { fontFamily: 'Nunito-Bold', fontSize: Typography.sizes.base, color: Colors.textSecondary },
  acceptBtn: { flex: 2, borderRadius: Radii.button, overflow: 'hidden', ...Shadows.tealGlow },
  acceptBtnGradient: { paddingVertical: Spacing.md + 2, alignItems: 'center' },
  acceptBtnText: { fontFamily: 'Sora-Bold', fontSize: Typography.sizes.lg, color: Colors.white },
});
