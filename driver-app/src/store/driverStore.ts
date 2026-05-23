import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
import { Driver, RideRequest, Coordinates } from '../../../shared/types';

export type DriverStatus = 'offline' | 'available' | 'on_trip';

interface ActiveRide {
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoords: Coordinates;
  dropoffCoords: Coordinates;
  fare: number;
  commission: number;
  driverEarnings: number;
  vehicleType: string;
  status: 'accepted' | 'driver_arrived' | 'in_progress' | 'completed';
  startTime?: Date;
}

interface EarningSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalRides: number;
  completedToday: number;
}

interface DriverState {
  // Profile
  driver: Driver | null;
  isApproved: boolean;
  isPendingApproval: boolean;

  // Status
  status: DriverStatus;
  currentLocation: Coordinates | null;

  // Incoming request
  incomingRequest: RideRequest | null;
  requestCountdown: number;

  // Active ride
  activeRide: ActiveRide | null;

  // Earnings
  earnings: EarningSummary;

  // UI
  isLoading: boolean;
  error: string | null;

  // Actions
  setDriver: (driver: Driver) => void;
  setStatus: (status: DriverStatus) => void;
  setCurrentLocation: (coords: Coordinates) => void;
  setIncomingRequest: (request: RideRequest | null) => void;
  setRequestCountdown: (seconds: number) => void;
  acceptRide: (rideId: string) => Promise<void>;
  declineRide: (rideId: string) => Promise<void>;
  markArrived: (rideId: string) => Promise<void>;
  startTrip: (rideId: string) => Promise<void>;
  completeTrip: (rideId: string) => Promise<void>;
  setActiveRide: (ride: ActiveRide | null) => void;
  updateEarnings: (summary: EarningSummary) => void;
  goOnline: (driverId: string) => Promise<void>;
  goOffline: (driverId: string) => Promise<void>;
  reset: () => void;
}

const initialEarnings: EarningSummary = {
  today: 0,
  thisWeek: 0,
  thisMonth: 0,
  totalRides: 0,
  completedToday: 0,
};

export const useDriverStore = create<DriverState>((set, get) => ({
  driver: null,
  isApproved: false,
  isPendingApproval: false,
  status: 'offline',
  currentLocation: null,
  incomingRequest: null,
  requestCountdown: 30,
  activeRide: null,
  earnings: initialEarnings,
  isLoading: false,
  error: null,

  setDriver: (driver) => set({
    driver,
    isApproved: driver.approvalStatus === 'approved',
    isPendingApproval: driver.approvalStatus === 'pending',
  }),

  setStatus: (status) => set({ status }),

  setCurrentLocation: (coords) => set({ currentLocation: coords }),

  setIncomingRequest: (request) => set({
    incomingRequest: request,
    requestCountdown: 30,
  }),

  setRequestCountdown: (seconds) => set({ requestCountdown: seconds }),

  acceptRide: async (rideId) => {
    const { driver } = get();
    if (!driver) return;

    set({ isLoading: true });
    try {
      await firestore().collection('rides').doc(rideId).update({
        status: 'accepted',
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverPhoto: driver.profilePhoto || '',
        vehicleType: driver.vehicle?.type || 'motorcycle',
        acceptedAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore().collection('drivers').doc(driver.id).update({
        currentRideId: rideId,
        status: 'on_trip',
      });

      set({ status: 'on_trip', incomingRequest: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  declineRide: async (rideId) => {
    const { driver } = get();
    if (!driver) return;

    try {
      await firestore().collection('rides').doc(rideId).update({
        declinedDrivers: firestore.FieldValue.arrayUnion(driver.id),
        status: 'searching',
      });
      set({ incomingRequest: null });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  markArrived: async (rideId) => {
    set({ isLoading: true });
    try {
      await firestore().collection('rides').doc(rideId).update({
        status: 'driver_arrived',
        arrivedAt: firestore.FieldValue.serverTimestamp(),
      });
      set((state) => ({
        activeRide: state.activeRide
          ? { ...state.activeRide, status: 'driver_arrived' }
          : null,
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  startTrip: async (rideId) => {
    set({ isLoading: true });
    try {
      await firestore().collection('rides').doc(rideId).update({
        status: 'in_progress',
        startTime: firestore.FieldValue.serverTimestamp(),
      });
      set((state) => ({
        activeRide: state.activeRide
          ? { ...state.activeRide, status: 'in_progress', startTime: new Date() }
          : null,
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  completeTrip: async (rideId) => {
    const { driver } = get();
    if (!driver) return;

    set({ isLoading: true });
    try {
      await firestore().collection('rides').doc(rideId).update({
        status: 'completed',
        completedAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore().collection('drivers').doc(driver.id).update({
        currentRideId: null,
        status: 'available',
      });

      set({
        activeRide: null,
        status: 'available',
      });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveRide: (ride) => set({ activeRide: ride }),

  updateEarnings: (summary) => set({ earnings: summary }),

  goOnline: async (driverId) => {
    set({ isLoading: true });
    try {
      await firestore().collection('drivers').doc(driverId).update({
        status: 'available',
        isOnline: true,
        lastOnlineAt: firestore.FieldValue.serverTimestamp(),
      });
      set({ status: 'available' });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  goOffline: async (driverId) => {
    set({ isLoading: true });
    try {
      await firestore().collection('drivers').doc(driverId).update({
        status: 'offline',
        isOnline: false,
      });
      set({ status: 'offline' });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({
    driver: null,
    isApproved: false,
    isPendingApproval: false,
    status: 'offline',
    currentLocation: null,
    incomingRequest: null,
    requestCountdown: 30,
    activeRide: null,
    earnings: initialEarnings,
    isLoading: false,
    error: null,
  }),
}));
