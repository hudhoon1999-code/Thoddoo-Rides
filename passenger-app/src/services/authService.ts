/**
 * authService.ts
 * Firebase Phone Authentication + Firestore passenger profile
 */

import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/../../../shared/firebase/config';
import { Passenger } from '../../../shared/types';

// Firebase auth instance
const auth = getAuth();

// Verifier stored for OTP session
let _verificationId: string | null = null;

/**
 * Send OTP to phone number.
 * On web (admin / testing): uses invisible reCAPTCHA
 * On native Expo: uses FirebaseRecaptchaVerifierModal from expo-firebase-recaptcha
 */
export const authService = {
  /**
   * Send OTP via Firebase Phone Auth
   * verifierOrElement: RecaptchaVerifier on web, or the expo verifier ref on native
   */
  async sendOTP(phoneNumber: string, verifier?: RecaptchaVerifier): Promise<void> {
    const provider = new PhoneAuthProvider(auth);

    if (verifier) {
      // Web / Expo-web flow
      _verificationId = await provider.verifyPhoneNumber(phoneNumber, verifier);
    } else {
      // Native flow — expo-firebase-recaptcha handles this internally
      // In real implementation, use FirebaseRecaptchaVerifierModal ref
      // Here we mock the ID for scaffold purposes
      _verificationId = `mock-${phoneNumber}-${Date.now()}`;
    }
  },

  /**
   * Verify 6-digit OTP and sign the user in.
   * Returns the passenger profile (creates if first time).
   */
  async verifyOTP(phone: string, code: string): Promise<Passenger> {
    if (!_verificationId) {
      throw new Error('No verification ID found. Please request OTP first.');
    }

    try {
      const credential = PhoneAuthProvider.credential(_verificationId, code);
      const result = await signInWithCredential(auth, credential);
      const uid = result.user.uid;

      // Get or create passenger profile in Firestore
      const ref  = doc(db, 'passengers', uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // First login — create profile
        const newPassenger: Partial<Passenger> = {
          id: uid,
          phone,
          name: '',
          profilePhoto: '',
          createdAt: serverTimestamp() as any,
          language: 'en',
          totalRides: 0,
          savedLocations: [],
          isActive: true,
        };
        await setDoc(ref, newPassenger);
        return newPassenger as Passenger;
      } else {
        await updateDoc(ref, { lastLoginAt: serverTimestamp() });
        return { id: uid, ...snap.data() } as Passenger;
      }
    } catch (e: any) {
      if (e.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid verification code. Please check and try again.');
      }
      if (e.code === 'auth/code-expired') {
        throw new Error('Code expired. Please request a new one.');
      }
      throw e;
    }
  },

  /**
   * Update passenger display name (after first OTP sign-in)
   */
  async updateProfile(uid: string, data: { name?: string; language?: string }): Promise<void> {
    const ref = doc(db, 'passengers', uid);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await signOut(auth);
    _verificationId = null;
  },

  /**
   * Get current Firebase user
   */
  getCurrentUser() {
    return auth.currentUser;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: any) => void) {
    return auth.onAuthStateChanged(callback);
  },
};
