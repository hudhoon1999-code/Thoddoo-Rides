// driver-app/src/components/map/ThoddooIslandMap.tsx
// Shared island map implementation for the driver app.
// Identical logic to passenger-app version; GPS shows driver's own position.

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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

const SVG_W = 400;
const SVG_H = 420;
const BOUNDS = { minLat: 4.1548, maxLat: 4.1672, minLon: 72.9896, maxLon: 73.0015 };

function g(lat: number, lon: number) {
  return {
    x: ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * SVG_W,
    y: (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SVG_H,
  };
}
function pts(coords: { lat: number; lon: number }[]): string {
  return coords.map(({ lat, lon }) => {
    const p = g(lat, lon);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
}

const ISLAND = [
  { lat: 4.1662, lon: 72.9905 }, { lat: 4.1670, lon: 72.9930 },
  { lat: 4.1665, lon: 72.9958 }, { lat: 4.1648, lon: 72.9982 },
  { lat: 4.1622, lon: 73.0002 }, { lat: 4.1598, lon: 73.0012 },
  { lat: 4.1572, lon: 73.0005 }, { lat: 4.1558, lon: 72.9982 },
  { lat: 4.1550, lon: 72.9958 }, { lat: 4.1558, lon: 72.9928 },
  { lat: 4.1575, lon: 72.9908 }, { lat: 4.1600, lon: 72.9898 },
  { lat: 4.1635, lon: 72.9898 },
];
const BEACH = [
  { lat: 4.1662, lon: 72.9905 }, { lat: 4.1670, lon: 72.9930 },
  { lat: 4.1665, lon: 72.9958 }, { lat: 4.1648, lon: 72.9982 },
  { lat: 4.1640, lon: 72.9975 }, { lat: 4.1640, lon: 72.9945 },
  { lat: 4.1650, lon: 72.9918 },
];
const FARM = [
  { lat: 4.1662, lon: 72.9905 }, { lat: 4.1650, lon: 72.9918 },
  { lat: 4.1638, lon: 72.9920 }, { lat: 4.1615, lon: 72.9912 },
  { lat: 4.1600, lon: 72.9910 }, { lat: 4.1600, lon: 72.9898 },
  { lat: 4.1635, lon: 72.9898 },
];
const HARBOR = [
  { lat: 4.1622, lon: 73.0002 }, { lat: 4.1598, lon: 73.0012 },
  { lat: 4.1572, lon: 73.0005 }, { lat: 4.1580, lon: 72.9990 },
  { lat: 4.1598, lon: 72.9985 }, { lat: 4.1618, lon: 72.9988 },
];
const ROADS_MAIN = [
  [
    { lat: 4.1658, lon: 72.9930 }, { lat: 4.1630, lon: 72.9938 },
    { lat: 4.1598, lon: 72.9945 }, { lat: 4.1562, lon: 72.9940 },
  ],
  [
    { lat: 4.1600, lon: 72.9910 }, { lat: 4.1600, lon: 72.9952 },
    { lat: 4.1590, lon: 73.0000 }, { lat: 4.1585, lon: 73.0005 },
  ],
];
const ROADS_SEC = [
  [{ lat: 4.1658, lon: 72.9930 }, { lat: 4.1658, lon: 72.9978 }],
  [{ lat: 4.1648, lon: 72.9938 }, { lat: 4.1642, lon: 72.9978 }],
  [
    { lat: 4.1635, lon: 72.9905 }, { lat: 4.1598, lon: 72.9908 },
    { lat: 4.1562, lon: 72.9918 },
  ],
  [{ lat: 4.1562, lon: 72.9940 }, { lat: 4.1568, lon: 72.9978 }],
  [{ lat: 4.1638, lon: 72.9920 }, { lat: 4.1638, lon: 72.9960 }],
  [
    { lat: 4.1615, lon: 72.9942 }, { lat: 4.1622, lon: 72.9985 },
    { lat: 4.1622, lon: 73.0002 },
  ],
];

const CAT_COLOR: Record<string, string> = {
  guesthouse: '#FF7A59', ferry_jetty: '#0E7490', beach: '#F6AD55',
  school: '#805AD5', mosque: '#2F855A', health: '#FC8181', government: '#3182CE', other: '#9CA3AF',
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ThoddooIslandMapProps {
  driverLocation?: GeoPoint | null;
  pickup?: GeoPoint | null;
  dropoff?: GeoPoint | null;
  showPOIs?: boolean;
  style?: object;
  mapHeight?: number;
}

export default function ThoddooIslandMap({
  driverLocation,
  pickup,
  dropoff,
  showPOIs = true,
  style,
  mapHeight = 260,
}: ThoddooIslandMapProps) {
  const [userLoc, setUserLoc] = useState<GeoPoint | null>(null);
  const [hasGps, setHasGps] = useState(false);

  const pulseR = useSharedValue(10);
  const pulseO = useSharedValue(0.6);

  useEffect(() => {
    pulseR.value = withRepeat(
      withSequence(withTiming(22, { duration: 900 }), withTiming(10, { duration: 900 })),
      -1, false,
    );
    pulseO.value = withRepeat(
      withSequence(withTiming(0, { duration: 900 }), withTiming(0.6, { duration: 900 })),
      -1, false,
    );
  }, []);

  const driverPulseProps = useAnimatedProps(() => ({
    r: pulseR.value, opacity: pulseO.value,
  }));

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setHasGps(true);
      const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
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
      <Svg width="100%" height="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <RadialGradient id="ocean" cx="60%" cy="40%" r="80%">
            <Stop offset="0%" stopColor="#4DD0E1" />
            <Stop offset="100%" stopColor="#006064" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={SVG_W} height={SVG_H} fill="url(#ocean)" />
        <Polygon points={pts(ISLAND)} fill="#C8E6C9" stroke="#A5D6A7" strokeWidth={1.5} />
        <Polygon points={pts(FARM)} fill="#AED581" stroke="#9CCC65" strokeWidth={0.5} opacity={0.85} />
        <Polygon points={pts(BEACH)} fill="#FFF8DC" stroke="#F5D780" strokeWidth={0.5} opacity={0.9} />
        <Polygon points={pts(HARBOR)} fill="#80DEEA" stroke="#40C9C4" strokeWidth={0.8} opacity={0.75} />

        {ROADS_MAIN.map((r, i) => (
          <Polyline key={`rb${i}`} points={pts(r)} fill="none" stroke="#B0BEC5" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} />
        ))}
        {ROADS_SEC.map((r, i) => (
          <Polyline key={`rsb${i}`} points={pts(r)} fill="none" stroke="#CFD8DC" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
        ))}
        {ROADS_MAIN.map((r, i) => (
          <Polyline key={`rm${i}`} points={pts(r)} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {ROADS_SEC.map((r, i) => (
          <Polyline key={`rs${i}`} points={pts(r)} fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        ))}
        <Polygon points={pts(ISLAND)} fill="none" stroke="rgba(0,96,100,0.35)" strokeWidth={1.5} />

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

        {/* GPS user dot */}
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

        {/* Driver marker with pulse */}
        {driverLocation && (() => {
          const p = g(driverLocation.latitude, driverLocation.longitude);
          return (
            <G>
              <AnimatedCircle cx={p.x} cy={p.y} fill="rgba(28,199,193,0.35)" animatedProps={driverPulseProps} />
              <Circle cx={p.x} cy={p.y} r={14} fill="#1CC7C1" stroke="white" strokeWidth={2} />
              <SvgText x={p.x} y={p.y + 5} textAnchor="middle" fontSize={13}>🚐</SvgText>
            </G>
          );
        })()}

        {/* Route */}
        {pickup && dropoff && (() => {
          const a = g(pickup.latitude, pickup.longitude);
          const b = g(dropoff.latitude, dropoff.longitude);
          return (
            <Polyline
              points={`${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`}
              fill="none" stroke="#FF7A59" strokeWidth={2.5} strokeDasharray="8,5" strokeLinecap="round" opacity={0.9}
            />
          );
        })()}

        {/* Pickup A */}
        {pickup && (() => {
          const p = g(pickup.latitude, pickup.longitude);
          return (
            <G>
              <Circle cx={p.x} cy={p.y} r={13} fill="#2F855A" stroke="white" strokeWidth={2} />
              <SvgText x={p.x} y={p.y + 5} textAnchor="middle" fontSize={12} fill="white" fontWeight="bold">A</SvgText>
            </G>
          );
        })()}

        {/* Dropoff B */}
        {dropoff && (() => {
          const p = g(dropoff.latitude, dropoff.longitude);
          return (
            <G>
              <Circle cx={p.x} cy={p.y} r={13} fill="#FF7A59" stroke="white" strokeWidth={2} />
              <SvgText x={p.x} y={p.y + 5} textAnchor="middle" fontSize={12} fill="white" fontWeight="bold">B</SvgText>
            </G>
          );
        })()}
      </Svg>

      {hasGps && (
        <View style={styles.gpsIndicator}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>GPS Live</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: '#006064' },
  gpsIndicator: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  gpsDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#1565C0' },
  gpsText: { fontSize: 10, color: '#0A2A2E', fontWeight: '700' },
});
