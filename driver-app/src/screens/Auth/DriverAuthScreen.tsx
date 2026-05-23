import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Image, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { tokens } from '../../src/theme/tokens';

type Step = 'phone' | 'otp' | 'profile';

export default function DriverAuthScreen() {
  const [step, setStep]       = useState<Step>('phone');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [name, setName]       = useState('');
  const [photo, setPhoto]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const otpRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (val: string, idx: number) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[idx] = d;
    setOtp(next);
    if (d && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every((x) => x !== '')) submitOtp(next.join(''));
  };

  const submitPhone = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    // TODO: call driverAuthService.sendOTP('+960' + digits)
    setTimeout(() => { setLoading(false); setStep('otp'); setError(''); }, 1000);
  };

  const submitOtp = async (code: string) => {
    setLoading(true);
    // TODO: call driverAuthService.verifyOTP(phone, code)
    setTimeout(() => { setLoading(false); setStep('profile'); setError(''); }, 1000);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const submitProfile = async () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    // TODO: save to Firestore, route to document upload
    setTimeout(() => { setLoading(false); router.push('/registration/documents'); }, 1000);
  };

  return (
    <LinearGradient colors={['#0E7490', '#1CC7C1']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🚐</Text>
            <Text style={styles.headerTitle}>Become a Driver</Text>
            <Text style={styles.headerSub}>Join Thoddoo's local transport network</Text>
          </View>

          {/* Step indicators */}
          <View style={styles.steps}>
            {(['phone', 'otp', 'profile'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <View style={[styles.stepDot, step === s && styles.stepDotActive,
                  ['otp','profile'].includes(step) && s === 'phone' && styles.stepDotDone,
                  step === 'profile' && s === 'otp' && styles.stepDotDone,
                ]}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                {i < 2 && <View style={[styles.stepLine, i < ['phone','otp','profile'].indexOf(step) && styles.stepLineDone]} />}
              </React.Fragment>
            ))}
          </View>

          {/* Card */}
          <View style={styles.card}>

            {/* STEP 1: Phone */}
            {step === 'phone' && (
              <>
                <Text style={styles.cardTitle}>Your phone number</Text>
                <Text style={styles.cardSub}>We'll send a verification code</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.dialCode}>🇲🇻 +960</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor={tokens.colors.textMuted}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    autoFocus
                  />
                </View>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <CTA loading={loading} onPress={submitPhone} label="Send OTP" />
              </>
            )}

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <>
                <Text style={styles.cardTitle}>Enter OTP</Text>
                <Text style={styles.cardSub}>6-digit code sent to +960 {phone}</Text>
                <View style={styles.otpRow}>
                  {otp.map((d, i) => (
                    <TextInput
                      key={i}
                      ref={(r) => { if (r) otpRefs.current[i] = r; }}
                      style={[styles.otpBox, d && styles.otpBoxFilled]}
                      value={d}
                      onChangeText={(v) => handleOtpChange(v, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>
                {loading && <ActivityIndicator color={tokens.colors.primary} style={{ marginTop: 12 }} />}
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity onPress={() => setStep('phone')} style={styles.backLink}>
                  <Text style={styles.backLinkText}>← Change number</Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: Profile */}
            {step === 'profile' && (
              <>
                <Text style={styles.cardTitle}>Your profile</Text>
                <Text style={styles.cardSub}>Passengers will see this</Text>

                <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
                  {photo
                    ? <Image source={{ uri: photo }} style={styles.photoImg} />
                    : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoIcon}>📷</Text>
                        <Text style={styles.photoLabel}>Add photo</Text>
                      </View>
                    )}
                </TouchableOpacity>

                <TextInput
                  style={styles.nameInput}
                  placeholder="Full name"
                  placeholderTextColor={tokens.colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <CTA loading={loading} onPress={submitProfile} label="Continue to Documents →" />
              </>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function CTA({ loading, onPress, label }: { loading: boolean; onPress: () => void; label: string }) {
  return (
    <TouchableOpacity style={styles.cta} onPress={onPress} disabled={loading} activeOpacity={0.85}>
      <LinearGradient colors={['#1CC7C1', '#0E7490']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.ctaText}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient:  { flex: 1 },
  kav:       { flex: 1 },
  scroll:    { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },

  header:      { alignItems: 'center', marginBottom: 32 },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  steps:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  stepDot:  {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#fff' },
  stepDotDone:   { backgroundColor: 'rgba(255,255,255,0.6)' },
  stepNum:  { fontSize: 13, fontWeight: '700', color: '#0E7490' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 6, maxWidth: 40 },
  stepLineDone: { backgroundColor: 'rgba(255,255,255,0.7)' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: tokens.colors.textPrimary, marginBottom: 6 },
  cardSub:   { fontSize: 14, color: tokens.colors.textSecondary, marginBottom: 24 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    overflow: 'hidden', marginBottom: 16,
  },
  dialCode: { paddingHorizontal: 14, fontSize: 14, fontWeight: '600', color: tokens.colors.textPrimary },
  input:    { flex: 1, padding: 14, fontSize: 16, color: tokens.colors.textPrimary },

  otpRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  otpBox:     {
    width: 44, height: 52, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    textAlign: 'center', fontSize: 20, fontWeight: '700', color: tokens.colors.textPrimary,
  },
  otpBoxFilled: { borderColor: '#1CC7C1', backgroundColor: '#F0FFFE' },

  backLink:     { alignItems: 'center', marginTop: 16 },
  backLinkText: { fontSize: 14, color: tokens.colors.primary, fontWeight: '600' },

  photoBtn: { alignSelf: 'center', marginBottom: 20 },
  photoImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#1CC7C1' },
  photoPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed',
  },
  photoIcon:  { fontSize: 28 },
  photoLabel: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },

  nameInput: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
    padding: 14, fontSize: 16, color: tokens.colors.textPrimary, marginBottom: 16,
  },

  error: { fontSize: 13, color: '#EF4444', marginBottom: 8 },

  cta:    { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  ctaGrad: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
