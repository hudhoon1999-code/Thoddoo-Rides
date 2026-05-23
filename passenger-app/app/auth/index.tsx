import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, StatusBar,
  ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { tokens } from '../../src/theme/tokens';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';

const COUNTRY_CODES = [
  { flag: '🇲🇻', code: '+960', country: 'MV' },
  { flag: '🇷🇺', code: '+7',   country: 'RU' },
  { flag: '🇬🇧', code: '+44',  country: 'GB' },
  { flag: '🇩🇪', code: '+49',  country: 'DE' },
  { flag: '🇮🇹', code: '+39',  country: 'IT' },
];

export default function PhoneAuthScreen() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Please enter a valid phone number');
      shake();
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullNumber = `${countryCode.code}${digits}`;
      await authService.sendOTP(fullNumber);
      router.push({ pathname: '/auth/otp', params: { phone: fullNumber } });
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP. Please try again.');
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0E7490', '#1CC7C1', '#F8F4EC']}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏝</Text>
            </View>
            <Text style={styles.appName}>Thoddoo Rides</Text>
            <Text style={styles.tagline}>Local Transfers Made Easy</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter your number</Text>
            <Text style={styles.cardSubtitle}>
              We'll send you a one-time verification code
            </Text>

            {/* Input row */}
            <Animated.View
              style={[styles.inputRow, { transform: [{ translateX: shakeAnim }] }]}
            >
              {/* Country picker */}
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setShowPicker(!showPicker)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{countryCode.flag}</Text>
                <Text style={styles.dialCode}>{countryCode.code}</Text>
                <Text style={styles.chevron}>▾</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor={tokens.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={15}
                autoFocus
              />
            </Animated.View>

            {/* Country dropdown */}
            {showPicker && (
              <View style={styles.pickerDropdown}>
                {COUNTRY_CODES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.pickerItem}
                    onPress={() => { setCountryCode(c); setShowPicker(false); }}
                  >
                    <Text style={styles.pickerFlag}>{c.flag}</Text>
                    <Text style={styles.pickerCode}>{c.code}</Text>
                    <Text style={styles.pickerCountry}>{c.country}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* CTA */}
            <TouchableOpacity
              style={[styles.cta, loading && styles.ctaLoading]}
              onPress={handleContinue}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={['#1CC7C1', '#0E7490']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.ctaText}>Continue →</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:    { flex: 1 },
  kav:         { flex: 1 },
  container:   { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  logoArea:    { alignItems: 'center', marginBottom: 32 },
  logoCircle:  {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1CC7C1', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  logoEmoji:   { fontSize: 36 },
  appName:     { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline:     { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardTitle:    { fontSize: 20, fontWeight: '700', color: tokens.colors.textPrimary, marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: tokens.colors.textSecondary, marginBottom: 24, lineHeight: 20 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, overflow: 'hidden', marginBottom: 8,
  },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 14,
    borderRightWidth: 1.5, borderRightColor: '#E2E8F0',
    backgroundColor: '#F8FAFC', gap: 4,
  },
  flag:      { fontSize: 20 },
  dialCode:  { fontSize: 14, fontWeight: '600', color: tokens.colors.textPrimary },
  chevron:   { fontSize: 10, color: tokens.colors.textMuted },
  phoneInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 16, color: tokens.colors.textPrimary, fontWeight: '500',
  },

  pickerDropdown: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 10,
  },
  pickerFlag:    { fontSize: 22 },
  pickerCode:    { fontSize: 15, fontWeight: '600', color: tokens.colors.textPrimary },
  pickerCountry: { fontSize: 14, color: tokens.colors.textSecondary },

  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 8, marginLeft: 4 },

  cta:        { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  ctaLoading: { opacity: 0.7 },
  ctaGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  ctaText:    { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  terms:     { fontSize: 12, color: tokens.colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 18 },
  termsLink: { color: tokens.colors.primary, fontWeight: '600' },
});
