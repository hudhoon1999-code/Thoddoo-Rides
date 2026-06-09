// driver-app/src/services/driverTrackingService.ts
// Driver-side Firestore location publishing and ride subscription.

import firestore from '@react-native-firebase/firestore';
import { GeoPoint, DriverStatus } from '../../../shared/types';

// Publish driver GPS location to Firestore 'locations' collection.
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

  // Keep currentLocation on the driver document in sync.
  await firestore()
    .collection('drivers')
    .doc(driverId)
    .update({
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
}

// Update driver online/offline status.
export async function updateDriverStatus(
  driverId: string,
  status: DriverStatus,
): Promise<void> {
  await firestore()
    .collection('drivers')
    .doc(driverId)
    .update({ status });
}

// Subscribe to incoming ride requests assigned to this driver.
export function subscribeToRideRequest(
  driverId: string,
  onRequest: (ride: {
    id: string;
    passengerId: string;
    pickup: { nameEn: string; coordinates: GeoPoint };
    dropoff: { nameEn: string; coordinates: GeoPoint };
    fare: number;
    vehicleType: string;
  }) => void,
): () => void {
  const unsub = firestore()
    .collection('rides')
    .where('driverId', '==', driverId)
    .where('status', '==', 'requesting')
    .onSnapshot((snap) => {
      snap.docs.forEach((doc) => {
        const d = doc.data();
        onRequest({
          id: doc.id,
          passengerId: d.passengerId,
          pickup: d.pickup,
          dropoff: d.dropoff,
          fare: d.fare,
          vehicleType: d.vehicleType,
        });
      });
    });
  return unsub;
}
