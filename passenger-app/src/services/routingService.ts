// passenger-app/src/services/routingService.ts
// OSRM-based routing for Thoddoo Island. Falls back to island-aware
// straight-line route if OSRM returns no result.
//
// Production note: Replace the public OSRM demo server with a dedicated
// instance or GraphHopper/OpenRouteService for reliability.

import { GeoPoint } from '../../../shared/types';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const REQUEST_TIMEOUT_MS = 8000;

export interface RouteResult {
  coordinates: GeoPoint[];
  distanceKm: number;
  durationMin: number;
}

export async function getRoute(
  origin: GeoPoint,
  destination: GeoPoint,
): Promise<RouteResult | null> {
  const url =
    `${OSRM_BASE}/${origin.longitude.toFixed(6)},${origin.latitude.toFixed(6)};` +
    `${destination.longitude.toFixed(6)},${destination.latitude.toFixed(6)}` +
    `?overview=full&geometries=geojson&steps=false`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      return buildFallbackRoute(origin, destination);
    }

    const route = data.routes[0];
    const coords: GeoPoint[] = route.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => ({ latitude: lat, longitude: lon }),
    );

    return {
      coordinates: coords,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return buildFallbackRoute(origin, destination);
  }
}

// Straight-line fallback with distance estimation (haversine).
function buildFallbackRoute(from: GeoPoint, to: GeoPoint): RouteResult {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const durationMin = (distanceKm / 15) * 60; // assume 15 km/h island speed

  return {
    coordinates: [from, to],
    distanceKm,
    durationMin,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
