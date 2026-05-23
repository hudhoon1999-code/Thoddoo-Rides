# Thoddoo Rides — Deployment Guide

## 1. Firebase Project Setup

```bash
# 1. Create project at console.firebase.google.com
# Project name: thoddoo-rides
# Region: asia-south1 (Mumbai — closest to Maldives)

# 2. Enable services:
# - Authentication (Phone)
# - Firestore Database
# - Storage
# - Cloud Functions
# - Cloud Messaging (FCM)

# 3. Install Firebase CLI
npm install -g firebase-tools
firebase login
firebase init

# Select: Firestore, Functions, Storage, Hosting (admin)
```

## 2. Environment Variables

Create these files (DO NOT commit to git):

### `passenger-app/.env`
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=thoddoo-rides.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=thoddoo-rides
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=thoddoo-rides.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

### `driver-app/.env`
```
# Same as passenger app
```

### `admin-dashboard/.env`
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=thoddoo-rides
# ... etc
```

## 3. Build & Deploy

### Passenger App (iOS)
```bash
cd passenger-app
eas build --platform ios --profile production
eas submit --platform ios
```

### Passenger App (Android)
```bash
eas build --platform android --profile production
eas submit --platform android
```

### Driver App
```bash
cd driver-app
eas build --platform all --profile production
# Deploy as separate app with different bundle ID
# Bundle ID: com.thoddoorides.driver
```

### Admin Dashboard
```bash
cd admin-dashboard
npm run build
firebase deploy --only hosting
# Deploys to: https://admin.thoddoorides.com
```

### Cloud Functions
```bash
cd backend/functions
npm install
firebase deploy --only functions
```

## 4. EAS Configuration

### `passenger-app/eas.json`
```json
{
  "cli": { "version": ">= 5.9.1" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.thoddoorides.passenger"
      },
      "android": {
        "applicationId": "com.thoddoorides.passenger"
      }
    }
  }
}
```

## 5. App Store Preparation

### App Store (iOS)
- App Name: "Thoddoo Rides"
- Subtitle: "Island Transfers & Events"
- Category: Travel, Navigation
- Age Rating: 4+
- Keywords: thoddoo, maldives, rides, buggy, motorcycle, island, transfer
- Screenshots: Provide for 6.7" and 6.1" iPhone
- Privacy Policy URL: https://thoddoorides.com/privacy

### Google Play (Android)
- Package: com.thoddoorides.passenger
- Category: Travel & Local
- Content Rating: Everyone
- Same keywords + description

## 6. Production Checklist

- [ ] Firebase rules deployed and tested
- [ ] FCM push notifications working
- [ ] Google Maps API key restricted to app bundle IDs
- [ ] Phone auth SMS tested with Maldives (+960) numbers
- [ ] Russian (+7) and international numbers tested
- [ ] Driver location updates working in background
- [ ] Admin approval email/SMS notifications working
- [ ] Pricing rules seeded in Firestore
- [ ] All Thoddoo locations seeded
- [ ] App Store Connect listing complete
- [ ] Privacy policy + Terms published
- [ ] Admin dashboard deployed and secured

## 7. Scaling Notes

- Thoddoo has ~3,000 residents + tourism. Firestore free tier handles this well.
- Expected: <100 concurrent users, <500 rides/day
- Firebase Spark plan sufficient initially; upgrade to Blaze if needed
- Cloud Functions on free tier: 2M invocations/month (more than enough)
- For monitoring: Firebase Performance + Crashlytics (both free)
