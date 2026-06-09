// passenger-app/src/store/mapStore.ts
import { create } from 'zustand';
import { GeoPoint } from '../../../shared/types';
import type { RouteResult } from '../services/routingService';
import type { LiveDriver } from '../services/driverTrackingService';

interface MapState {
  // Route
  activeRoute: RouteResult | null;
  isRouteFetching: boolean;
  // Drivers
  nearbyDrivers: LiveDriver[];
  assignedDriver: LiveDriver | null;
  assignedDriverLocation: GeoPoint | null;
  // UI
  mapTheme: 'light' | 'dark';
  showPOIs: boolean;
  showNearbyDrivers: boolean;
  // Actions
  setActiveRoute: (route: RouteResult | null) => void;
  setRouteFetching: (v: boolean) => void;
  setNearbyDrivers: (drivers: LiveDriver[]) => void;
  setAssignedDriver: (driver: LiveDriver | null) => void;
  setAssignedDriverLocation: (loc: GeoPoint | null) => void;
  setMapTheme: (theme: 'light' | 'dark') => void;
  togglePOIs: () => void;
  toggleNearbyDrivers: () => void;
  resetRide: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  activeRoute: null,
  isRouteFetching: false,
  nearbyDrivers: [],
  assignedDriver: null,
  assignedDriverLocation: null,
  mapTheme: 'light',
  showPOIs: true,
  showNearbyDrivers: true,

  setActiveRoute: (route) => set({ activeRoute: route }),
  setRouteFetching: (v) => set({ isRouteFetching: v }),
  setNearbyDrivers: (drivers) => set({ nearbyDrivers: drivers }),
  setAssignedDriver: (driver) => set({ assignedDriver: driver }),
  setAssignedDriverLocation: (loc) => set({ assignedDriverLocation: loc }),
  setMapTheme: (theme) => set({ mapTheme: theme }),
  togglePOIs: () => set((s) => ({ showPOIs: !s.showPOIs })),
  toggleNearbyDrivers: () => set((s) => ({ showNearbyDrivers: !s.showNearbyDrivers })),
  resetRide: () => set({
    activeRoute: null,
    assignedDriver: null,
    assignedDriverLocation: null,
  }),
}));
