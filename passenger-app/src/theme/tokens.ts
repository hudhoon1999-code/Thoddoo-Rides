// passenger-app/src/theme/tokens.ts
// ============================================================
// THODDOO RIDES — Design System Tokens
// ============================================================

export const Colors = {
  // ─── Primary Palette ─────────────────────────────────────
  lagoonTeal: '#1CC7C1',
  lagoonTealDark: '#17A8A3',
  lagoonTealLight: '#4DDBD6',
  deepOcean: '#0E7490',
  deepOceanDark: '#0A5870',
  coralSunset: '#FF7A59',
  coralSunsetDark: '#E8633E',
  warmSand: '#F8F4EC',
  warmSandDark: '#EDE8DC',
  palmGreen: '#2F855A',
  palmGreenLight: '#48BB78',

  // ─── Gradients (use with LinearGradient) ─────────────────
  gradients: {
    lagoon: ['#1CC7C1', '#0E7490'],
    sunset: ['#FF7A59', '#FFB347', '#FF7A59'],
    tropical: ['#1CC7C1', '#2F855A'],
    nightlife: ['#0E7490', '#1a1a2e', '#16213e'],
    sand: ['#F8F4EC', '#FFF8F0'],
    card: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
    headerOverlay: ['rgba(14,116,144,0.85)', 'transparent'],
    eventGlow: ['rgba(28,199,193,0.3)', 'rgba(255,122,89,0.3)'],
  },

  // ─── UI Colors ───────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  background: '#F0F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F4EC',
  border: 'rgba(28,199,193,0.15)',
  borderLight: 'rgba(255,255,255,0.3)',

  // ─── Text ────────────────────────────────────────────────
  textPrimary: '#0A2A2E',
  textSecondary: '#4A6B70',
  textTertiary: '#8AABB0',
  textInverse: '#FFFFFF',
  textAccent: '#1CC7C1',

  // ─── Status ──────────────────────────────────────────────
  success: '#2F855A',
  successLight: 'rgba(47,133,90,0.15)',
  warning: '#D97706',
  warningLight: 'rgba(217,119,6,0.15)',
  error: '#DC2626',
  errorLight: 'rgba(220,38,38,0.15)',
  info: '#0E7490',
  infoLight: 'rgba(14,116,144,0.15)',

  // ─── Driver Status ───────────────────────────────────────
  driverOnline: '#2F855A',
  driverBusy: '#D97706',
  driverOffline: '#9CA3AF',

  // ─── Overlays ────────────────────────────────────────────
  overlay: 'rgba(10,42,46,0.5)',
  overlayLight: 'rgba(255,255,255,0.15)',
  glassBg: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(255,255,255,0.5)',
  glassBgDark: 'rgba(14,116,144,0.15)',

  // ─── Map ─────────────────────────────────────────────────
  mapAccent: '#1CC7C1',
  routeLine: '#FF7A59',
  pickupPin: '#2F855A',
  dropoffPin: '#FF7A59',
  driverPin: '#1CC7C1',
} as const;

export const Typography = {
  // ─── Font Families ───────────────────────────────────────
  // Primary: Nunito (friendly, rounded — perfect for island feel)
  // Display: Sora (modern geometric for headers)
  // Mono: JetBrains Mono (for fares, codes)
  
  fontFamilies: {
    primary: 'Jakarta',
    primaryMedium: 'Jakarta-Medium',
    primarySemiBold: 'Jakarta-SemiBold',
    primaryBold: 'Jakarta-Bold',
    primaryExtraBold: 'Jakarta-ExtraBold',
    display: 'Sora',
    displaySemiBold: 'Sora-SemiBold',
    displayBold: 'Sora-Bold',
    mono: 'Mono',
    monoMedium: 'Mono-Medium',
  },

  // ─── Font Sizes ──────────────────────────────────────────
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    display: 48,
  },

  // ─── Font Weights ────────────────────────────────────────
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // ─── Line Heights ────────────────────────────────────────
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  section: 80,
} as const;

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
  card: 20,
  button: 16,
  pill: 50,
  modal: 28,
} as const;

export const Shadows = {
  // Soft tropical shadows
  sm: {
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0A2A2E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  // Glow effects
  tealGlow: {
    shadowColor: '#1CC7C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  coralGlow: {
    shadowColor: '#FF7A59',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const Animation = {
  // Duration presets (ms)
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
  
  // Spring configs (for Reanimated)
  spring: {
    gentle: { damping: 15, stiffness: 120 },
    bouncy: { damping: 10, stiffness: 150 },
    snappy: { damping: 20, stiffness: 200 },
  },
  
  // Easing
  easing: {
    smooth: [0.4, 0, 0.2, 1],
    snappy: [0.4, 0, 0, 1],
    bounce: [0.34, 1.56, 0.64, 1],
  },
} as const;

// ─── VEHICLE TYPE DISPLAY CONFIG ─────────────────────────────

export const VehicleDisplay = {
  buggy_6: {
    label: 'Buggy',
    emoji: '🚐',
    seats: '2–6 Seats',
    tagline: 'Comfortable • Group',
    color: Colors.lagoonTeal,
  },
  buggy_12: {
    label: 'Large Buggy',
    emoji: '🚌',
    seats: '2–12 Seats',
    tagline: 'Groups & Families',
    color: Colors.deepOcean,
  },
  motorcycle: {
    label: 'Motorcycle',
    emoji: '🛵',
    seats: '1 Seat',
    tagline: 'Fast • Solo',
    color: Colors.coralSunset,
  },
} as const;
