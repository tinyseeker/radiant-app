export interface DailyCheckIn {
  date: string; // ISO format: "2025-12-24"
  completed: boolean;
  timestamp: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  totalCheckIns: number;
}

export interface UserActivity {
  checkIns: Record<string, DailyCheckIn>; // date string -> check-in
  streakData: StreakData;
}

export const initialUserActivity: UserActivity = {
  checkIns: {},
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: null,
    totalCheckIns: 0,
  },
};
