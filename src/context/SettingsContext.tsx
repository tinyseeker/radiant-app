import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, initialAppSettings } from '../types/settings';
import { notificationService } from '../utils/notificationService';

const SETTINGS_KEY = '@radiant_settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  testNotification: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(initialAppSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge with initial settings to ensure all properties exist
        setSettings({
          ...initialAppSettings,
          ...parsed,
          notifications: {
            ...initialAppSettings.notifications,
            ...parsed.notifications,
          },
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = {
        ...settings,
        ...newSettings,
        notifications: {
          ...settings.notifications,
          ...(newSettings.notifications || {}),
        },
      };

      setSettings(updated);
      await saveSettings(updated);

      // Re-schedule notifications if they changed
      if (newSettings.notifications) {
        // We'll pass empty array for affirmations here
        // The actual integration will be done in App.tsx with JournalContext
        await notificationService.scheduleNotifications(updated.notifications, []);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    try {
      const hasPermission = await notificationService.requestPermissions();

      if (!hasPermission) {
        return false;
      }

      await updateSettings({
        notifications: {
          ...settings.notifications,
          enabled: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    }
  };

  const disableNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      await updateSettings({
        notifications: {
          ...settings.notifications,
          enabled: false,
        },
      });
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      throw error;
    }
  };

  const testNotification = async () => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        enableNotifications,
        disableNotifications,
        testNotification,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
