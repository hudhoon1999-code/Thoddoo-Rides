/**
 * ThoddooMap.tsx
 * React Native map centered on Thoddoo Island with:
 * - Custom tropical Google Maps style
 * - POI markers for guesthouses, beaches, jetty, etc.
 * - Live driver location marker
 * - Animated driver movement
 * - Island boundary overlay
 * - Custom marker icons
 *
 * The council-provided Thoddoo map PDF is used as reference for all POI
 * coordinates — more accurate than Google Maps default data for this island.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View, StyleSheet, Dimensions,
  Animated,
} from 'react-native';
import MapView, {
  Marker, Polyline, Circle, Polygon,
  PROVIDER_GOOGLE, MapStyleElement, Region,
} from 'react-native-maps';
import { Location, RideStatus } from '../../../../shared/types';
import { THODDOO_LOCATIONS, THODDOO_CENTER, THODDOO_BOUNDARY } from '../../../../shared/constants/thoddoo-locations';
import { tokens } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

/** ── Custom tropical map style ── */
export const THODDOO_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry',       stylers: [{ color: '#e8f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#0E7490' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water',          elementType: 'geometry', stylers: [{ color: '#40C9C4' }] },
  { featureType: 'water',          elementType: 'labels.text.fill', stylers: [{ color: '#0E7490' }] },
  { featureType: 'road',           elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',           elementType: 'geometry.stroke', stylers: [{ color: '#d4e8e8' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#c8f0c8' }] },
  { featureType: 'poi.park',       elementType: 'geometry', stylers: [{ color: '#a8dda8' }] },
  { featureType: 'poi',            elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',        stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#0E7490' }] },
];

/** Thoddoo island region defaults */
const THODDOO_REGION: Region = {
  latitude:       THODDOO_CENTER.latitude,
  longitude:      THODDOO_CENTER.longitude,
  latitudeDelta:  0.016,
  longitudeDelta: 0.016,
};

interface ThoddooMapProps {
  style?: object;
  pickup?:       Location | null;
  dropoff?:      Location | null;
  driverLocation?: Location | null;
  rideStatus?:   RideStatus;
  showPOIs?:     boolean;
  onPickupChange?: (loc: Location) => void;
  height?: number;
}

const MARKER_ICONS: Record<string, string> = {
  guesthouse: '🏠',
  beach:      '🏖',
  jetty:      '⛵',
  restaurant: '🍽',
  activity:   '🌊',
  health:     '🏥',
  school:     '🏫',
  council:    '🏛',
  pickup:     '📍',
  dropoff:    '🏁',
  driver:     '🛺',
};

export default function ThoddooMap({
  style,
  pickup,
  dropoff,
  driverLocation,
  rideStatus,
  showPOIs = false,
  onPickupChange,
  height: mapHeight = 300,
}: ThoddooMapProps) {
  const mapRef = useRef<MapView>(null);
  const driverAnimLat = useRef(new Animated.Value(driverLocation?.latitude ?? THODDOO_CENTER.latitude)).current;
  const driverAnimLng = useRef(new Animated.Value(driverLocation?.longitude ?? THODDOO_CENTER.longitude)).current;
  const [driverCoord, setDriverCoord] = useState(driverLocation);

  // Animate driver marker to new position
  useEffect(() => {
    if (!driverLocation) return;
    Animated.parallel([
      Animated.timing(driverAnimLat, {
        toValue: driverLocation.latitude,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(driverAnimLng, {
        toValue: driverLocation.longitude,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();

    setDriverCoord(driverLocation);
  }, [driverLocation]);

  // Fit map to show pickup + dropoff
  useEffect(() => {
    if (pickup && dropoff && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: pickup.latitude,  longitude: pickup.longitude },
          { latitude: dropoff.latitude, longitude: dropoff.longitude },
        ],
        { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
      );
    }
  }, [pickup, dropoff]);

  // Pan to driver when arriving
  useEffect(() => {
    if (driverCoord && mapRef.current && rideStatus === RideStatus.DRIVER_ARRIVING) {
      mapRef.current.animateToRegion({
        latitude:  driverCoord.latitude,
        longitude: driverCoord.longitude,
        latitudeDelta:  0.008,
        longitudeDelta: 0.008,
      }, 800);
    }
  }, [rideStatus]);

  return (
    <View style={[styles.container, { height: mapHeight }, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={THODDOO_REGION}
        customMapStyle={THODDOO_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        {/* ── Island boundary polygon ── */}
        <Polygon
          coordinates={THODDOO_BOUNDARY}
          strokeColor="rgba(28, 199, 193, 0.4)"
          fillColor="rgba(28, 199, 193, 0.04)"
          strokeWidth={1.5}
        />

        {/* ── POI markers (when showPOIs is on) ── */}
        {showPOIs && THODDOO_LOCATIONS.map((poi) => (
          <Marker
            key={poi.id}
            coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
            title={poi.name}
            description={poi.category}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.poiMarker}>
              <View style={[styles.poiBubble, { backgroundColor: categoryColor(poi.category) }]}>
                <Animated.Text style={styles.poiEmoji}>
                  {MARKER_ICONS[poi.category] ?? '📌'}
                </Animated.Text>
              </View>
              <View style={[styles.poiDot, { backgroundColor: categoryColor(poi.category) }]} />
            </View>
          </Marker>
        ))}

        {/* ── Pickup marker ── */}
        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title="Pickup"
            description={pickup.label}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.pickupMarker}>
              <View style={styles.pickupCircle}>
                <Text style={styles.markerEmoji}>📍</Text>
              </View>
              <View style={styles.markerTail} />
            </View>
          </Marker>
        )}

        {/* ── Dropoff marker ── */}
        {dropoff && (
          <Marker
            coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
            title="Dropoff"
            description={dropoff.label}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.dropoffMarker}>
              <View style={styles.dropoffCircle}>
                <Text style={styles.markerEmoji}>🏁</Text>
              </View>
              <View style={[styles.markerTail, styles.dropoffTail]} />
            </View>
          </Marker>
        )}

        {/* ── Route line between pickup and dropoff ── */}
        {pickup && dropoff && (
          <Polyline
            coordinates={[
              { latitude: pickup.latitude,  longitude: pickup.longitude },
              { latitude: dropoff.latitude, longitude: dropoff.longitude },
            ]}
            strokeColor={tokens.colors.primary}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* ── Driver marker (animated) ── */}
        {driverCoord && (
          <>
            {/* Pulse circle around driver */}
            <Circle
              center={{ latitude: driverCoord.latitude, longitude: driverCoord.longitude }}
              radius={20}
              strokeColor="rgba(28, 199, 193, 0.6)"
              fillColor="rgba(28, 199, 193, 0.15)"
              strokeWidth={2}
            />
            <Marker
              coordinate={{ latitude: driverCoord.latitude, longitude: driverCoord.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
            >
              <View style={styles.driverMarker}>
                <LinearGradientMarker />
                <Text style={styles.driverEmoji}>🛺</Text>
              </View>
            </Marker>
          </>
        )}

      </MapView>
    </View>
  );
}

function LinearGradientMarker() {
  return (
    <View style={styles.driverGlow} />
  );
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    guesthouse: '#FF7A59',
    beach:      '#1CC7C1',
    jetty:      '#0E7490',
    restaurant: '#F6AD55',
    activity:   '#2F855A',
    health:     '#FC8181',
    school:     '#805AD5',
    council:    '#3182CE',
  };
  return map[category] ?? '#9CA3AF';
}

// Needed for JSX inside, pulling Text from RN
import { Text } from 'react-native';
import { RideStatus } from '../../../../shared/types';

const styles = StyleSheet.create({
  container: { width: '100%', borderRadius: 20, overflow: 'hidden' },

  poiMarker:  { alignItems: 'center' },
  poiBubble:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  poiEmoji:   { fontSize: 16 },
  poiDot:     { width: 6, height: 6, borderRadius: 3, marginTop: 1 },

  pickupMarker: { alignItems: 'center' },
  pickupCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1CC7C1', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1CC7C1', shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  markerEmoji: { fontSize: 18 },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#1CC7C1',
  },

  dropoffMarker: { alignItems: 'center' },
  dropoffCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF7A59', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF7A59', shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  dropoffTail: { borderTopColor: '#FF7A59' },

  driverMarker: { alignItems: 'center', justifyContent: 'center' },
  driverGlow: {
    position: 'absolute',
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(28, 199, 193, 0.2)',
    borderWidth: 2, borderColor: 'rgba(28, 199, 193, 0.5)',
  },
  driverEmoji: { fontSize: 26, zIndex: 1 },
});
