# Thoddoo Rides — Firestore Database Schema

## Collections Overview

```
firestore/
├── passengers/{uid}
├── drivers/{uid}
├── vehicles/{vehicleId}
├── rides/{rideId}
├── events/{eventId}
├── activities/{activityId}
├── pricing/{vehicleType}
├── notifications/{notificationId}
├── admin_actions/{actionId}
└── driver_earnings/{driverId_YYYY-MM-DD}
```

---

## passengers/{uid}

```json
{
  "uid": "string",
  "phone": "+9601234567",
  "name": "Ahmed Rasheed",
  "profilePhoto": "https://storage.../profiles/uid/avatar.jpg",
  "role": "passenger",
  "language": "en",
  "savedLocations": [
    {
      "id": "saved_1",
      "label": "My Guesthouse",
      "icon": "🏠",
      "locationId": "palm-leaf"
    }
  ],
  "totalRides": 12,
  "rating": 4.9,
  "fcmToken": "fcm_token_string",
  "isActive": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Indexes:**
- `phone` (for login lookup)
- `isActive` + `createdAt` (for admin)

---

## drivers/{uid}

```json
{
  "uid": "string",
  "phone": "+9601234567",
  "name": "Jamaal Ibrahim",
  "profilePhoto": "https://...",
  "role": "driver",
  "driverCode": "THD-4022",
  "nationality": "maldivian",
  "idType": "national_id",
  "approvalStatus": "approved",
  "documents": [
    {
      "type": "national_id_front",
      "url": "https://storage.../drivers/uid/documents/national_id_front",
      "uploadedAt": "Timestamp",
      "verified": true
    }
  ],
  "currentLocation": {
    "latitude": 4.1603,
    "longitude": 72.9949,
    "updatedAt": "Timestamp"
  },
  "status": "available",
  "rating": 4.8,
  "ratingCount": 1222,
  "totalRides": 340,
  "totalEarnings": 12500,
  "fcmToken": "string",
  "language": "en",
  "lastSelfieVerification": "Timestamp",
  "isActive": true,
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

**Indexes:**
- `approvalStatus` + `createdAt` (admin approvals list)
- `status` + `currentLocation` (finding nearby drivers)
- `driverCode` (unique, for passenger display)

---

## vehicles/{vehicleId}

```json
{
  "id": "string",
  "driverId": "uid",
  "type": "buggy_6",
  "plateNumber": "THD-001",
  "photoUrl": "https://...",
  "seats": 6,
  "color": "Teal",
  "model": "Club Car",
  "isApproved": true,
  "approvedBy": "admin_uid",
  "approvedAt": "Timestamp",
  "createdAt": "Timestamp"
}
```

---

## rides/{rideId}

```json
{
  "id": "auto-generated",
  "passengerId": "uid",
  "driverId": "uid or null",
  "vehicleType": "buggy_6",
  "vehicleId": "string or null",
  "status": "requesting",
  "pickup": {
    "id": "ferry-jetty",
    "nameEn": "Ferry Jetty",
    "coordinates": { "latitude": 4.1638, "longitude": 72.9940 }
  },
  "dropoff": {
    "id": "palm-leaf",
    "nameEn": "Palm Leaf Guesthouse",
    "coordinates": { "latitude": 4.1612, "longitude": 72.9948 }
  },
  "fare": 40,
  "commission": 8,
  "driverEarnings": 32,
  "commissionPercent": 20,
  "paymentMethod": "cash",
  "isPaid": false,
  "eventId": "null or event id",
  "activityId": "null or activity id",
  "requestedAt": "Timestamp",
  "acceptedAt": "Timestamp or null",
  "startedAt": "Timestamp or null",
  "completedAt": "Timestamp or null",
  "cancelledAt": "Timestamp or null",
  "cancelReason": "null or string",
  "passengerRating": "null or 1-5",
  "driverRating": "null or 1-5",
  "passengerReview": "null or string"
}
```

**Indexes:**
- `passengerId` + `requestedAt` desc (ride history)
- `driverId` + `requestedAt` desc (driver history)
- `status` + `vehicleType` + `requestedAt` (finding drivers)
- `completedAt` desc (admin analytics)

---

## events/{eventId}

```json
{
  "id": "auto",
  "titleEn": "DJ Night at Tropical Beach Club",
  "titleRu": "DJ-вечеринка",
  "descriptionEn": "Dance the night away...",
  "descriptionRu": "...",
  "category": "dj_night",
  "venue": {
    "id": "tropical-beach-club",
    "nameEn": "Tropical Beach Club",
    "coordinates": { "latitude": 4.1628, "longitude": 72.9955 }
  },
  "imageUrl": "https://...",
  "startTime": "Timestamp",
  "endTime": "Timestamp or null",
  "price": 0,
  "isFeatured": true,
  "isActive": true,
  "createdBy": "admin_uid",
  "createdAt": "Timestamp",
  "rideCount": 45
}
```

**Indexes:**
- `isActive` + `startTime` (today's events)
- `isFeatured` + `isActive` + `startTime` (featured)

---

## activities/{activityId}

```json
{
  "id": "auto",
  "titleEn": "Aqua Zumba",
  "titleRu": "Аква Зумба",
  "descriptionEn": "...",
  "category": "aqua_zumba",
  "venue": { ... },
  "imageUrl": "https://...",
  "scheduledTime": "Timestamp",
  "duration": 60,
  "maxParticipants": 20,
  "currentParticipants": 12,
  "price": 100,
  "isFeatured": false,
  "isActive": true,
  "createdBy": "admin_uid",
  "createdAt": "Timestamp"
}
```

---

## pricing/{vehicleType}

Document IDs: `buggy_6`, `buggy_12`, `motorcycle`

```json
{
  "vehicleType": "buggy_6",
  "baseFare": 30,
  "maxFare": 50,
  "flatIslandRate": true,
  "commissionPercent": 20,
  "surgeFactor": 1.0,
  "currency": "MVR",
  "isActive": true,
  "updatedBy": "admin_uid",
  "updatedAt": "Timestamp"
}
```

---

## driver_earnings/{driverId_YYYY-MM-DD}

```json
{
  "driverId": "uid",
  "date": "2025-01-15",
  "totalFares": 240,
  "totalCommission": 48,
  "netEarnings": 192,
  "totalRides": 8,
  "cashCollected": 192
}
```

---

## Firestore Security Rules (summary)

```javascript
// Full rules in backend/firestore-rules/firestore.rules

// Passengers: read/write own doc only
match /passengers/{uid} {
  allow read, write: if request.auth.uid == uid;
  allow read: if isAdmin();
}

// Drivers: read own doc, location readable by authenticated passengers
match /drivers/{uid} {
  allow read, write: if request.auth.uid == uid;
  allow read: if request.auth != null; // location visible to passengers
  allow write: if isAdmin();
}

// Rides: passenger and driver can read/update their own rides
match /rides/{rideId} {
  allow read: if request.auth.uid == resource.data.passengerId 
              || request.auth.uid == resource.data.driverId;
  allow create: if request.auth.uid == request.resource.data.passengerId;
  allow update: if request.auth.uid == resource.data.passengerId
              || request.auth.uid == resource.data.driverId;
}

// Events & Activities: public read, admin write
match /events/{id} { allow read: if true; allow write: if isAdmin(); }
match /activities/{id} { allow read: if true; allow write: if isAdmin(); }

// Pricing: public read, admin write
match /pricing/{id} { allow read: if true; allow write: if isAdmin(); }
```
