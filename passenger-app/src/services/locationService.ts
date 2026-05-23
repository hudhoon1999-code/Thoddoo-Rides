/**
 * locationService.ts
 * GPS, geocoding, distance, and Thoddoo-specific location utilities.
 */

import * as ExpoLocation from 'expo-location';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../shared/firebase/config';
import { Location as RideLocation } from '../../../../shared/types';
import {
  THODDOO_LOCATIONS,
  THODDOO_CENTER,
  THODDOO_BOUNDS,
  searchLocations,
} from '../../../../shared/constants/thoddoo-locations';

/** Thoddoo Island rough bounding box (padded) */
const ISLAND_BOUNDS = {
  minLat: 4.148, maxLat: 4.175,
  minLng: 72.988, maxLng: 73.003,
};

export const locationService = {
  /**
   * Request permissions and get current GPS coordinates.
   */
  async getCurrentLocation(): Promise<RideLocation> {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied. Please enable in Settings.');
    }

    const pos = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.High,
    });

    const { latitude, longitude } = pos.coords;

    // Reverse geocode to get a human-readable name
    const [place] = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
    const label = place?.name || place?.street || 'Current Location';

    return { latitude, longitude, label };
  },

  /**
   * Watch position continuously (for driver tracking in passenger app).
   * Returns a subscription that must be .remove()'d on unmount.
   */
  async watchPosition(
    callback: (loc: RideLocation) => void,
    interval = 3000
  ): Promise<ExpoLocation.LocationSubscription> {
    await ExpoLocation.requestForegroundPermissionsAsync();
    return ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
        timeInterval: interval,
        distanceInterval: 5,
      },
      (pos) => {
        callback({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'Current Location',
        });
      }
    );
  },

  /**
   * Update driver's location in Firestore (called by driver app).
   */
  async updateDriverLocation(driverId: string, loc: RideLocation): Promise<void> {
    const ref = doc(db, 'drivers', driverId);
    await updateDoc(ref, {
      currentLocation: loc,
      locationUpdatedAt: serverTimestamp(),
    });
  },

  /**
   * Search Thoddoo locations by query string.
   * Searches our curated POI list first, then falls back to Google geocode.
   */
  searchLocations(query: string, lang: 'en' | 'ru' = 'en') {
    return searchLocations(query, lang);
  },

  /**
   * Get the full curated POI list for home screen shortcuts.
   */
  getPopularLocations() {
    return THODDOO_LOCATIONS.filter((l) => l.popular);
  },

  /**
   * Calculate straight-line distance between two coords (Haversine formula).
   * Returns distance in km.
   */
  distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  /**
   * Estimate travel time in minutes on Thoddoo (island-scale).
   * Max island speed ~25km/h buggy, ~35km/h motorcycle.
   */
  estimateETA(distanceKm: number, vehicleType: 'buggy' | 'motorcycle'): number {
    const speed = vehicleType === 'motorcycle' ? 35 : 25;
    return Math.max(2, Math.round((distanceKm / speed) * 60));
  },

  /**
   * Check if a coordinate is within Thoddoo Island bounds.
   */
  isWithinThoddoo(lat: number, lng: number): boolean {
    return (
      lat >= ISLAND_BOUNDS.minLat && lat <= ISLAND_BOUNDS.maxLat &&
      lng >= ISLAND_BOUNDS.minLng && lng <= ISLAND_BOUNDS.maxLng
    );
  },

  /** Island center for map default */
  getThoddooCenter() {
    return THODDOO_CENTER;
  },
};
