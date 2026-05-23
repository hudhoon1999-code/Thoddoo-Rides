import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { tokens } from '../../src/theme/tokens';
import { authService } from '../../src/services/authService';
import { useAuthStore } from '../../src/store/authStore';

const CODE_LENGTH = 6;

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending]     = useState(false);

  const inputRefs = useRef<TextInput[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendTimer === 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[idx] = digit;
    setCode(newCode);
    setError('');
    if (digit && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (newCode.every((d) => d !== '')) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setLoading(true);
    try {
      const user = await authService.verifyOTP(phone!, fullCode);
      // Success animation
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
      setTimeout(() => {
        setUser(user);
        router.replace('/(tabs)/home');
      }, 600);
    } catch (e: any) {
      setError('Invalid code. Please try again.');
      setCode(new Array(CODE_LENGTH).fill(''));
      shake();
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await authService.sendOTP(phone!);
      setResendTimer(30);
      setCode(new Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (e) {
      setError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone
    ? phone.slice(0, -4).replace(/./g, '•') + phone.slice(-4)
    : '';

  return (
    <LinearGradient colors={['#0E7490', '#1CC7C1', '#F8F4EC']} locations={[0, 0.45, 1]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerArea}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
            </Text>
          </View>

          {/* OTP Boxes */}
          <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => { if (r) inputRefs.current[i] = r; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  error ? styles.otpBoxError : null,
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </Animated.View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading && (
            <View style={styles.verifyingRow}>
              <ActivityIndicator color={tokens.colors.primary} size="small" />
              <Text style={styles.verifyingText}>Verifying…</Text>
            </View>
          )}

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0 || resending}>
              {resendTimer > 0
                ? <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
                : resending
                  ? <ActivityIndicator size="small" color={tokens.colors.primary} />
                  : <Text style={styles.resendLink}>Resend code</Text>}
            </TouchableOpacity>
          </View>

          {/* Success overlay */}
          <Animated.View style={[styles.successOverlay, {
            transform: [{ scale: successScale }],
            opacity: successScale,
          }]}>
            <LinearGradient colors={['#1CC7C1', '#0E7490']} style={styles.successCircle}>
              <Text style={styles.successCheck}>✓</Text>
            </LinearGradient>
            <Text style={styles.successText}>Verified!</Text>
          </Animated.View>

        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient:  { flex: 1 },
  kav:       { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 80 },

  backBtn:  { position: 'absolute', top: 56, left: 20, padding: 8 },
  backIcon: { fontSize: 22, color: '#fff' },

  headerArea: { alignItems: 'center', marginBottom: 40 },
  title:    { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },
  phoneHighlight: { fontWeight: '700', color: '#fff' },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 },
  otpBox: {
    width: 48, height: 56, borderRadius: 14,
    backgroundColor: '#fff',
    textAlign: 'center', fontSize: 22, fontWeight: '700',
    color: tokens.colors.textPrimary,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  otpBoxFilled: { borderColor: '#1CC7C1', backgroundColor: '#F0FFFE' },
  otpBoxError:  { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },

  errorText: { textAlign: 'center', color: '#EF4444', fontSize: 13, marginBottom: 12, fontWeight: '500' },

  verifyingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  verifyingText: { fontSize: 14, color: '#fff' },

  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  resendLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  resendLink:  { fontSize: 14, color: '#fff', fontWeight: '700', textDecorationLine: 'underline' },
  resendTimer: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },

  successOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(14, 116, 144, 0.9)',
  },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  successCheck: { fontSize: 40, color: '#fff' },
  successText:  { fontSize: 22, fontWeight: '800', color: '#fff' },
});
