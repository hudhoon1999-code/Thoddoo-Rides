// passenger-app/src/components/map/ThoddooIslandMap.tsx
// Custom SVG map of Thoddoo Island built from official council map coordinates.
// Works without Google Maps API key — no native build required.

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, {
  Circle, G, Polygon, Polyline, Rect,
  Defs, RadialGradient, Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withRepeat,
  withSequence, withTiming,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { GeoPoint } from '../../../../shared/types';
import {
  THODDOO_KEY_LOCATIONS, THODDOO_MOSQUES, THODDOO_BEACHES,
} from '../../../../shared/constants/thoddoo-locations';

// ─── Projection ───────────────────────────────────────────────
const SVG_W = 400;
const SVG_H = 420;

const BOUNDS = {
  minLat: 4.1548, maxLat: 4.1672,
  minLon: 72.9896, maxLon: 73.0015,
};

function g(lat: number, lon: number) {
  return {
    x: ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * SVG_W,
    y: (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SVG_H,
  };
}

function pts(coords: { lat: number; lon: number }[]): string {
  return coords
    .map(({ lat, lon }) => {
      const p = g(lat, lon);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');
}

// ─── Island Shape (from council PDF boundary) ─────────────────
const ISLAND = [
  { lat: 4.1662, lon: 72.9905 },
  { lat: 4.1670, lon: 72.9930 },
  { lat: 4.1665, lon: 72.9958 },
  { lat: 4.1648, lon: 72.9982 },
  { lat: 4.1622, lon: 73.0002 },
  { lat: 4.1598, lon: 73.0012 },
  { lat: 4.1572, lon: 73.0005 },
  { lat: 4.1558, lon: 72.9982 },
  { lat: 4.1550, lon: 72.9958 },
  { lat: 4.1558, lon: 72.9928 },
  { lat: 4.1575, lon: 72.9908 },
  { lat: 4.1600, lon: 72.9898 },
  { lat: 4.1635, lon: 72.9898 },
];

// North beach strip
const BEACH = [
  { lat: 4.1662, lon: 72.9905 },
  { lat: 4.1670, lon: 72.9930 },
  { lat: 4.1665, lon: 72.9958 },
  { lat: 4.1648, lon: 72.9982 },
  { lat: 4.1640, lon: 72.9975 },
  { lat: 4.1640, lon: 72.9945 },
  { lat: 4.1650, lon: 72.9918 },
];

// Northwest farmland / watermelon fields
const FARM = [
  { lat: 4.1662, lon: 72.9905 },
  { lat: 4.1650, lon: 72.9918 },
  { lat: 4.1638, lon: 72.9920 },
  { lat: 4.1615, lon: 72.9912 },
  { lat: 4.1600, lon: 72.9910 },
  { lat: 4.1600, lon: 72.9898 },
  { lat: 4.1635, lon: 72.9898 },
];

// East harbor / lagoon
const HARBOR = [
  { lat: 4.1622, lon: 73.0002 },
  { lat: 4.1598, lon: 73.0012 },
  { lat: 4.1572, lon: 73.0005 },
  { lat: 4.1580, lon: 72.9990 },
  { lat: 4.1598, lon: 72.9985 },
  { lat: 4.1618, lon: 72.9988 },
];

// ─── Road Network (approximated from council map) ─────────────
const ROADS_MAIN = [
  // N-S spine through residential center
  [
    { lat: 4.1658, lon: 72.9930 },
    { lat: 4.1645, lon: 72.9935 },
    { lat: 4.1630, lon: 72.9938 },
    { lat: 4.1615, lon: 72.9942 },
    { lat: 4.1598, lon: 72.9945 },
    { lat: 4.1580, lon: 72.9945 },
    { lat: 4.1562, lon: 72.9940 },
  ],
  // E-W road to ferry jetty
  [
    { lat: 4.1600, lon: 72.9910 },
    { lat: 4.1600, lon: 72.9952 },
    { lat: 4.1598, lon: 72.9975 },
    { lat: 4.1590, lon: 73.0000 },
    { lat: 4.1585, lon: 73.0005 },
  ],
];

const ROADS_SECONDARY = [
  // North coastal road (to beaches)
  [
    { lat: 4.1658, lon: 72.9930 },
    { lat: 4.1660, lon: 72.9955 },
    { lat: 4.1658, lon: 72.9978 },
  ],
  // School → sports field road
  [
    { lat: 4.1648, lon: 72.9938 },
    { lat: 4.1645, lon: 72.9960 },
    { lat: 4.1642, lon: 72.9978 },
  ],
  // West perimeter road
  [
    { lat: 4.1635, lon: 72.9905 },
    { lat: 4.1615, lon: 72.9908 },
    { lat: 4.1598, lon: 72.9908 },
    { lat: 4.1578, lon: 72.9915 },
    { lat: 4.1562, lon: 72.9918 },
  ],
  // South cross road
  [
    { lat: 4.1562, lon: 72.9940 },
    { lat: 4.1565, lon: 72.9960 },
    { lat: 4.1568, lon: 72.9978 },
  ],
  // Mid cross (football field level)
  [
    { lat: 4.1638, lon: 72.9920 },
    { lat: 4.1638, lon: 72.9960 },
  ],
  // Center → NE harbor
  [
    { lat: 4.1615, lon: 72.9942 },
    { lat: 4.1618, lon: 72.9965 },
    { lat: 4.1622, lon: 72.9985 },
    { lat: 4.1622, lon: 73.0002 },
  ],
];

// ─── POI colors by category ───────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  guesthouse:    '#FF7A59',
  ferry_jetty:   '#0E7490',
  beach:         '#F6AD55',
  school:        '#805AD5',
  mosque:        '#2F855A',
  health:        '#FC8181',
  government:    '#3182CE',
  other:         '#9CA3AF',
};

// ─── Animated SVG circle for driver pulse ─────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Props ────────────────────────────────────────────────────
export interface ThoddooIslandMapProps {
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  driverLocation?: GeoPoint | null;
  showPOIs?: boolean;
  showGuesthouses?: boolean;
  style?: object;
  mapHeight?: number;
}

export default function ThoddooIslandMap({
  pickup,
  dropoff,
  driverLocation,
  showPOIs = true,
  showGuesthouses = false,
  style,
  mapHeight = 300,
}: ThoddooIslandMapProps) {
  const [userLoc, setUserLoc] = useState<GeoPoint | null>(null);
  const [hasGps, setHasGps] = useState(false);

  // Driver pulse
  const pulseR = useSharedValue(10);
  const pulseO = useSharedValue(0.6);

  useEffect(() => {
    if (!driverLocation) return;
    pulseR.value = withRepeat(
      withSequence(withTiming(22, { duration: 900 }), withTiming(10, { duration: 900 })),
      -1, false,
    );
    pulseO.value = withRepeat(
      withSequence(withTiming(0, { duration: 900 }), withTiming(0.6, { duration: 900 })),
      -1, false,
    );
  }, [driverLocation]);

  const driverPulseProps = useAnimatedProps(() => ({
    r: pulseR.value,
    opacity: pulseO.value,
  }));

  // GPS
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setHasGps(true);
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLoc({ latitude: initial.coords.latitude, longitude: initial.coords.longitude });
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 8 },
        (l) => setUserLoc({ latitude: l.coords.latitude, longitude: l.coords.longitude }),
      );
    })();
    return () => { sub?.remove(); };
  }, []);

  const allPOIs = [...THODDOO_KEY_LOCATIONS, ...THODDOO_MOSQUES, ...THODDOO_BEACHES];

  return (
    <View style={[styles.container, { height: mapHeight }, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <RadialGradient id="ocean" cx="60%" cy="40%" r="80%">
            <Stop offset="0%" stopColor="#4DD0E1" />
            <Stop offset="100%" stopColor="#006064" />
          </RadialGradient>
        </Defs>

        {/* Ocean */}
        <Rect x={0} y={0} width={SVG_W} height={SVG_H} fill="url(#ocean)" />

        {/* Island land */}
        <Polygon points={pts(ISLAND)} fill="#C8E6C9" stroke="#A5D6A7" strokeWidth={1.5} />

        {/* Farmland (NW) */}
        <Polygon points={pts(FARM)} fill="#AED581" stroke="#9CCC65" strokeWidth={0.5} opacity={0.85} />

        {/* Beach strip (N coast) */}
        <Polygon points={pts(BEACH)} fill="#FFF8DC" stroke="#F5D780" strokeWidth={0.5} opacity={0.9} />

        {/* Harbor lagoon (E) */}
        <Polygon points={pts(HARBOR)} fill="#80DEEA" stroke="#40C9C4" strokeWidth={0.8} opacity={0.75} />

        {/* Road border/shadow — main roads */}
        {ROADS_MAIN.map((road, i) => (
          <Polyline
            key={`rb-${i}`}
            points={pts(road)}
            fill="none"
            stroke="#B0BEC5"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
        ))}

        {/* Road border/shadow — secondary */}
        {ROADS_SECONDARY.map((road, i) => (
          <Polyline
            key={`rsb-${i}`}
            points={pts(road)}
            fill="none"
            stroke="#CFD8DC"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
        ))}

        {/* Main roads (white) */}
        {ROADS_MAIN.map((road, i) => (
          <Polyline
            key={`rm-${i}`}
            points={pts(road)}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Secondary roads */}
        {ROADS_SECONDARY.map((road, i) => (
          <Polyline
            key={`rs-${i}`}
            points={pts(road)}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        ))}

        {/* Island outline */}
        <Polygon
          points={pts(ISLAND)}
          fill="none"
          stroke="rgba(0,96,100,0.35)"
          strokeWidth={1.5}
        />

        {/* Beach label */}
        {(() => {
          const p = g(4.1667, 72.9938);
          return (
            <SvgText
              x={p.x} y={p.y}
              textAnchor="middle"
              fontSize={8}
              fill="#795548"
              fontWeight="bold"
              opacity={0.7}
            >
              BEACH
            </SvgText>
          );
        })()}

        {/* Farm label */}
        {(() => {
          const p = g(4.1620, 72.9908);
          return (
            <SvgText
              x={p.x} y={p.y}
              textAnchor="middle"
              fontSize={7}
              fill="#33691E"
              opacity={0.7}
            >
              FARMS
            </SvgText>
          );
        })()}

        {/* Ferry label */}
        {(() => {
          const p = g(4.1585, 73.0005);
          return (
            <SvgText
              x={p.x} y={p.y - 14}
              textAnchor="middle"
              fontSize={7}
              fill="#006064"
              fontWeight="bold"
            >
              FERRY
            </SvgText>
          );
        })()}

        {/* POI dots */}
        {showPOIs && allPOIs.map((loc) => {
          const p = g(loc.coordinates.latitude, loc.coordinates.longitude);
          const color = CAT_COLOR[loc.category] ?? '#9CA3AF';
          return (
            <G key={loc.id}>
              <Circle cx={p.x} cy={p.y} r={4.5} fill={color} opacity={0.85} />
              <Circle cx={p.x} cy={p.y} r={2} fill="white" opacity={0.6} />
            </G>
          );
        })}

        {/* Key location labels for popular spots */}
        {showPOIs && allPOIs.filter(l => l.isPopular).map((loc) => {
          const p = g(loc.coordinates.latitude, loc.coordinates.longitude);
          return (
            <SvgText
              key={`lbl-${loc.id}`}
              x={p.x}
              y={p.y + 11}
              textAnchor="middle"
              fontSize={6.5}
              fill="#1A237E"
              fontWeight="600"
              opacity={0.85}
            >
              {loc.nameEn}
            </SvgText>
          );
        })}

        {/* Route line */}
        {pickup && dropoff && (() => {
          const a = g(pickup.latitude, pickup.longitude);
          const b = g(dropoff.latitude, dropoff.longitude);
          return (
            <Polyline
              points={`${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`}
              fill="none"
              stroke="#FF7A59"
              strokeWidth={2.5}
              strokeDasharray="8,5"
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })()}

        {/* User GPS dot */}
        {userLoc && (() => {
          const p = g(userLoc.latitude, userLoc.longitude);
          if (p.x < -30 || p.x > SVG_W + 30 || p.y < -30 || p.y > SVG_H + 30) return null;
          return (
            <G>
              <Circle cx={p.x} cy={p.y} r={16} fill="rgba(41,121,255,0.12)" />
              <Circle cx={p.x} cy={p.y} r={8} fill="#1565C0" />
              <Circle cx={p.x} cy={p.y} r={3.5} fill="white" />
            </G>
          );
        })()}

        {/* Driver marker + animated pulse */}
        {driverLocation && (() => {
          const p = g(driverLocation.latitude, driverLocation.longitude);
          return (
            <G>
              <AnimatedCircle
                cx={p.x}
                cy={p.y}
                fill="rgba(28,199,193,0.35)"
                animatedProps={driverPulseProps}
              />
              <Circle cx={p.x} cy={p.y} r={14} fill="#1CC7C1" stroke="white" strokeWidth={2} />
              <SvgText
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={13}
              >
                🚐
              </SvgText>
            </G>
          );
        })()}

        {/* Pickup marker (A) */}
        {pickup && (() => {
          const p = g(pickup.latitude, pickup.longitude);
          return (
            <G>
              <Circle cx={p.x} cy={p.y} r={13} fill="#2F855A" stroke="white" strokeWidth={2} />
              <SvgText
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={12}
                fill="white"
                fontWeight="bold"
              >
                A
              </SvgText>
            </G>
          );
        })()}

        {/* Dropoff marker (B) */}
        {dropoff && (() => {
          const p = g(dropoff.latitude, dropoff.longitude);
          return (
            <G>
              <Circle cx={p.x} cy={p.y} r={13} fill="#FF7A59" stroke="white" strokeWidth={2} />
              <SvgText
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={12}
                fill="white"
                fontWeight="bold"
              >
                B
              </SvgText>
            </G>
          );
        })()}
      </Svg>

      {/* GPS indicator */}
      {hasGps && (
        <View style={styles.gpsIndicator}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>GPS Live</Text>
        </View>
      )}

      {/* Compact legend */}
      {(pickup || dropoff || driverLocation) && (
        <View style={styles.legend}>
          {pickup && (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#2F855A' }]} />
              <Text style={styles.legendLabel}>Pickup</Text>
            </View>
          )}
          {dropoff && (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#FF7A59' }]} />
              <Text style={styles.legendLabel}>Dropoff</Text>
            </View>
          )}
          {driverLocation && (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#1CC7C1' }]} />
              <Text style={styles.legendLabel}>Driver</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#006064',
  },
  gpsIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1565C0',
  },
  gpsText: {
    fontSize: 10,
    color: '#0A2A2E',
    fontWeight: '700',
  },
  legend: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 9,
    color: '#0A2A2E',
    fontWeight: '700',
  },
});
