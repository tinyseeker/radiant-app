import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserActivity, initialUserActivity } from '../types/activity';
import { storageService } from '../utils/storage';
import { processCheckIn, hasCheckedInToday, calculateStreak } from '../utils/streakCalculator';

interface ActivityContextType {
  activity: UserActivity;
  checkIn: () => Promise<void>;
  hasCheckedInToday: boolean;
  isLoading: boolean;
  refreshActivity: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [activity, setActivity] = useState<UserActivity>(initialUserActivity);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    try {
      const data = await storageService.loadActivity();

      // Recalculate streak to ensure accuracy
      const currentStreak = calculateStreak(data.checkIns);
      const updatedData: UserActivity = {
        ...data,
        streakData: {
          ...data.streakData,
          currentStreak,
        },
      };

      setActivity(updatedData);
      setCheckedInToday(hasCheckedInToday(updatedData));
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIn = async () => {
    try {
      // Don't allow multiple check-ins
      if (hasCheckedInToday(activity)) {
        return;
      }

      const updatedActivity = processCheckIn(activity);
      setActivity(updatedActivity);
      setCheckedInToday(true);
      await storageService.saveActivity(updatedActivity);
    } catch (error) {
      console.error('Failed to check in:', error);
      throw error;
    }
  };

  const refreshActivity = async () => {
    await loadActivityData();
  };

  return (
    <ActivityContext.Provider
      value={{
        activity,
        checkIn,
        hasCheckedInToday: checkedInToday,
        isLoading,
        refreshActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
