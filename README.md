# 🏝 Thoddoo Rides

> *Local Transfers Made Easy* — Buggy • Motorcycle • Local

A premium island ride-hailing platform built for Thoddoo Island, Maldives.

---

## 📦 Project Structure

```
thoddoo-rides/
├── passenger-app/        # React Native Expo — Passenger App
├── driver-app/           # React Native Expo — Driver App
├── admin-dashboard/      # React (Vite) — Admin Web Panel
├── shared/               # Shared types, constants, Firebase config
├── backend/              # Firebase Cloud Functions + Firestore rules
└── docs/                 # Architecture, design system, API docs
```

---

## 🚀 Quick Start (VS Code)

### Prerequisites
- Node.js 18+
- npm / yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase CLI: `npm install -g firebase-tools`

### 1. Clone & install all packages
```bash
git clone <your-repo>
cd thoddoo-rides

# Install all workspaces
npm run install:all
```

### 2. Firebase Setup
```bash
# Login to Firebase
firebase login

# Create project at https://console.firebase.google.com
# Then update shared/firebase/config.ts with your credentials
```

### 3. Run apps
```bash
# Passenger App
cd passenger-app && npx expo start

# Driver App
cd driver-app && npx expo start --port 8082

# Admin Dashboard
cd admin-dashboard && npm run dev
```

---

## 📱 Apps Overview

### Passenger App
- Splash → Auth → Home → Booking → Live Tracking
- Events Tab (Today / This Week / Upcoming)
- Activities Tab
- Profile (ride history, saved places, language)

### Driver App
- Auth with OTP + document verification
- Vehicle registration (Buggy / Motorcycle)
- Online/Offline toggle
- Live ride requests with countdown
- Earnings dashboard

### Admin Dashboard
- Full driver/passenger management
- Ride history & analytics
- Event & activity CMS
- Pricing controls
- Driver approval system

---

## 🎨 Design System

See `docs/DESIGN_SYSTEM.md`

Colors:
- Lagoon Teal: `#1CC7C1`
- Deep Ocean: `#0E7490`
- Coral Sunset: `#FF7A59`
- Warm Sand: `#F8F4EC`
- Palm Green: `#2F855A`

---

## 🗺 Thoddoo Map Integration

The custom Thoddoo island map (from official council map + named locations) is embedded as:
1. A GeoJSON overlay on top of Google Maps / Mapbox
2. All named locations from the official map pre-seeded as POIs
3. Custom island boundary polygon for offline-first use

See `docs/MAP_INTEGRATION.md`

---

## 🔐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Mobile) | React Native + Expo SDK 51 |
| Frontend (Web Admin) | React + Vite + TailwindCSS |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| Maps | Google Maps SDK (React Native Maps) |
| Realtime | Firestore realtime listeners |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| OTP | Firebase Phone Auth |
| State Management | Zustand |
| Navigation | Expo Router (file-based) |
| Animations | React Native Reanimated 3 |

---

## 📄 Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Reference](docs/API_REFERENCE.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Map Integration](docs/MAP_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [App Store Preparation](docs/APP_STORE.md)

---

## 🌍 Multi-language

Currently supported:
- English (default)
- Russian

Architecture ready for: Dhivehi, German, Italian

---

*Built with ❤️ for Thoddoo Island, Maldives*
