import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import { COLLECTIONS } from '../../../shared/firebase/config';

// ─── Request permission + get token ─────────────────────────────────────────

export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  // Request permission (iOS requires explicit grant)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return null;

  // Get FCM token
  const token = await messaging().getToken();

  // Save to Firestore
  await firestore().collection(COLLECTIONS.PASSENGERS).doc(userId).update({
    fcmToken: token,
    fcmUpdatedAt: firestore.FieldValue.serverTimestamp(),
    platform: Platform.OS,
  });

  return token;
}

// ─── Handle foreground messages ──────────────────────────────────────────────

export function setupForegroundNotificationHandler(
  onNotification: (title: string, body: string, data: any) => void
): () => void {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    const title = remoteMessage.notification?.title || 'Thoddoo Rides';
    const body = remoteMessage.notification?.body || '';
    const data = remoteMessage.data || {};
    onNotification(title, body, data);
  });
  return unsubscribe;
}

// ─── Handle background tap (app opened from notification) ───────────────────

export function setupBackgroundNotificationHandler(
  onOpen: (data: any) => void
): void {
  // App in background and user taps notification
  messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage.data) {
      onOpen(remoteMessage.data);
    }
  });

  // App was closed and opened via notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data) {
        onOpen(remoteMessage.data);
      }
    });
}

// ─── Token refresh ───────────────────────────────────────────────────────────

export function setupTokenRefreshHandler(userId: string): () => void {
  const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
    await firestore()
      .collection(COLLECTIONS.PASSENGERS)
      .doc(userId)
      .update({ fcmToken: newToken });
  });
  return unsubscribe;
}

// ─── Notification types we handle ───────────────────────────────────────────

export type NotificationType =
  | 'ride_accepted'
  | 'driver_arriving'
  | 'driver_arrived'
  | 'ride_started'
  | 'ride_completed'
  | 'ride_cancelled'
  | 'event_reminder';

export function parseNotificationData(data: Record<string, string>): {
  type: NotificationType | null;
  rideId?: string;
  eventId?: string;
} {
  return {
    type: (data.type as NotificationType) || null,
    rideId: data.rideId,
    eventId: data.eventId,
  };
}
