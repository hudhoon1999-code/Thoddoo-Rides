// shared/constants/thoddoo-roads.ts
// Road network for Thoddoo Island — GeoPoint format for react-native-maps.
// Source: Official Thoddoo Council Map PDF.

import { GeoPoint } from '../types/index';

export const ROADS_MAIN: GeoPoint[][] = [
  // N-S spine through residential center
  [
    { latitude: 4.1658, longitude: 72.9930 },
    { latitude: 4.1645, longitude: 72.9935 },
    { latitude: 4.1630, longitude: 72.9938 },
    { latitude: 4.1615, longitude: 72.9942 },
    { latitude: 4.1598, longitude: 72.9945 },
    { latitude: 4.1580, longitude: 72.9945 },
    { latitude: 4.1562, longitude: 72.9940 },
  ],
  // E-W road to ferry jetty (harbor)
  [
    { latitude: 4.1600, longitude: 72.9910 },
    { latitude: 4.1600, longitude: 72.9952 },
    { latitude: 4.1598, longitude: 72.9975 },
    { latitude: 4.1590, longitude: 73.0000 },
    { latitude: 4.1585, longitude: 73.0005 },
  ],
];

export const ROADS_SECONDARY: GeoPoint[][] = [
  // North coastal road (to beaches)
  [
    { latitude: 4.1658, longitude: 72.9930 },
    { latitude: 4.1660, longitude: 72.9955 },
    { latitude: 4.1658, longitude: 72.9978 },
  ],
  // School → sports field road
  [
    { latitude: 4.1648, longitude: 72.9938 },
    { latitude: 4.1645, longitude: 72.9960 },
    { latitude: 4.1642, longitude: 72.9978 },
  ],
  // West perimeter road
  [
    { latitude: 4.1635, longitude: 72.9905 },
    { latitude: 4.1615, longitude: 72.9908 },
    { latitude: 4.1598, longitude: 72.9908 },
    { latitude: 4.1578, longitude: 72.9915 },
    { latitude: 4.1562, longitude: 72.9918 },
  ],
  // South cross road
  [
    { latitude: 4.1562, longitude: 72.9940 },
    { latitude: 4.1565, longitude: 72.9960 },
    { latitude: 4.1568, longitude: 72.9978 },
  ],
  // Mid cross (football field level)
  [
    { latitude: 4.1638, longitude: 72.9920 },
    { latitude: 4.1638, longitude: 72.9960 },
  ],
  // Center → NE harbor road
  [
    { latitude: 4.1615, longitude: 72.9942 },
    { latitude: 4.1618, longitude: 72.9965 },
    { latitude: 4.1622, longitude: 72.9985 },
    { latitude: 4.1622, longitude: 73.0002 },
  ],
];

export const ALL_ROADS: GeoPoint[][] = [...ROADS_MAIN, ...ROADS_SECONDARY];
