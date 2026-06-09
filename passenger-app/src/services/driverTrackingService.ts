// passenger-app/src/services/driverTrackingService.ts
// Real-time driver location & availability via Firestore onSnapshot.

import firestore from '@react-native-firebase/firestore';
import { GeoPoint, DriverStatus } from '../../../shared/types';

export interface LiveDriver {
  id: string;
  name: string;
  driverCode: string;
  vehicleType: string;
  rating: number;
  location: GeoPoint;
  status: 'available' | 'busy' | 'offline';
}

// Subscribe to all available / on-trip drivers (for passenger map).
export function subscribeToNearbyDrivers(
  onUpdate: (drivers: LiveDriver[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const unsub = firestore()
    .collection('drivers')
    .where('status', 'in', [DriverStatus.AVAILABLE, DriverStatus.ON_TRIP])
    .onSnapshot(
      (snap) => {
        const drivers: LiveDriver[] = snap.docs
          .map((doc) => {
            const d = doc.data();
            if (!d.currentLocation?.latitude) return null;
            return {
              id: doc.id,
              name: d.name ?? 'Driver',
              driverCode: d.driverCode ?? '',
              vehicleType: d.vehicle?.type ?? 'buggy_6',
              rating: d.rating ?? 5.0,
              location: {
                latitude: d.currentLocation.latitude,
                longitude: d.currentLocation.longitude,
              },
              status: d.status,
            } as LiveDriver;
          })
          .filter(Boolean) as LiveDriver[];
        onUpdate(drivers);
      },
      (err) => onError?.(err),
    );
  return unsub;
}

// Subscribe to a single driver's location (for active ride tracking).
export function subscribeToDriverLocation(
  driverId: string,
  onUpdate: (location: GeoPoint) => void,
  onError?: (err: Error) => void,
): () => void {
  const unsub = firestore()
    .collection('locations')
    .doc(driverId)
    .onSnapshot(
      (doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        if (data?.latitude != null && data?.longitude != null) {
          onUpdate({ latitude: data.latitude, longitude: data.longitude });
        }
      },
      (err) => onError?.(err),
    );
  return unsub;
}

// Publish driver location (called from driver app).
export async function updateDriverLocation(
  driverId: string,
  location: GeoPoint,
): Promise<void> {
  await firestore()
    .collection('locations')
    .doc(driverId)
    .set(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

// Get a single driver's public profile (for tracking screen).
export async function getDriverProfile(driverId: string): Promise<LiveDriver | null> {
  const doc = await firestore().collection('drivers').doc(driverId).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: doc.id,
    name: d.name ?? 'Driver',
    driverCode: d.driverCode ?? '',
    vehicleType: d.vehicle?.type ?? 'buggy_6',
    rating: d.rating ?? 5.0,
    location: d.currentLocation ?? { latitude: 4.1603, longitude: 72.9949 },
    status: d.status ?? 'available',
  };
}
