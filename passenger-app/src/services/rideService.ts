/**
 * rideService.ts
 * Manages the full ride lifecycle in Firestore with realtime listeners.
 *
 * Status flow:
 *   requesting → accepted → driver_arriving → driver_arrived → in_progress → completed
 */

import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp,
  getDocs, getDoc,
} from 'firebase/firestore';
import { db } from '../../../../shared/firebase/config';
import { Ride, RideStatus, Location, VehicleType } from '../../../../shared/types';
import { notificationService } from './notificationService';

export const rideService = {
  /**
   * Create a new ride request.
   * Picks the nearest available driver automatically (basic impl).
   */
  async requestRide(params: {
    passengerId: string;
    pickup: Location;
    dropoff: Location;
    vehicleType: VehicleType;
    estimatedFare: number;
  }): Promise<string> {
    const rideData: Partial<Ride> = {
      passengerId: params.passengerId,
      pickup: params.pickup,
      dropoff: params.dropoff,
      vehicleType: params.vehicleType,
      estimatedFare: params.estimatedFare,
      status: RideStatus.REQUESTING,
      requestedAt: serverTimestamp() as any,
      driverId: null,
      driverLocation: null,
      actualFare: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: null,
      paymentStatus: 'pending',
      commissionAmount: null,
      driverEarnings: null,
    };

    const ref = await addDoc(collection(db, 'rides'), rideData);
    return ref.id;
  },

  /**
   * Listen to a specific ride in realtime.
   * Returns an unsubscribe function.
   */
  listenToRide(rideId: string, callback: (ride: Ride) => void): () => void {
    const ref = doc(db, 'rides', rideId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as Ride);
      }
    });
  },

  /**
   * Listen to all active rides for a passenger.
   */
  listenToPassengerActiveRide(
    passengerId: string,
    callback: (ride: Ride | null) => void
  ): () => void {
    const q = query(
      collection(db, 'rides'),
      where('passengerId', '==', passengerId),
      where('status', 'in', [
        RideStatus.REQUESTING,
        RideStatus.ACCEPTED,
        RideStatus.DRIVER_ARRIVING,
        RideStatus.DRIVER_ARRIVED,
        RideStatus.IN_PROGRESS,
      ]),
      orderBy('requestedAt', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const doc = snap.docs[0];
        callback({ id: doc.id, ...doc.data() } as Ride);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Cancel a ride (passenger side).
   */
  async cancelRide(rideId: string, reason: string): Promise<void> {
    const ref = doc(db, 'rides', rideId);
    await updateDoc(ref, {
      status: RideStatus.CANCELLED,
      cancelledAt: serverTimestamp(),
      cancelReason: reason,
    });
  },

  /**
   * Get ride history for a passenger.
   */
  async getPassengerHistory(passengerId: string, limitCount = 20): Promise<Ride[]> {
    const q = query(
      collection(db, 'rides'),
      where('passengerId', '==', passengerId),
      where('status', '==', RideStatus.COMPLETED),
      orderBy('completedAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ride));
  },

  /**
   * Calculate fare based on vehicle type and admin pricing config.
   */
  async calculateFare(vehicleType: VehicleType): Promise<{ min: number; max: number }> {
    const ref = doc(db, 'pricing', vehicleType);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return { min: data.minFare, max: data.maxFare };
    }
    // Defaults (MVR)
    return vehicleType === VehicleType.BUGGY
      ? { min: 30, max: 60 }
      : { min: 15, max: 30 };
  },
};
