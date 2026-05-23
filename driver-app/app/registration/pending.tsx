import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useDriverStore } from '../../src/store/driverStore';

const COLORS = {
  teal: '#1CC7C1', ocean: '#0E7490', coral: '#FF7A59',
  sand: '#F8F4EC', dark: '#0F172A', gray: '#64748B', white: '#FFFFFF',
};

export default function PendingScreen() {
  const router = useRouter();
  const { driver, setDriver } = useDriverStore();

  // Poll Firestore for approval status change
  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('drivers')
      .doc(uid)
      .onSnapshot((snap) => {
        if (snap.exists) {
          const data = snap.data();
          if (data?.approvalStatus === 'approved') {
            setDriver({ ...driver!, approvalStatus: 'approved' });
            router.replace('/(tabs)/home');
          }
        }
      });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await auth().signOut();
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⏳</Text>
        </View>

        <Text style={styles.title}>Application Under Review</Text>
        <Text style={styles.subtitle}>
          Your driver application is being reviewed by the Thoddoo Rides team.
          This usually takes{' '}
          <Text style={{ fontWeight: '700', color: COLORS.teal }}>1–2 hours</Text>{' '}
          during working hours.
        </Text>

        {/* Status steps */}
        <View style={styles.steps}>
          {[
            { label: 'Application submitted', done: true },
            { label: 'Documents verified', done: false },
            { label: 'Vehicle inspection', done: false },
            { label: 'Account activated', done: false },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                {step.done && <Text style={styles.stepCheck}>✓</Text>}
              </View>
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Need help?</Text>
          <Text style={styles.contactText}>
            Contact us on WhatsApp for faster support
          </Text>
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => Linking.openURL('https://wa.me/9609601234')}
          >
            <Text style={styles.whatsappLabel}>💬 WhatsApp Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutLabel}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  steps: {
    width: '100%',
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: COLORS.teal,
  },
  stepCheck: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  stepLabelDone: {
    color: COLORS.dark,
    fontWeight: '600',
  },
  contactBox: {
    backgroundColor: '#F0FFFE',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.teal + '30',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  whatsappLabel: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  signOutBtn: {
    paddingVertical: 12,
  },
  signOutLabel: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '500',
  },
});
