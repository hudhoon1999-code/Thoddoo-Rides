# Thoddoo Rides — Map Integration Guide

## Overview

Thoddoo Island is approximately 1km × 0.5km. The map strategy is:

1. **Google Maps** as the base layer (standard roads + satellite)
2. **Custom GeoJSON overlay** from the official council map (all named locations)
3. **Custom markers** for guesthouses, venues, beaches, key facilities
4. **Offline-first tile caching** for weak internet tolerance

---

## Setup

### 1. Google Maps API

```bash
# Get API key from Google Cloud Console
# Enable: Maps SDK for Android, Maps SDK for iOS, Places API, Directions API
```

Add to `passenger-app/app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        { "locationAlwaysAndWhenInUsePermission": "Allow Thoddoo Rides to use your location." }
      ]
    ],
    "android": {
      "config": {
        "googleMaps": { "apiKey": "YOUR_ANDROID_MAPS_KEY" }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_MAPS_KEY"
      }
    }
  }
}
```

### 2. React Native Maps Component

```tsx
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// Thoddoo-optimized map region
const THODDOO_REGION = {
  latitude: 4.1603,
  longitude: 72.9949,
  latitudeDelta: 0.015,   // ~1.5km view
  longitudeDelta: 0.015,
};

// In your component:
<MapView
  provider={PROVIDER_GOOGLE}
  style={{ flex: 1 }}
  initialRegion={THODDOO_REGION}
  customMapStyle={THODDOO_MAP_STYLE}  // see below
  showsUserLocation
  showsMyLocationButton={false}  // use custom button
  rotateEnabled={false}           // keep island oriented N
>
  {/* Pickup marker */}
  <Marker coordinate={pickup.coordinates} title={pickup.nameEn}>
    <View style={markerStyles.pickup}>
      <Text>📍</Text>
    </View>
  </Marker>

  {/* Dropoff marker */}
  <Marker coordinate={dropoff.coordinates} title={dropoff.nameEn}>
    <View style={markerStyles.dropoff}>
      <Text>🎯</Text>
    </View>
  </Marker>

  {/* Driver location (realtime) */}
  {driverLocation && (
    <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
      <Animated.View style={[markerStyles.driver, driverAnimStyle]}>
        <Text>🚐</Text>
      </Animated.View>
    </Marker>
  )}

  {/* Route line */}
  {routeCoords && (
    <Polyline
      coordinates={routeCoords}
      strokeColor="#FF7A59"
      strokeWidth={4}
      lineDashPattern={[1]}
    />
  )}
</MapView>
```

### 3. Custom Thoddoo Map Style (JSON)

The `THODDOO_MAP_STYLE` array makes Google Maps look tropical/minimal:

```json
[
  { "elementType": "geometry", "stylers": [{ "color": "#e8f5f5" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#4dd0e1" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#0e7490" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#b2dfdb" }] },
  { "featureType": "landscape.natural", "stylers": [{ "color": "#d4edda" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#a5d6a7" }] },
  { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#0e7490" }] }
]
```

---

## Custom Location Overlays

All 200+ named locations from the council map are pre-loaded in `shared/constants/thoddoo-locations.ts`.

### Adding custom markers for guesthouses:

```tsx
import { THODDOO_GUESTHOUSES } from '../../constants/locations';

// In MapView:
{THODDOO_GUESTHOUSES.map((guesthouse) => (
  <Marker
    key={guesthouse.id}
    coordinate={guesthouse.coordinates}
    title={guesthouse.nameEn}
    onPress={() => handleLocationSelect(guesthouse)}
  >
    <View style={styles.guesthouseMarker}>
      <Text style={styles.markerEmoji}>🏠</Text>
    </View>
  </Marker>
))}
```

---

## Offline Map Tiles (Weak Internet)

```tsx
// Use react-native-maps URLTile for offline support
import { UrlTile } from 'react-native-maps';

// Cache tiles for Thoddoo island region
<MapView>
  <UrlTile
    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    maximumZ={19}
    flipY={false}
    tileCacheMaxAge={60 * 60 * 24 * 7} // 1 week cache
  />
</MapView>
```

---

## Driver Location Realtime Updates

```tsx
// In driver app: update location every 3 seconds while on trip
import { GeoFirestore } from 'geofirestore';

// Set driver location
const updateDriverLocation = async (driverId: string, coords: GeoPoint) => {
  const docRef = doc(db, 'drivers', driverId);
  await updateDoc(docRef, {
    currentLocation: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      updatedAt: serverTimestamp(),
    },
    status: 'on_trip',
  });
};

// In passenger app: listen to driver location
useEffect(() => {
  if (!rideId || !driverId) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'drivers', driverId),
    (snap) => {
      const data = snap.data();
      if (data?.currentLocation) {
        setDriverLocation({
          latitude: data.currentLocation.latitude,
          longitude: data.currentLocation.longitude,
        });
      }
    }
  );
  
  return () => unsubscribe();
}, [rideId, driverId]);
```

---

## Route Drawing

Thoddoo is tiny — routes can be approximated with straight lines or use Directions API:

```tsx
// Simple approach (Thoddoo is <1km, straight lines work well)
const routeCoords = [
  pickup.coordinates,
  dropoff.coordinates,
];

// OR: Use Google Directions API for actual roads
const getRoute = async (origin: GeoPoint, destination: GeoPoint) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?
    origin=${origin.latitude},${origin.longitude}&
    destination=${destination.latitude},${destination.longitude}&
    mode=driving&
    key=${GOOGLE_MAPS_API_KEY}`;
    
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.routes[0]) {
    const points = decode(data.routes[0].overview_polyline.points);
    return points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
  }
};
```
