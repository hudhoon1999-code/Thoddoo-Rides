/**
 * rideStore.ts
 * Global state for active ride, vehicle selection, and booking flow.
 */

import { create } from 'zustand';
import { Ride, RideStatus, Location, VehicleType } from '../../../../shared/types';
import { rideService } from '../services/rideService';

interface RideState {
  // Booking inputs
  pickup:      Location | null;
  dropoff:     Location | null;
  vehicleType: VehicleType;
  fareRange:   { min: number; max: number } | null;

  // Active ride
  activeRide:    Ride | null;
  rideListener:  (() => void) | null;

  // Booking flow UI
  isRequesting: boolean;
  requestError: string | null;

  // Actions
  setPickup:      (loc: Location | null) => void;
  setDropoff:     (loc: Location | null) => void;
  setVehicleType: (type: VehicleType) => void;
  setFareRange:   (range: { min: number; max: number }) => void;

  requestRide:    (passengerId: string) => Promise<string>;
  cancelRide:     (reason?: string) => Promise<void>;
  clearRide:      () => void;

  // Listen to active ride updates
  startListeningToRide: (rideId: string) => void;
  stopListeningToRide:  () => void;

  // Listen to passenger's current active ride
  startListeningToPassengerRide: (passengerId: string) => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  pickup:      null,
  dropoff:     null,
  vehicleType: VehicleType.BUGGY,
  fareRange:   null,
  activeRide:  null,
  rideListener: null,
  isRequesting: false,
  requestError: null,

  setPickup:      (loc) => set({ pickup: loc }),
  setDropoff:     (loc) => set({ dropoff: loc }),
  setVehicleType: (type) => set({ vehicleType: type }),
  setFareRange:   (range) => set({ fareRange: range }),

  requestRide: async (passengerId) => {
    const { pickup, dropoff, vehicleType, fareRange } = get();
    if (!pickup || !dropoff) throw new Error('Pickup and dropoff are required');

    set({ isRequesting: true, requestError: null });
    try {
      const rideId = await rideService.requestRide({
        passengerId,
        pickup,
        dropoff,
        vehicleType,
        estimatedFare: fareRange?.max ?? 0,
      });

      // Start listening to this ride
      get().startListeningToRide(rideId);
      return rideId;
    } catch (e: any) {
      set({ requestError: e.message });
      throw e;
    } finally {
      set({ isRequesting: false });
    }
  },

  cancelRide: async (reason = 'Cancelled by passenger') => {
    const { activeRide, rideListener } = get();
    if (!activeRide) return;
    await rideService.cancelRide(activeRide.id, reason);
    rideListener?.();
    set({ activeRide: null, rideListener: null });
  },

  clearRide: () => {
    get().rideListener?.();
    set({ activeRide: null, rideListener: null, pickup: null, dropoff: null });
  },

  startListeningToRide: (rideId) => {
    // Unsubscribe previous if any
    get().rideListener?.();

    const unsubscribe = rideService.listenToRide(rideId, (ride) => {
      set({ activeRide: ride });
      // If completed/cancelled, stop listening
      if (
        ride.status === RideStatus.COMPLETED ||
        ride.status === RideStatus.CANCELLED
      ) {
        setTimeout(() => get().stopListeningToRide(), 3000);
      }
    });

    set({ rideListener: unsubscribe });
  },

  stopListeningToRide: () => {
    get().rideListener?.();
    set({ rideListener: null });
  },

  startListeningToPassengerRide: (passengerId) => {
    get().rideListener?.();
    const unsubscribe = rideService.listenToPassengerActiveRide(
      passengerId,
      (ride) => set({ activeRide: ride })
    );
    set({ rideListener: unsubscribe });
  },
}));
