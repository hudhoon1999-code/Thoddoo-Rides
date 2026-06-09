// driver-app/src/theme/tokens.ts

export const Colors = {
  lagoonTeal: '#1CC7C1',
  lagoonTealDark: '#17A8A3',
  lagoonTealLight: '#4DDBD6',
  deepOcean: '#0E7490',
  coralSunset: '#FF7A59',
  warmSand: '#F8F4EC',
  palmGreen: '#2F855A',
  palmGreenLight: '#48BB78',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F0F9FA',
  surface: '#FFFFFF',
  border: 'rgba(28,199,193,0.15)',
  textPrimary: '#0A2A2E',
  textSecondary: '#4A6B70',
  textTertiary: '#8AABB0',
  textInverse: '#FFFFFF',
  textAccent: '#1CC7C1',
  success: '#2F855A',
  successLight: 'rgba(47,133,90,0.15)',
  warning: '#D97706',
  warningLight: 'rgba(217,119,6,0.15)',
  error: '#DC2626',
  errorLight: 'rgba(220,38,38,0.15)',
  overlay: 'rgba(10,42,46,0.5)',
  glassBg: 'rgba(255,255,255,0.85)',
  driverOnline: '#2F855A',
  driverBusy: '#D97706',
  driverOffline: '#9CA3AF',
} as const;

export const Typography = {
  sizes: {
    xs: 11, sm: 13, base: 15, md: 16, lg: 18,
    xl: 20, '2xl': 24, '3xl': 28, '4xl': 32, '5xl': 40, display: 48,
  },
  weights: {
    regular: '400' as const, medium: '500' as const,
    semibold: '600' as const, bold: '700' as const,
    extrabold: '800' as const, black: '900' as const,
  },
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20,
  xl: 24, '2xl': 32, '3xl': 40, '4xl': 48, '5xl': 64, section: 80,
} as const;

export const Radii = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, '3xl': 32, full: 9999,
  card: 20, button: 16, pill: 50, modal: 28,
} as const;

export const Shadows = {
  sm: { shadowColor: '#0E7490', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#0E7490', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#0E7490', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  xl: { shadowColor: '#0A2A2E', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
  tealGlow: { shadowColor: '#1CC7C1', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  coralGlow: { shadowColor: '#FF7A59', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
} as const;
