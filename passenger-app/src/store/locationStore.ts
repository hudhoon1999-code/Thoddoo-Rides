// passenger-app/src/store/locationStore.ts
import { create } from 'zustand';
import { ThoddooLocation } from '../types';

interface LocationState {
  pickup: ThoddooLocation | null;
  dropoff: ThoddooLocation | null;
  setPickup: (location: ThoddooLocation | null) => void;
  setDropoff: (location: ThoddooLocation | null) => void;
  clearLocations: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  pickup: null,
  dropoff: null,
  setPickup: (location) => set({ pickup: location }),
  setDropoff: (location) => set({ dropoff: location }),
  clearLocations: () => set({ pickup: null, dropoff: null }),
}));
