// driver-app/src/components/map/ThoddooMapView.tsx
// Driver-specific map: shows own live location, pickup/dropoff pins, and route.
// Publishes location to Firestore on each GPS update.

import React, {
  useRef, useEffect, useState, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StyleProp, ViewStyle, Platform, ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker, Polyline, UrlTile,
  Region, PROVIDER_GOOGLE,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Spacing, Radii, Shadows } from '../../theme/tokens';
import { GeoPoint } from '../../../../shared/types';
import {
  THODDOO_REAL_CENTER, HOTELS, RESTAURANTS, ROAD_COORDINATES,
} from '../../../../shared/constants/thoddoo-map-data';

// ─── Types ────────────────────────────────────────────────────

interface RouteResult {
  coordinates: GeoPoint[];
  distanceKm: number;
  durationMin: number;
}

export interface DriverMapViewProps {
  driverId?: string;
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  activeRoute?: RouteResult | null;
  isOnline: boolean;
  onLocationUpdate?: (location: GeoPoint) => void;
  showControls?: boolean;
  style?: StyleProp<ViewStyle>;
  mapHeight?: number;
}

// ─── Constants ────────────────────────────────────────────────

const THODDOO_REGION: Region = {
  latitude:      THODDOO_REAL_CENTER.latitude,
  longitude:     THODDOO_REAL_CENTER.longitude,
  latitudeDelta:  0.016,
  longitudeDelta: 0.016,
};

const TILE_LIGHT = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

// ─── Component ────────────────────────────────────────────────

export default function DriverMapView({
  driverId,
  pickup,
  dropoff,
  activeRoute,
  isOnline,
  onLocationUpdate,
  showControls = true,
  style,
  mapHeight,
}: DriverMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [myLocation, setMyLocation] = useState<GeoPoint | null>(null);
  const [isReady, setIsReady] = useState(false);

  // ── GPS + Firestore location publishing ───────────────────
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setMyLocation(loc);
      onLocationUpdate?.(loc);

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
        (l) => {
          const newLoc = { latitude: l.coords.latitude, longitude: l.coords.longitude };
          setMyLocation(newLoc);
          if (isOnline) onLocationUpdate?.(newLoc);
        },
      );
    })();
    return () => { sub?.remove(); };
  }, [isOnline, onLocationUpdate]);

  // ── Follow driver's location when online ──────────────────
  useEffect(() => {
    if (!mapRef.current || !isReady || !myLocation) return;
    mapRef.current.animateToRegion(
      { ...myLocation, latitudeDelta: 0.008, longitudeDelta: 0.008 },
      600,
    );
  }, [myLocation, isReady]);

  // ── Auto-fit when route changes ───────────────────────────
  useEffect(() => {
    if (!mapRef.current || !isReady || !pickup || !dropoff) return;
    mapRef.current.fitToCoordinates([pickup, dropoff], {
      edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
      animated: true,
    });
  }, [pickup, dropoff, isReady]);

  const handleLocate = useCallback(() => {
    if (!mapRef.current || !myLocation) return;
    mapRef.current.animateToRegion(
      { ...myLocation, latitudeDelta: 0.008, longitudeDelta: 0.008 },
      500,
    );
  }, [myLocation]);

  const zoomIn = useCallback(() => {
    mapRef.current?.getCamera().then((cam) => {
      if (cam) mapRef.current?.animateCamera({ zoom: (cam.zoom ?? 16) + 1 }, { duration: 250 });
    });
  }, []);

  const zoomOut = useCallback(() => {
    mapRef.current?.getCamera().then((cam) => {
      if (cam) mapRef.current?.animateCamera({ zoom: (cam.zoom ?? 16) - 1 }, { duration: 250 });
    });
  }, []);

  return (
    <View
      style={[
        styles.container,
        mapHeight != null ? { height: mapHeight } : undefined,
        style,
      ]}
    >
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType="none"
        initialRegion={THODDOO_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        minZoomLevel={12}
        maxZoomLevel={19}
        onMapReady={() => setIsReady(true)}
      >
        {/* ── Tile layer ── */}
        <UrlTile
          urlTemplate={TILE_LIGHT}
          maximumZ={19}
          flipY={false}
          tileSize={256}
        />

        {/* ── Road overlay ── */}
        {ROAD_COORDINATES.map((road, i) => (
          <Polyline
            key={`road-${i}`}
            coordinates={road}
            strokeColor="rgba(255,255,255,0.5)"
            strokeWidth={2.5}
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* ── Hotel markers ── */}
        {HOTELS.map((h) => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.landmarkMarker}>
              <Text style={styles.landmarkEmoji}>🏨</Text>
            </View>
          </Marker>
        ))}

        {/* ── Restaurant markers ── */}
        {RESTAURANTS.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.landmarkMarker}>
              <Text style={styles.landmarkEmoji}>🍜</Text>
            </View>
          </Marker>
        ))}

        {/* ── Route ── */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <>
            <Polyline
              coordinates={activeRoute.coordinates}
              strokeColor="rgba(0,0,0,0.15)"
              strokeWidth={8}
              lineCap="round"
            />
            <Polyline
              coordinates={activeRoute.coordinates}
              strokeColor={Colors.lagoonTeal}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* ── Pickup pin ── */}
        {pickup && (
          <Marker coordinate={pickup} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
            <View style={styles.pickupPin}>
              <Text style={styles.pinLabel}>A</Text>
            </View>
          </Marker>
        )}

        {/* ── Dropoff pin ── */}
        {dropoff && (
          <Marker coordinate={dropoff} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
            <View style={styles.dropoffPin}>
              <Text style={styles.pinLabel}>B</Text>
            </View>
          </Marker>
        )}

        {/* ── My vehicle marker ── */}
        {myLocation && (
          <Marker
            coordinate={myLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
          >
            <View style={[styles.myMarker, !isOnline && styles.myMarkerOffline]}>
              <Text style={styles.myMarkerEmoji}>🚐</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* ── Controls ── */}
      {showControls && (
        <>
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn} activeOpacity={0.7}>
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut} activeOpacity={0.7}>
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.locateBtn} onPress={handleLocate} activeOpacity={0.8}>
            <Text style={styles.locateBtnText}>⊕</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── Status badge ── */}
      <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
        <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>

      {/* ── Loading ── */}
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.lagoonTeal} />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#006064',
  },

  // Landmark
  landmarkMarker: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  landmarkEmoji: { fontSize: 13 },

  // Pins
  pickupPin: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.palmGreen,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    ...Shadows.md,
  },
  dropoffPin: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.coralSunset,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    ...Shadows.md,
  },
  pinLabel: { color: Colors.white, fontWeight: '800', fontSize: 13 },

  // My vehicle
  myMarker: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.lagoonTeal,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    ...Shadows.lg,
  },
  myMarkerOffline: { backgroundColor: '#9CA3AF' },
  myMarkerEmoji: { fontSize: 22 },

  // Controls
  zoomControls: {
    position: 'absolute', right: 12, top: '42%',
    backgroundColor: Colors.glassBg,
    borderRadius: Radii.md, ...Shadows.md, overflow: 'hidden',
  },
  zoomBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  zoomBtnText: { fontSize: 22, color: Colors.textPrimary, fontWeight: '300', lineHeight: 26 },
  zoomDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  locateBtn: {
    position: 'absolute', right: 12, bottom: 24,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.glassBg,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
  },
  locateBtnText: { fontSize: 22, color: Colors.lagoonTeal, fontWeight: '700' },

  // Status badge
  statusBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radii.pill, ...Shadows.sm,
  },
  statusOnline: { backgroundColor: Colors.successLight },
  statusOffline: { backgroundColor: 'rgba(156,163,175,0.15)' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  dotOnline: { backgroundColor: Colors.palmGreen },
  dotOffline: { backgroundColor: '#9CA3AF' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextOnline: { color: Colors.palmGreen },
  statusTextOffline: { color: '#9CA3AF' },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#006064',
    alignItems: 'center', justifyContent: 'center',
  },
});
