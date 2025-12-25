export interface NotificationSettings {
  enabled: boolean;
  morningTime: string; // "07:00" format (24-hour)
  eveningTime: string; // "21:00" format (24-hour)
  morningEnabled: boolean;
  eveningEnabled: boolean;
  streakProtectionEnabled: boolean; // Reminder if not checked in by 8 PM
}

export interface AppSettings {
  notifications: NotificationSettings;
}

export const initialAppSettings: AppSettings = {
  notifications: {
    enabled: false,
    morningTime: '07:00',
    eveningTime: '21:00',
    morningEnabled: true,
    eveningEnabled: true,
    streakProtectionEnabled: true,
  },
};
