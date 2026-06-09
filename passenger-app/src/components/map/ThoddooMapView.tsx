// passenger-app/src/components/map/ThoddooMapView.tsx
// Production map: react-native-maps + Carto OSM tiles.
// Uses real GPS data from roads.geojson, hotels.json, restaurants.json, attractions.json.
// Island center: 4.4382°N, 72.9613°E (corrected from original approximate coords).

import React, {
  useRef, useEffect, useState, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated as RNAnimated, StyleProp, ViewStyle,
  Platform, ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker, Polyline, UrlTile, Callout,
  Region, PROVIDER_GOOGLE,
} from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { GeoPoint } from '../../../../shared/types';
import {
  MAP_THEME, THODDOO_REAL_CENTER,
  HOTELS, RESTAURANTS, ATTRACTIONS, ROAD_COORDINATES,
} from '../../../../shared/constants/thoddoo-map-data';
import type { LiveDriver } from '../../services/driverTrackingService';
import type { RouteResult } from '../../services/routingService';
import { formatDuration, formatDistance } from '../../services/routingService';

// ─── Initial region ───────────────────────────────────────────

const THODDOO_REGION: Region = {
  latitude:      THODDOO_REAL_CENTER.latitude,
  longitude:     THODDOO_REAL_CENTER.longitude,
  latitudeDelta:  0.016,
  longitudeDelta: 0.016,
};

// ─── Tile URLs ────────────────────────────────────────────────

const TILE_LIGHT = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
const TILE_DARK  = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

// ─── Props ────────────────────────────────────────────────────

export interface ThoddooMapViewProps {
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  driverLocation?: GeoPoint | null;
  nearbyDrivers?: LiveDriver[];
  activeRoute?: RouteResult | null;
  onMapPress?: (coordinate: GeoPoint) => void;
  onDriverPress?: (driver: LiveDriver) => void;
  showHotels?: boolean;
  showRestaurants?: boolean;
  showAttractions?: boolean;
  showRoads?: boolean;
  showNearbyDrivers?: boolean;
  showControls?: boolean;
  showRouteInfo?: boolean;
  theme?: 'light' | 'dark';
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  mapHeight?: number;
}

// ─── Animated driver marker ───────────────────────────────────

function DriverMarker({ driver }: { driver: LiveDriver }) {
  const pulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const color = driver.status === 'available' ? Colors.lagoonTeal : Colors.warning;

  return (
    <View style={styles.driverWrap}>
      <RNAnimated.View style={[
        styles.driverPulse,
        {
          backgroundColor: color,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
        },
      ]} />
      <View style={[styles.driverCore, { backgroundColor: color }]}>
        <Text style={styles.driverEmoji}>🚐</Text>
      </View>
    </View>
  );
}

// ─── POI marker ───────────────────────────────────────────────

function POIMarker({
  emoji, color,
}: { emoji: string; color: string }) {
  return (
    <View style={[styles.poiOuter, { borderColor: color }]}>
      <View style={[styles.poiInner, { backgroundColor: color + '22' }]}>
        <Text style={styles.poiEmoji}>{emoji}</Text>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function ThoddooMapView({
  pickup,
  dropoff,
  driverLocation,
  nearbyDrivers = [],
  activeRoute,
  onMapPress,
  onDriverPress,
  showHotels = true,
  showRestaurants = true,
  showAttractions = true,
  showRoads = true,
  showNearbyDrivers = true,
  showControls = true,
  showRouteInfo = true,
  theme = 'light',
  interactive = false,
  style,
  mapHeight,
}: ThoddooMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [isReady, setIsReady] = useState(false);

  // ── GPS ──────────────────────────────────────────────────
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 5000 },
        (l) => setUserLocation({ latitude: l.coords.latitude, longitude: l.coords.longitude }),
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  // ── Auto-fit to active points ────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !isReady) return;
    const pts: GeoPoint[] = [];
    if (pickup) pts.push(pickup);
    if (dropoff) pts.push(dropoff);
    if (driverLocation) pts.push(driverLocation);
    if (activeRoute?.coordinates.length) {
      pts.push(
        activeRoute.coordinates[0],
        activeRoute.coordinates[activeRoute.coordinates.length - 1],
      );
    }
    if (pts.length >= 2) {
      mapRef.current.fitToCoordinates(pts, {
        edgePadding: { top: 100, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }
  }, [pickup, dropoff, driverLocation, activeRoute, isReady]);

  // ── Controls ─────────────────────────────────────────────
  const handleLocate = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.animateToRegion(
      { ...userLocation, latitudeDelta: 0.007, longitudeDelta: 0.007 },
      500,
    );
  }, [userLocation]);

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

  const handlePress = useCallback((e: any) => {
    if (interactive && onMapPress) onMapPress(e.nativeEvent.coordinate);
  }, [interactive, onMapPress]);

  const isDark = theme === 'dark';
  const tileUrl = isDark ? TILE_DARK : TILE_LIGHT;

  return (
    <View style={[
      styles.container,
      mapHeight != null ? { height: mapHeight } : undefined,
      style,
    ]}>
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
        showsTraffic={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        minZoomLevel={12}
        maxZoomLevel={19}
        onPress={handlePress}
        onMapReady={() => setIsReady(true)}
      >
        {/* ── Carto OSM tile layer ── */}
        <UrlTile
          urlTemplate={tileUrl}
          maximumZ={19}
          flipY={false}
          tileSize={256}
          opacity={1}
        />

        {/* ── Road overlay from GeoJSON (enhances road visibility) ── */}
        {showRoads && ROAD_COORDINATES.map((road, i) => (
          <Polyline
            key={`road-${i}`}
            coordinates={road}
            strokeColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)'}
            strokeWidth={2.5}
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* ── Hotel markers ── */}
        {showHotels && HOTELS.map((h) => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <POIMarker emoji="🏨" color={MAP_THEME.hotel} />
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{h.name}</Text>
                <Text style={styles.calloutType}>Hotel / Guesthouse</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* ── Restaurant markers ── */}
        {showRestaurants && RESTAURANTS.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <POIMarker emoji="🍜" color={MAP_THEME.restaurant} />
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{r.name}</Text>
                <Text style={styles.calloutType}>Restaurant / Café</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* ── Attraction markers ── */}
        {showAttractions && ATTRACTIONS.map((a) => (
          <Marker
            key={a.id}
            coordinate={{ latitude: a.latitude, longitude: a.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <POIMarker emoji="🎯" color={MAP_THEME.attraction} />
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{a.name}</Text>
                <Text style={styles.calloutType}>Attraction</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* ── Nearby driver markers ── */}
        {showNearbyDrivers && nearbyDrivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={driver.location}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
            onPress={() => onDriverPress?.(driver)}
          >
            <DriverMarker driver={driver} />
          </Marker>
        ))}

        {/* ── Assigned driver location ── */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
          >
            <View style={[styles.driverCore, styles.assignedDriver]}>
              <Text style={styles.driverEmoji}>🚐</Text>
            </View>
          </Marker>
        )}

        {/* ── Route polylines ── */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <>
            <Polyline
              coordinates={activeRoute.coordinates}
              strokeColor="rgba(0,0,0,0.18)"
              strokeWidth={9}
              lineCap="round"
              lineJoin="round"
            />
            <Polyline
              coordinates={activeRoute.coordinates}
              strokeColor={MAP_THEME.restaurant}  // coral = route color
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

        {/* ── User GPS dot ── */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.userWrap}>
              <View style={styles.userAccuracy} />
              <View style={styles.userCore} />
              <View style={styles.userInner} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ── Controls ── */}
      {showControls && (
        <>
          <View style={[styles.zoomPanel, isDark && styles.panelDark]}>
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn} activeOpacity={0.7}>
              <Text style={[styles.zoomText, isDark && styles.textWhite]}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut} activeOpacity={0.7}>
              <Text style={[styles.zoomText, isDark && styles.textWhite]}>−</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.locateBtn, isDark && styles.panelDark]}
            onPress={handleLocate}
            activeOpacity={0.8}
          >
            <Text style={styles.locateText}>⊕</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── POI legend ── */}
      {(showHotels || showRestaurants || showAttractions) && (
        <View style={[styles.legend, isDark && styles.panelDark]}>
          {showHotels && <Text style={styles.legendItem}>🏨 Hotels</Text>}
          {showRestaurants && <Text style={styles.legendItem}>🍜 Food</Text>}
          {showAttractions && <Text style={styles.legendItem}>🎯 Explore</Text>}
        </View>
      )}

      {/* ── Route info pill ── */}
      {showRouteInfo && activeRoute && (
        <View style={styles.routePill}>
          <Text style={styles.routePillText}>
            {formatDuration(activeRoute.durationMin)} · {formatDistance(activeRoute.distanceKm)}
          </Text>
        </View>
      )}

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
    backgroundColor: MAP_THEME.ocean,
  },

  // POI marker
  poiOuter: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'white',
    ...Shadows.sm,
  },
  poiInner: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  poiEmoji: { fontSize: 14 },

  // Callout
  callout: { width: 150, padding: 8 },
  calloutName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  calloutType: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },

  // Driver marker
  driverWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  driverPulse: {
    position: 'absolute',
    width: 44, height: 44, borderRadius: 22,
  },
  driverCore: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    ...Shadows.md,
  },
  assignedDriver: {
    backgroundColor: Colors.deepOcean,
    borderColor: Colors.lagoonTeal,
    borderWidth: 3,
    width: 46, height: 46, borderRadius: 23,
  },
  driverEmoji: { fontSize: 18 },

  // Pickup / Dropoff
  pickupPin: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.palmGreen,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    ...Shadows.md,
  },
  dropoffPin: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.coralSunset,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white,
    ...Shadows.md,
  },
  pinLabel: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  // User dot
  userWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  userAccuracy: {
    position: 'absolute',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(41,121,255,0.14)',
  },
  userCore: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#1565C0',
    borderWidth: 2, borderColor: Colors.white,
    ...Shadows.md,
  },
  userInner: {
    position: 'absolute',
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: Colors.white,
  },

  // Controls
  zoomPanel: {
    position: 'absolute', right: 12, top: '42%',
    backgroundColor: Colors.glassBg,
    borderRadius: Radii.md, ...Shadows.md, overflow: 'hidden',
  },
  zoomBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  zoomText: {
    fontSize: 22, color: Colors.textPrimary,
    fontWeight: '300', lineHeight: 26,
  },
  zoomDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  locateBtn: {
    position: 'absolute', right: 12, bottom: 90,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.glassBg,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
  },
  locateText: { fontSize: 22, color: Colors.lagoonTeal, fontWeight: '700' },
  panelDark: { backgroundColor: 'rgba(14,20,30,0.85)' },
  textWhite: { color: Colors.white },

  // Legend
  legend: {
    position: 'absolute', bottom: 14, left: 12,
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.glassBg,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radii.pill,
    ...Shadows.sm,
  },
  legendItem: { fontSize: 11, color: Colors.textPrimary, fontWeight: '600' },

  // Route pill
  routePill: {
    position: 'absolute', top: 14,
    left: Spacing.base, right: Spacing.base,
    backgroundColor: Colors.deepOcean,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.pill, alignItems: 'center',
    ...Shadows.sm,
  },
  routePillText: {
    color: Colors.white, fontWeight: '700',
    fontSize: Typography.sizes.sm, letterSpacing: 0.3,
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MAP_THEME.ocean,
    alignItems: 'center', justifyContent: 'center',
  },
});
