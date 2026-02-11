import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings } from '../types/settings';

const ACTIVITY_KEY = '@radiant_activity';

// Check if the user has already checked in today
const hasCheckedInToday = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(ACTIVITY_KEY);
    if (!data) return false;
    const activity = JSON.parse(data);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return !!activity.checkIns?.[today]?.completed;
  } catch {
    return false;
  }
};

// Configure how notifications are handled when app is in foreground
// Suppress check-in reminders if user already checked in today
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const type = notification.request.content.data?.type as string | undefined;

    // Suppress streak protection if already checked in
    if (type === 'streak-protection') {
      const checkedIn = await hasCheckedInToday();
      if (checkedIn) {
        return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: false, shouldShowList: false };
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
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
   * Cancel today's streak protection notification (called after check-in)
   */
  async cancelStreakNotification(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync('streak-protection');
    } catch (error) {
      console.error('Error canceling streak notification:', error);
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
          this.getMorningMessage(affirmations),
          'morning'
        );
      }

      // Schedule evening notification
      if (settings.eveningEnabled) {
        await this.scheduleDailyNotification(
          'evening',
          settings.eveningTime,
          this.getEveningMessage(),
          'evening'
        );
      }

      // Schedule streak protection (8 PM if enabled)
      if (settings.streakProtectionEnabled) {
        await this.scheduleDailyNotification(
          'streak-protection',
          '20:00',
          this.getStreakProtectionMessage(),
          'streak-protection'
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
    content: { title: string; body: string },
    type: string
  ): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  },

  /**
   * Get morning notification content - focused on journal review & gratitude practice
   */
  getMorningMessage(affirmations: string[]): { title: string; body: string } {
    // Include a random affirmation if available
    if (affirmations.length > 0) {
      const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
      const messages = [
        {
          title: 'Your morning practice awaits',
          body: `"${randomAffirmation}" - Start your day by reviewing your journal and grounding yourself.`,
        },
        {
          title: 'Good morning, radiant soul',
          body: `"${randomAffirmation}" - Take a few minutes to read your affirmations and set your intentions.`,
        },
        {
          title: 'Time for your morning ritual',
          body: `"${randomAffirmation}" - Open your journal and remind yourself who you're becoming.`,
        },
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }

    const messages = [
      {
        title: 'Your morning practice awaits',
        body: 'Review your journal, read your affirmations, and start the day grounded in gratitude.',
      },
      {
        title: 'Good morning, radiant soul',
        body: 'Take a few minutes to open your journal and remind yourself of what matters most.',
      },
      {
        title: 'Time for your morning ritual',
        body: 'Begin your day by reviewing your traits, standards, and what you\'re grateful for.',
      },
      {
        title: 'Rise with intention',
        body: 'Your journal is waiting. Start the day aligned with the person you\'re becoming.',
      },
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Get evening notification content - focused on reflecting on the day
   */
  getEveningMessage(): { title: string; body: string } {
    const messages = [
      {
        title: 'Time to reflect on your day',
        body: 'How was today? Take a moment to write your evening reflection and capture what you\'re grateful for.',
      },
      {
        title: 'Wind down with gratitude',
        body: 'Before the day ends, reflect on what went well. Your evening journal entry is waiting.',
      },
      {
        title: 'Your evening reflection',
        body: 'What did today teach you? Write it down and close the day with intention.',
      },
      {
        title: 'End your day mindfully',
        body: 'A few minutes of reflection can transform how you feel. Open your journal and write about your day.',
      },
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Get streak protection message
   */
  getStreakProtectionMessage(): { title: string; body: string } {
    return {
      title: 'Don\'t break your streak!',
      body: 'You haven\'t checked in today. A quick check-in keeps your momentum alive.',
    };
  },

  /**
   * Streak milestones that trigger congratulatory notifications
   */
  STREAK_MILESTONES: [7, 14, 21, 30, 50, 75, 100, 150, 200, 365] as const,

  /**
   * Check if a streak count is a milestone
   */
  isMilestone(streak: number): boolean {
    return this.STREAK_MILESTONES.includes(streak as any);
  },

  /**
   * Get milestone notification content based on streak count
   */
  getMilestoneMessage(streak: number): { title: string; body: string } {
    const messages: Record<number, { title: string; body: string }> = {
      7: {
        title: 'One Week Strong!',
        body: 'You\'ve completed 7 days in a row! Your commitment to yourself is beautiful. Keep going!',
      },
      14: {
        title: 'Two Weeks of Growth!',
        body: '14 days of showing up for yourself. You\'re building something incredible here.',
      },
      21: {
        title: 'Three Weeks - A Habit is Born!',
        body: '21 days of dedication. They say it takes 21 days to form a habit. You did it!',
      },
      30: {
        title: 'One Month Milestone!',
        body: 'A full month of daily practice. You\'re transforming into your best self, one day at a time.',
      },
      50: {
        title: '50 Days of Radiance!',
        body: 'Half a hundred days! Your consistency is truly inspiring. You\'re unstoppable.',
      },
      75: {
        title: '75 Days Strong!',
        body: 'What an achievement! 75 days of intentional living. You should be so proud.',
      },
      100: {
        title: '100 Days - A Century of Growth!',
        body: 'ONE HUNDRED DAYS! This is extraordinary. You\'ve proven your dedication to becoming your best self.',
      },
      150: {
        title: '150 Days of Transformation!',
        body: '150 days! Your commitment to personal growth is truly remarkable. Keep shining!',
      },
      200: {
        title: '200 Days - Incredible!',
        body: '200 days of showing up. You\'re not just building habits, you\'re building a new you.',
      },
      365: {
        title: 'ONE FULL YEAR!',
        body: 'An entire year of daily practice! This is an extraordinary achievement. You are radiant!',
      },
    };

    return messages[streak] || {
      title: `${streak} Day Streak!`,
      body: `Amazing! You've maintained a ${streak}-day streak. Keep up the incredible work!`,
    };
  },

  /**
   * Send a milestone congratulation notification immediately
   */
  async sendMilestoneNotification(streak: number): Promise<void> {
    try {
      const content = this.getMilestoneMessage(streak);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'milestone', streak },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending milestone notification:', error);
    }
  },

  /**
   * Send a test notification immediately
   */
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Radiant is ready',
          body: 'Your daily notifications are set up and working perfectly.',
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
