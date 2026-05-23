/**
 * Firebase Cloud Functions — Thoddoo Rides backend
 *
 * Functions:
 *   onRideCreated     — Find nearest driver and send notification
 *   onRideStatusChange — Notify passenger of status updates
 *   onRideCompleted   — Calculate earnings, update driver stats
 *   onDriverApproved  — Notify driver of approval
 *   dailyEarningsSummary — Aggregate daily driver earnings (scheduled)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sendPush(token: string, title: string, body: string, data?: Record<string, string>) {
  if (!token) return;
  try {
    await messaging.send({ token, notification: { title, body }, data, android: { priority: 'high' } });
  } catch (e) {
    functions.logger.warn('Push failed', { token, error: e });
  }
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── 1. onRideCreated — Match driver ───────────────────────────────────────────

export const onRideCreated = functions.firestore
  .document('rides/{rideId}')
  .onCreate(async (snap, context) => {
    const ride = snap.data();
    const { rideId } = context.params;

    // Find online drivers with matching vehicle type within 2km
    const driversSnap = await db
      .collection('drivers')
      .where('isOnline', '==', true)
      .where('vehicleType', '==', ride.vehicleType)
      .where('isApproved', '==', true)
      .get();

    if (driversSnap.empty) {
      functions.logger.info('No drivers available', { rideId });
      await snap.ref.update({ status: 'no_drivers' });
      return;
    }

    // Sort by distance to pickup
    const pickup = ride.pickup;
    const nearbyDrivers = driversSnap.docs
      .map((d) => {
        const data = d.data();
        const loc = data.currentLocation;
        if (!loc) return null;
        const dist = calcDistance(pickup.latitude, pickup.longitude, loc.latitude, loc.longitude);
        return { id: d.id, dist, fcmToken: data.fcmToken };
      })
      .filter(Boolean)
      .sort((a, b) => a!.dist - b!.dist);

    if (nearbyDrivers.length === 0) {
      await snap.ref.update({ status: 'no_drivers' });
      return;
    }

    // Notify the nearest driver
    const nearest = nearbyDrivers[0]!;
    functions.logger.info('Notifying driver', { driverId: nearest.id, rideId });

    await db.collection('driver_requests').add({
      driverId:  nearest.id,
      rideId,
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 25000), // 25s
      responded: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendPush(
      nearest.fcmToken,
      '🚐 New Ride Request!',
      `Pickup: ${ride.pickup.label}`,
      { rideId, type: 'new_request' }
    );
  });

// ── 2. onRideStatusChange — Notify passenger ──────────────────────────────────

export const onRideStatusChange = functions.firestore
  .document('rides/{rideId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (before.status === after.status) return;

    const passSnap = await db.collection('passengers').doc(after.passengerId).get();
    const passFcmToken = passSnap.data()?.fcmToken;
    if (!passFcmToken) return;

    const messages: Record<string, { title: string; body: string }> = {
      accepted:        { title: '✅ Ride Accepted!', body: 'Your driver is on the way.' },
      driver_arriving: { title: '🚐 Driver On The Way', body: `ETA: arriving shortly at ${after.pickup?.label}` },
      driver_arrived:  { title: '📍 Driver Arrived!', body: 'Your driver is waiting at the pickup point.' },
      in_progress:     { title: '🏝 Ride Started', body: 'Enjoy your ride on Thoddoo!' },
      completed:       { title: '🎉 Ride Complete', body: `Fare: MVR ${after.actualFare}. Thank you!` },
      cancelled:       { title: '❌ Ride Cancelled', body: after.cancelReason ?? 'Your ride was cancelled.' },
    };

    const msg = messages[after.status];
    if (msg) await sendPush(passFcmToken, msg.title, msg.body, { rideId: change.after.id, type: after.status });
  });

// ── 3. onRideCompleted — Earnings calculation ─────────────────────────────────

export const onRideCompleted = functions.firestore
  .document('rides/{rideId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (before.status === after.status || after.status !== 'completed') return;

    const { rideId } = context.params;
    const fare        = after.actualFare ?? after.estimatedFare ?? 0;
    const commission  = Math.round(fare * 0.15); // 15% platform fee
    const driverNet   = fare - commission;

    // Update ride with earnings breakdown
    await change.after.ref.update({ commissionAmount: commission, driverEarnings: driverNet });

    // Update driver stats
    if (after.driverId) {
      const driverRef = db.collection('drivers').doc(after.driverId);
      await driverRef.update({
        totalEarnings:   admin.firestore.FieldValue.increment(driverNet),
        totalRides:      admin.firestore.FieldValue.increment(1),
        pendingPayout:   admin.firestore.FieldValue.increment(driverNet),
        lastRideAt:      admin.firestore.FieldValue.serverTimestamp(),
      });

      // Record in earnings subcollection
      await driverRef.collection('earnings').add({
        rideId,
        grossFare:  fare,
        commission,
        net:        driverNet,
        date:       admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Update passenger ride count
    if (after.passengerId) {
      await db.collection('passengers').doc(after.passengerId).update({
        totalRides: admin.firestore.FieldValue.increment(1),
      });
    }
  });

// ── 4. onDriverApproved ───────────────────────────────────────────────────────

export const onDriverApproved = functions.firestore
  .document('drivers/{driverId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (before.isApproved === after.isApproved) return;

    const fcmToken = after.fcmToken;
    if (!fcmToken) return;

    if (after.isApproved) {
      await sendPush(
        fcmToken,
        '🎉 You\'re Approved!',
        'Welcome to Thoddoo Rides. Go online and start earning!',
        { type: 'driver_approved' }
      );
    } else if (after.isSuspended) {
      await sendPush(
        fcmToken,
        '⚠️ Account Suspended',
        'Your account has been suspended. Contact support for details.',
        { type: 'driver_suspended' }
      );
    }
  });

// ── 5. Bootstrap super admin (run ONCE then it locks itself) ─────────────────

export const bootstrapSuperAdmin = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  // Only works if no admin exists yet
  const existing = await db.collection('admins').limit(1).get();
  if (!existing.empty) {
    res.status(400).json({ error: 'Super admin already set up. This endpoint is locked.' });
    return;
  }

  const SUPER_ADMIN_EMAIL = 'hudhoon1999@gmail.com';

  try {
    const user = await admin.auth().getUserByEmail(SUPER_ADMIN_EMAIL);

    // Set custom auth claim — embedded in JWT, no Firestore read needed
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'superAdmin',
    });

    // Create the Firestore admin document
    await db.collection('admins').doc(user.uid).set({
      email:       SUPER_ADMIN_EMAIL,
      role:        'superAdmin',
      isAdmin:     true,
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('Super admin bootstrapped', { uid: user.uid, email: SUPER_ADMIN_EMAIL });
    res.json({ success: true, uid: user.uid, message: 'Super admin created successfully.' });
  } catch (err: any) {
    functions.logger.error('Bootstrap failed', err);
    res.status(500).json({ error: err.message });
  }
});

// ── 6. Daily earnings summary (scheduled) ────────────────────────────────────

export const dailyEarningsSummary = functions.pubsub
  .schedule('0 23 * * *')
  .timeZone('Indian/Maldives')
  .onRun(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ridesSnap = await db
      .collection('rides')
      .where('status', '==', 'completed')
      .where('completedAt', '>=', admin.firestore.Timestamp.fromDate(today))
      .get();

    const driverTotals: Record<string, { rides: number; gross: number; net: number }> = {};

    ridesSnap.forEach((d) => {
      const data = d.data();
      if (!data.driverId) return;
      if (!driverTotals[data.driverId]) driverTotals[data.driverId] = { rides: 0, gross: 0, net: 0 };
      driverTotals[data.driverId].rides += 1;
      driverTotals[data.driverId].gross += data.actualFare ?? 0;
      driverTotals[data.driverId].net   += data.driverEarnings ?? 0;
    });

    const batch = db.batch();
    Object.entries(driverTotals).forEach(([driverId, totals]) => {
      const ref = db.collection('drivers').doc(driverId).collection('daily_summaries').doc(today.toISOString().slice(0, 10));
      batch.set(ref, { ...totals, date: today.toISOString().slice(0, 10) });
    });
    await batch.commit();

    functions.logger.info('Daily summary done', { driversProcessed: Object.keys(driverTotals).length });
  });
