import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalData, initialJournalData } from '../types/journal';
import { UserActivity, initialUserActivity } from '../types/activity';

const JOURNAL_KEY = '@radiant_journal';
const ACTIVITY_KEY = '@radiant_activity';

export const storageService = {
  async saveJournal(data: JournalData): Promise<void> {
    try {
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving journal:', error);
      throw error;
    }
  },

  async loadJournal(): Promise<JournalData> {
    try {
      const data = await AsyncStorage.getItem(JOURNAL_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge with initialJournalData to ensure all properties exist
        return {
          ...initialJournalData,
          ...parsed,
          visionBoards: parsed.visionBoards || initialJournalData.visionBoards,
        };
      }
      return initialJournalData;
    } catch (error) {
      console.error('Error loading journal:', error);
      return initialJournalData;
    }
  },

  async clearJournal(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JOURNAL_KEY);
    } catch (error) {
      console.error('Error clearing journal:', error);
      throw error;
    }
  },

  async saveActivity(data: UserActivity): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving activity:', error);
      throw error;
    }
  },

  async loadActivity(): Promise<UserActivity> {
    try {
      const data = await AsyncStorage.getItem(ACTIVITY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge with initialUserActivity to ensure all properties exist
        return {
          ...initialUserActivity,
          ...parsed,
          streakData: {
            ...initialUserActivity.streakData,
            ...parsed.streakData,
          },
        };
      }
      return initialUserActivity;
    } catch (error) {
      console.error('Error loading activity:', error);
      return initialUserActivity;
    }
  },

  async clearActivity(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVITY_KEY);
    } catch (error) {
      console.error('Error clearing activity:', error);
      throw error;
    }
  },
};
