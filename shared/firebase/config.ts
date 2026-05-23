import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDZOGCBkpPPFG_qR72SQb3asJD3iX_19QM",
  authDomain: "thoddoo-rides.firebaseapp.com",
  projectId: "thoddoo-rides",
  storageBucket: "thoddoo-rides.firebasestorage.app",
  messagingSenderId: "1001895288673",
  appId: "1:1001895288673:web:6d8915d58097ee54432f20",
  measurementId: "G-60WYR4LHGY",
};

// Guard against double-init (hot reload / SSR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Analytics is browser-only; silently skipped in non-browser envs
export const analyticsPromise = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);

// ─── FIRESTORE COLLECTION NAMES ──────────────────────────────

export const COLLECTIONS = {
  PASSENGERS:      'passengers',
  DRIVERS:         'drivers',
  VEHICLES:        'vehicles',
  RIDES:           'rides',
  EVENTS:          'events',
  ACTIVITIES:      'activities',
  PRICING:         'pricing',
  NOTIFICATIONS:   'notifications',
  ADMIN_ACTIONS:   'admin_actions',
  DRIVER_EARNINGS: 'driver_earnings',
  LOCATIONS:       'locations',
} as const;

// ─── STORAGE PATHS ───────────────────────────────────────────

export const STORAGE_PATHS = {
  DRIVER_DOCS:     (driverId: string, docType: string) =>
    `drivers/${driverId}/documents/${docType}`,
  DRIVER_SELFIES:  (driverId: string) =>
    `drivers/${driverId}/selfies/${Date.now()}.jpg`,
  VEHICLE_PHOTOS:  (vehicleId: string) =>
    `vehicles/${vehicleId}/photo.jpg`,
  EVENT_IMAGES:    (eventId: string) =>
    `events/${eventId}/cover.jpg`,
  ACTIVITY_IMAGES: (activityId: string) =>
    `activities/${activityId}/cover.jpg`,
  PROFILE_PHOTOS:  (userId: string) =>
    `profiles/${userId}/avatar.jpg`,
} as const;
