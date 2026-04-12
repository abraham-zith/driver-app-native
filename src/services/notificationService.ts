/**
 * Firebase Cloud Messaging — Notification Service
 *
 * Handles:
 *  • Requesting notification permission (Android 13+)
 *  • Retrieving the device FCM token
 *  • Foreground notification display via Notifee
 *  • Token refresh listener
 */

import {
    FirebaseMessagingTypes,
    getMessaging,
    getToken,
    onMessage,
    requestPermission,
    setBackgroundMessageHandler,
    onTokenRefresh as firebaseOnTokenRefresh,
    onNotificationOpenedApp,
    getInitialNotification,
    AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/* ================================================================
   CHANNEL — Android requires a notification channel (8.0+)
   ================================================================ */

const CHANNEL_ID = 'ride_requests';

async function ensureChannel(): Promise<string> {
    return await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Ride Requests',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
    });
}

/* ================================================================
   REQUEST PERMISSION
   ================================================================ */

export async function requestNotificationPermission(): Promise<boolean> {
    const authStatus = await requestPermission(getMessaging());

    const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('✅ Notification permission granted');
    } else {
        console.log('❌ Notification permission denied');
    }

    return enabled;
}

/* ================================================================
   GET FCM TOKEN
   ================================================================ */

export async function getFCMToken(): Promise<string | null> {
    try {
        const token = await getToken(getMessaging());
        console.log('🔑 FCM TOKEN:', token);

        try {
            const { store } = require('../redux/store');
            console.log('--- YOUR TEST INFO ---');
            console.log('DRIVER ID:', store.getState().userSlice.user?.driverId);
            console.log('BEARER TOKEN:', store.getState().userSlice.user?.accessToken);
            console.log('----------------------');
        } catch (e) {
            console.log('Could not load test info yet');
        }

        return token;
    } catch (error: any) {
        // Use warn instead of error to avoid triggering the red box in development if Play Services is missing (e.g. some emulators)
        console.warn('⚠️ FCM Play Services not available or failed:', error?.message || error);
        return null;
    }
}

/* ================================================================
   FOREGROUND HANDLER — display notification when app is open
   ================================================================ */

export function setupForegroundHandler(): () => void {
    const unsubscribe = onMessage(
        getMessaging(),
        async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
            console.log('📩 Foreground message:', remoteMessage);

            // Respect driver's vibration preference
            const { store } = require('../redux/store');
            const isVibrationEnabled = store.getState()?.userSlice?.user?.isVibrationEnabled ?? true;

            const channelId = await ensureChannel();

            // 🛡️ [100% Solve] Programmatic Cancellation Handling
            // If the notification type is a cancellation, we must clear the internal state.
            const type = remoteMessage.data?.type || remoteMessage.data?.status;
            if (
                type === 'rider_cancelled' || 
                type === 'trip_cancelled' || 
                type === 'SCHEDULED_RIDE_CANCELLED' || 
                type === 'CANCEL_RIDE' || 
                type === 'MID_CANCELLED' ||
                type === 'RIDE_CANCELLED' ||
                type === 'BOOKING_CANCELLED'
            ) {
                console.log('🛑 [FCM] Cancellation detected. Emitting global event...');
                
                try {
                    const { globalEmitter, EVENTS } = require('../utils/EventEmitter');
                    
                    // Emit the event so RootNavigation can handle the visual alert and redirection.
                    // This is more robust than direct navigation here.
                    globalEmitter.emit(EVENTS.TRIP_CANCELLED, remoteMessage.data);
                } catch (err) {
                    console.error('❌ Failed to emit cancellation event:', err);
                }
            }

            await notifee.displayNotification({
                title: remoteMessage.notification?.title ?? 'New Notification',
                body: remoteMessage.notification?.body ?? '',
                android: {
                    channelId,
                    importance: AndroidImportance.HIGH,
                    smallIcon: 'ic_launcher',
                    pressAction: { id: 'default' },
                    sound: 'default',
                    vibrationPattern: isVibrationEnabled ? [300, 500] : [],
                },
                ios: {
                    foregroundPresentationOptions: {
                        badge: true,
                        sound: true,
                        banner: true,
                    },
                    sound: 'default',
                },
                data: remoteMessage.data,
            });
        },
    );

    return unsubscribe;
}

/* ================================================================
   BACKGROUND / QUIT-STATE HANDLER
   Must be registered at index.js (top-level)
   ================================================================ */

export function setupBackgroundHandler(): void {
    setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
        console.log('📩 Background message:', remoteMessage);

        const channelId = await ensureChannel();

        await notifee.displayNotification({
            title: remoteMessage.notification?.title ?? 'New Notification',
            body: remoteMessage.notification?.body ?? '',
            android: {
                channelId,
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_launcher',
                pressAction: { id: 'default' },
                sound: 'default',
            },
            ios: {
                sound: 'default',
            },
            data: remoteMessage.data,
        });
    });
}

/* ================================================================
   TOKEN REFRESH LISTENER
   ================================================================ */

export function onTokenRefresh(
    callback: (token: string) => void,
): () => void {
    return firebaseOnTokenRefresh(getMessaging(), callback);
}

/* ================================================================
   NOTIFICATION OPENED HANDLER (Foregrounding App on Tap)
   ================================================================ */

export function setupNotificationOpenedHandler(
    navigate: (screen: string, params?: any) => void,
) {
    // 1. App is running in background, user taps notification
    const unsubscribe = onNotificationOpenedApp(getMessaging(), remoteMessage => {
        console.log('✅ Notification caused app to open from background:', remoteMessage);
            navigate('ScheduledRides'); // Use the name from RootNavigation
    });

    // 2. App was completely killed, user taps notification
    getInitialNotification(getMessaging())
        .then(remoteMessage => {
            if (remoteMessage) {
                console.log('✅ Notification caused app to open from quit state:', remoteMessage);
                if (remoteMessage.data?.type === 'ride_request' || remoteMessage.data?.type === 'NEW_RIDE_REQUEST' || remoteMessage.data?.type === 'SCHEDULED_REMINDER' || remoteMessage.data?.type === 'test_notification') {
                    // Delay navigation slightly to ensure navigation tree is ready
                        navigate('ScheduledRides');
                }
            }
        });

    return unsubscribe;
}

