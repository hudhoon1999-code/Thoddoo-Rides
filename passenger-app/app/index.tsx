// passenger-app/app/index.tsx
// ============================================================
// SPLASH SCREEN — Cinematic tropical island entrance
// ============================================================

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Colors, Typography, Spacing } from '../src/theme/tokens';

const { width, height } = Dimensions.get('window');

export default function SplashScreenPage() {
  const { user, isLoading, initialize } = useAuthStore();

  // Animation values
  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const badgesOpacity = useSharedValue(0);
  const waveTranslateY = useSharedValue(80);

  const navigateAfterSplash = () => {
    if (user) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/auth');
    }
  };

  useEffect(() => {
    initialize();

    // Sequence: bg → logo → title → subtitle → badges → navigate
    bgOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });

    logoOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    logoScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 150 }));

    titleOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
    titleTranslateY.value = withDelay(700, withSpring(0, { damping: 15 }));

    subtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    badgesOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
    waveTranslateY.value = withDelay(400, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // Navigate after 2.8 seconds
    const timer = setTimeout(() => {
      runOnJS(navigateAfterSplash)();
    }, 2800);

    return () => clearTimeout(timer);
  }, [user]);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const badgesStyle = useAnimatedStyle(() => ({ opacity: badgesOpacity.value }));
  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: waveTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Background: Tropical gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={['#87CEEB', '#4FC3F7', '#26C6DA', '#1CC7C1', '#0E7490']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Sky elements: sun */}
      <Animated.View style={[styles.sunContainer, bgStyle]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.sun}
        />
      </Animated.View>

      {/* Palm silhouettes (SVG or image) */}
      <Animated.View style={[styles.palmLeft, bgStyle]}>
        <Text style={styles.palmEmoji}>🌴</Text>
      </Animated.View>
      <Animated.View style={[styles.palmRight, bgStyle]}>
        <Text style={styles.palmEmoji}>🌴</Text>
      </Animated.View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          {/* In production: use actual logo image */}
          {/* <Image source={require('../assets/images/logo.png')} style={styles.logo} /> */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🛺</Text>
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.View style={titleStyle}>
          <Text style={styles.appName}>Thoddoo</Text>
          <Text style={styles.appNameAccent}>Rides</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={subtitleStyle}>
          <Text style={styles.tagline}>Local Transfers Made Easy</Text>
        </Animated.View>

        {/* Vehicle badges */}
        <Animated.View style={[styles.badges, badgesStyle]}>
          {['🚐 Buggy', '🛵 Motorcycle', '🏝 Local'].map((badge, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Wave at bottom */}
      <Animated.View style={[styles.waveContainer, waveStyle]}>
        <LinearGradient
          colors={['rgba(248,244,236,0)', '#F8F4EC']}
          style={styles.wave}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  sunContainer: {
    position: 'absolute',
    top: height * 0.12,
    alignSelf: 'center',
  },
  sun: {
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.9,
  },
  palmLeft: {
    position: 'absolute',
    bottom: height * 0.22,
    left: -20,
  },
  palmRight: {
    position: 'absolute',
    bottom: height * 0.22,
    right: -20,
    transform: [{ scaleX: -1 }],
  },
  palmEmoji: {
    fontSize: 120,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontFamily: 'Sora-Bold',
    fontSize: 48,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(14,116,144,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    lineHeight: 52,
  },
  appNameAccent: {
    fontFamily: 'Sora-Bold',
    fontSize: 52,
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    lineHeight: 56,
    marginTop: -8,
  },
  tagline: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 50,
  },
  badgeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    height: 150,
  },
});
