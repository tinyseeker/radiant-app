import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types/settings';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // Set notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF9A76',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  },

  /**
   * Schedule daily notifications based on user settings
   */
  async scheduleNotifications(
    settings: NotificationSettings,
    affirmations: string[]
  ): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      if (!settings.enabled) {
        return;
      }

      // Schedule morning notification
      if (settings.morningEnabled) {
        await this.scheduleDailyNotification(
          'morning',
          settings.morningTime,
          this.getMorningMessage(affirmations)
        );
      }

      // Schedule evening notification
      if (settings.eveningEnabled) {
        await this.scheduleDailyNotification(
          'evening',
          settings.eveningTime,
          this.getEveningMessage()
        );
      }

      // Schedule streak protection (8 PM if enabled)
      if (settings.streakProtectionEnabled) {
        await this.scheduleDailyNotification(
          'streak-protection',
          '20:00',
          this.getStreakProtectionMessage()
        );
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      throw error;
    }
  },

  /**
   * Schedule a single daily repeating notification
   */
  async scheduleDailyNotification(
    identifier: string,
    time: string, // "07:00" format
    content: { title: string; body: string }
  ): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  },

  /**
   * Get morning notification content
   */
  getMorningMessage(affirmations: string[]): { title: string; body: string } {
    const messages = [
      'Good morning! ✨',
      'Rise and shine! 🌅',
      'Start your day with gratitude',
      'A new day, a new opportunity',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Include a random affirmation if available
    if (affirmations.length > 0) {
      const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
      return {
        title: randomMessage,
        body: `"${randomAffirmation}" - Begin your day with this affirmation.`,
      };
    }

    return {
      title: randomMessage,
      body: 'Take a moment to reflect on what you\'re grateful for today.',
    };
  },

  /**
   * Get evening notification content
   */
  getEveningMessage(): { title: string; body: string } {
    const messages = [
      {
        title: 'Time to reflect 🌙',
        body: 'How did your day go? Take a moment to practice gratitude.',
      },
      {
        title: 'Evening check-in ✨',
        body: 'End your day on a positive note. What are you grateful for?',
      },
      {
        title: 'Gratitude time 🙏',
        body: 'Reflect on three good things that happened today.',
      },
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Get streak protection message
   */
  getStreakProtectionMessage(): { title: string; body: string } {
    return {
      title: 'Don\'t break your streak! 🔥',
      body: 'You haven\'t checked in today. Keep your momentum going!',
    };
  },

  /**
   * Send a test notification immediately
   */
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification ✨',
          body: 'Your notifications are working perfectly!',
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
};
