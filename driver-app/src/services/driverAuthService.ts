import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Driver } from '../../../shared/types';
import { COLLECTIONS } from '../../../shared/firebase/config';

export interface DriverRegistrationData {
  name: string;
  phone: string;
  profilePhotoUri?: string;
  nationality: 'maldivian' | 'foreigner';
  // ID docs
  idFrontUri?: string;
  idBackUri?: string;
  passportUri?: string;
  workPermitUri?: string;
  selfieUri?: string;
}

// ─── Phone OTP ──────────────────────────────────────────────────────────────

export async function sendDriverOTP(phoneNumber: string) {
  const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+960${phoneNumber}`;
  const confirmation = await auth().signInWithPhoneNumber(formatted);
  return confirmation;
}

export async function verifyDriverOTP(
  confirmation: ReturnType<typeof auth.prototype.signInWithPhoneNumber> extends Promise<infer T> ? T : never,
  code: string
) {
  const credential = await confirmation.confirm(code);
  return credential;
}

// ─── Upload helpers ──────────────────────────────────────────────────────────

async function uploadFile(uri: string, path: string): Promise<string> {
  const ref = storage().ref(path);
  await ref.putFile(uri);
  return await ref.getDownloadURL();
}

// ─── Driver profile creation ─────────────────────────────────────────────────

export async function createDriverProfile(
  uid: string,
  data: DriverRegistrationData
): Promise<void> {
  const uploads: Record<string, string> = {};

  if (data.profilePhotoUri) {
    uploads.profilePhoto = await uploadFile(
      data.profilePhotoUri,
      `drivers/${uid}/profile.jpg`
    );
  }
  if (data.idFrontUri) {
    uploads.idFront = await uploadFile(
      data.idFrontUri,
      `drivers/${uid}/id_front.jpg`
    );
  }
  if (data.idBackUri) {
    uploads.idBack = await uploadFile(
      data.idBackUri,
      `drivers/${uid}/id_back.jpg`
    );
  }
  if (data.passportUri) {
    uploads.passport = await uploadFile(
      data.passportUri,
      `drivers/${uid}/passport.jpg`
    );
  }
  if (data.workPermitUri) {
    uploads.workPermit = await uploadFile(
      data.workPermitUri,
      `drivers/${uid}/work_permit.jpg`
    );
  }
  if (data.selfieUri) {
    uploads.selfie = await uploadFile(
      data.selfieUri,
      `drivers/${uid}/selfie.jpg`
    );
  }

  const driverDoc: Omit<Driver, 'vehicle'> & { vehicle: null } = {
    id: uid,
    name: data.name,
    phone: data.phone,
    profilePhoto: uploads.profilePhoto || '',
    approvalStatus: 'pending',
    isOnline: false,
    rating: 0,
    totalRides: 0,
    earnings: 0,
    vehicle: null,
    documents: {
      nationality: data.nationality,
      idFront: uploads.idFront,
      idBack: uploads.idBack,
      passport: uploads.passport,
      workPermit: uploads.workPermit,
      selfie: uploads.selfie,
    },
    location: { latitude: 4.1603, longitude: 72.9949 },
    createdAt: firestore.FieldValue.serverTimestamp() as any,
  };

  await firestore()
    .collection(COLLECTIONS.DRIVERS)
    .doc(uid)
    .set(driverDoc);
}

// ─── Fetch driver profile ────────────────────────────────────────────────────

export async function fetchDriverProfile(uid: string): Promise<Driver | null> {
  const snap = await firestore()
    .collection(COLLECTIONS.DRIVERS)
    .doc(uid)
    .get();

  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Driver;
}

// ─── Check if driver exists ──────────────────────────────────────────────────

export async function checkDriverExists(uid: string): Promise<boolean> {
  const snap = await firestore()
    .collection(COLLECTIONS.DRIVERS)
    .doc(uid)
    .get();
  return snap.exists;
}

// ─── Sign out ────────────────────────────────────────────────────────────────

export async function signOutDriver(): Promise<void> {
  const uid = auth().currentUser?.uid;
  if (uid) {
    await firestore()
      .collection(COLLECTIONS.DRIVERS)
      .doc(uid)
      .update({ isOnline: false, status: 'offline' });
  }
  await auth().signOut();
}

// ─── Update FCM token ────────────────────────────────────────────────────────

export async function updateDriverFCMToken(
  uid: string,
  token: string
): Promise<void> {
  await firestore()
    .collection(COLLECTIONS.DRIVERS)
    .doc(uid)
    .update({ fcmToken: token });
}
