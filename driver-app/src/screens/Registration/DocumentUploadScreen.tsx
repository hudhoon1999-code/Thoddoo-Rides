import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { tokens } from '../../src/theme/tokens';

type NationalityType = 'maldivian' | 'foreigner';
type DocStatus = 'empty' | 'uploaded' | 'uploading';

interface DocSlot {
  key: string;
  label: string;
  subtitle: string;
  emoji: string;
  uri: string | null;
  status: DocStatus;
}

export default function DocumentUploadScreen() {
  const [nationality, setNationality] = useState<NationalityType>('maldivian');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [maldivianDocs, setMaldivianDocs] = useState<DocSlot[]>([
    { key: 'id_front', label: 'National ID — Front', subtitle: 'Clear photo of the front side', emoji: '🪪', uri: null, status: 'empty' },
    { key: 'id_back',  label: 'National ID — Back',  subtitle: 'Clear photo of the back side',  emoji: '🪪', uri: null, status: 'empty' },
  ]);

  const [foreignerDocs, setForeignerDocs] = useState<DocSlot[]>([
    { key: 'passport',    label: 'Passport',     subtitle: 'Photo page with details visible', emoji: '📘', uri: null, status: 'empty' },
    { key: 'work_permit', label: 'Work Permit',  subtitle: 'Valid Maldives work permit',       emoji: '📋', uri: null, status: 'empty' },
  ]);

  const activeDocs = nationality === 'maldivian' ? maldivianDocs : foreignerDocs;
  const setActiveDocs = nationality === 'maldivian' ? setMaldivianDocs : setForeignerDocs;

  const pickImage = async (key: string) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.85,
    });
    if (!result.canceled) {
      setActiveDocs((prev) =>
        prev.map((d) =>
          d.key === key ? { ...d, uri: result.assets[0].uri, status: 'uploaded' } : d
        )
      );
    }
  };

  const takeSelfie = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (!result.canceled) setSelfieUri(result.assets[0].uri);
  };

  const allUploaded = activeDocs.every((d) => d.status === 'uploaded') && selfieUri !== null;

  const handleSubmit = async () => {
    if (!allUploaded) {
      Alert.alert('Missing documents', 'Please upload all required documents including the selfie.');
      return;
    }
    setSubmitting(true);
    // TODO: upload docs to Firebase Storage, update driver record
    setTimeout(() => {
      setSubmitting(false);
      router.push('/registration/vehicle');
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0E7490', '#1CC7C1']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Docs</Text>
        <Text style={styles.headerSub}>Required to start driving</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Nationality toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>I am a…</Text>
          <View style={styles.toggleRow}>
            {(['maldivian', 'foreigner'] as NationalityType[]).map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.toggleBtn, nationality === n && styles.toggleBtnActive]}
                onPress={() => setNationality(n)}
              >
                <Text style={styles.toggleEmoji}>{n === 'maldivian' ? '🇲🇻' : '🌍'}</Text>
                <Text style={[styles.toggleLabel, nationality === n && styles.toggleLabelActive]}>
                  {n === 'maldivian' ? 'Maldivian' : 'Foreigner'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Doc uploads */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Identity Documents</Text>
          {activeDocs.map((doc) => (
            <TouchableOpacity
              key={doc.key}
              style={[styles.docCard, doc.status === 'uploaded' && styles.docCardDone]}
              onPress={() => pickImage(doc.key)}
              activeOpacity={0.8}
            >
              {doc.uri ? (
                <Image source={{ uri: doc.uri }} style={styles.docThumb} />
              ) : (
                <View style={styles.docPlaceholder}>
                  <Text style={styles.docEmoji}>{doc.emoji}</Text>
                </View>
              )}
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
              </View>
              <View style={[styles.docStatus, doc.status === 'uploaded' && styles.docStatusDone]}>
                <Text style={styles.docStatusIcon}>
                  {doc.status === 'uploaded' ? '✓' : '📷'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live selfie */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Live Selfie Verification</Text>
          <Text style={styles.sectionHint}>
            Take a live selfie holding your ID. Must be in good lighting.
          </Text>
          <TouchableOpacity
            style={[styles.selfieCard, selfieUri && styles.selfieCardDone]}
            onPress={takeSelfie}
          >
            {selfieUri ? (
              <Image source={{ uri: selfieUri }} style={styles.selfieImg} />
            ) : (
              <View style={styles.selfiePlaceholder}>
                <Text style={styles.selfieEmoji}>🤳</Text>
                <Text style={styles.selfieLabel}>Tap to take selfie</Text>
                <Text style={styles.selfieSub}>Hold your ID next to your face</Text>
              </View>
            )}
            {selfieUri && (
              <View style={styles.selfieCheck}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Pending notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeEmoji}>⏳</Text>
          <Text style={styles.noticeText}>
            After submission, your account will be reviewed by Thoddoo Rides admin within 24 hours.
            You'll receive a notification once approved.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !allUploaded && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!allUploaded || submitting}
        >
          <LinearGradient
            colors={allUploaded ? ['#1CC7C1', '#0E7490'] : ['#CBD5E0', '#A0AEC0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.submitGrad}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Submit for Review →</Text>}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#F8F4EC' },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { marginBottom: 12 },
  backIcon: { fontSize: 22, color: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  section:      { marginTop: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: tokens.colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  sectionHint:  { fontSize: 13, color: tokens.colors.textSecondary, marginBottom: 12, lineHeight: 18 },

  toggleRow:      { flexDirection: 'row', gap: 10 },
  toggleBtn:      {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 14, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#E2E8F0',
  },
  toggleBtnActive:  { borderColor: '#1CC7C1', backgroundColor: '#F0FFFE' },
  toggleEmoji:      { fontSize: 20 },
  toggleLabel:      { fontSize: 14, fontWeight: '600', color: tokens.colors.textSecondary },
  toggleLabelActive: { color: '#0E7490' },

  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  docCardDone: { borderColor: '#1CC7C1' },
  docThumb:    { width: 56, height: 56, borderRadius: 10 },
  docPlaceholder: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  docEmoji:    { fontSize: 28 },
  docInfo:     { flex: 1 },
  docLabel:    { fontSize: 14, fontWeight: '700', color: tokens.colors.textPrimary, marginBottom: 3 },
  docSubtitle: { fontSize: 12, color: tokens.colors.textSecondary },
  docStatus:   {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  docStatusDone: { backgroundColor: '#D1FAE5' },
  docStatusIcon: { fontSize: 16 },

  selfieCard: {
    height: 180, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#E2E8F0',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  selfieCardDone: { borderStyle: 'solid', borderColor: '#1CC7C1' },
  selfieImg:   { width: '100%', height: '100%' },
  selfiePlaceholder: { alignItems: 'center' },
  selfieEmoji: { fontSize: 40, marginBottom: 8 },
  selfieLabel: { fontSize: 15, fontWeight: '700', color: tokens.colors.textPrimary, marginBottom: 4 },
  selfieSub:   { fontSize: 13, color: tokens.colors.textSecondary },
  selfieCheck: {
    position: 'absolute', bottom: 12, right: 12,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#1CC7C1', alignItems: 'center', justifyContent: 'center',
  },

  notice: {
    flexDirection: 'row', gap: 12, marginTop: 20,
    backgroundColor: '#FFF7ED', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#FED7AA',
  },
  noticeEmoji: { fontSize: 22 },
  noticeText:  { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 },

  submitBtn:         { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  submitBtnDisabled: { opacity: 0.6 },
  submitGrad:        { paddingVertical: 17, alignItems: 'center' },
  submitText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
});
