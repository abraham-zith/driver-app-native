import notifee, { TimestampTrigger, TriggerType, AndroidImportance, AndroidCategory } from '@notifee/react-native';
import SoundPlayer from 'react-native-sound-player';

export const scheduledRideService = {
  /**
   * Must be called once at app startup (e.g., in App.tsx or index.js)
   */
  setupNotificationChannels: async () => {
    await notifee.createChannel({
      id: 'scheduled_rides',
      name: 'Scheduled Ride Reminders',
      importance: AndroidImportance.HIGH,
    });
    await notifee.createChannel({
      id: 'scheduled_alerts_loud',
      name: 'Scheduled Ride Urgent Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'siren',
    });
  },

  /**
   * Schedules a 1-hour reminder and a 30-minute re-dispatch warning.
   */
  scheduleRideReminders: async (rideId: string, startTime: string | number | Date) => {
    const rideTime = new Date(startTime).getTime();
    
    // 1. One Hour Reminder (60 mins before)
    const oneHourBefore = rideTime - (60 * 60 * 1000);
    if (oneHourBefore > Date.now()) {
      await notifee.createTriggerNotification(
        {
          id: `ride_reminder_1h_${rideId}`,
          title: 'Scheduled Ride Reminder',
          body: 'Your scheduled ride starts in 1 hour. Please prepare and stay online!',
          android: {
            channelId: 'scheduled_rides',
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.REMINDER,
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: oneHourBefore,
        }
      );
    }

    // 2. Thirty Minute Re-dispatch Warning (30 mins before)
    const thirtyMinsBefore = rideTime - (30 * 60 * 1000);
    if (thirtyMinsBefore > Date.now()) {
      await notifee.createTriggerNotification(
        {
          id: `ride_warning_30m_${rideId}`,
          title: '⚠️ CRITICAL: Go Online Now!',
          body: 'Final warning: Your scheduled ride will be re-dispatched in 10 minutes if you aren\'t online!',
          android: {
            channelId: 'scheduled_alerts_loud',
            importance: AndroidImportance.HIGH,
            category: AndroidCategory.ALARM,
            fullScreenAction: {
                id: 'default',
            },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: thirtyMinsBefore,
        }
      );
    }
  },

  /**
   * Triggers the "Loud Alert" sound manually (used when the 30m notification is received)
   */
  playLoudAlert: () => {
    try {
      SoundPlayer.playSoundFile('siren', 'mp3'); // Ensure siren.mp3 exists in raw/res
    } catch (e) {
      console.log('Cannot play sound file', e);
    }
  },

  stopLoudAlert: () => {
    SoundPlayer.stop();
  },

  cancelRideReminders: async (rideId: string) => {
    await notifee.cancelNotification(`ride_reminder_1h_${rideId}`);
    await notifee.cancelNotification(`ride_warning_30m_${rideId}`);
  }
};
