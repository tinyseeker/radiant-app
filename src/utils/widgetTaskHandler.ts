import { registerWidgetTaskHandler } from 'react-native-widget-extension';
import { storageService } from './storage';

// Define widget data structure
export interface WidgetData {
  affirmation: string;
  currentStreak: number;
  hasCheckedInToday: boolean;
  lastUpdate: number;
}

/**
 * Widget task handler - shares data with iOS widgets
 * This function is called by widgets to get updated data
 */
export const setupWidgetTaskHandler = () => {
  registerWidgetTaskHandler(async ({ family }) => {
    try {
      // Load journal and activity data
      const journal = await storageService.loadJournal();
      const activity = await storageService.loadActivity();

      // Get random affirmation or default message
      const affirmation =
        journal.affirmations.length > 0
          ? journal.affirmations[Math.floor(Math.random() * journal.affirmations.length)]
          : 'Add your first affirmation to see it here!';

      // Check if user has checked in today
      const today = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = !!activity.checkIns[today];

      // Prepare widget data
      const widgetData: WidgetData = {
        affirmation,
        currentStreak: activity.streakData.currentStreak,
        hasCheckedInToday,
        lastUpdate: Date.now(),
      };

      return widgetData;
    } catch (error) {
      console.error('Widget task handler error:', error);

      // Return fallback data on error
      return {
        affirmation: 'Open Radiant to see your affirmation',
        currentStreak: 0,
        hasCheckedInToday: false,
        lastUpdate: Date.now(),
      };
    }
  });
};
