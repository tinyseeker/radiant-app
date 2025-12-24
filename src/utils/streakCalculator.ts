import { UserActivity, DailyCheckIn, StreakData } from '../types/activity';

/**
 * Get current date in ISO format (YYYY-MM-DD) in local timezone
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get yesterday's date in ISO format
 */
export const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if user has already checked in today
 */
export const hasCheckedInToday = (activity: UserActivity): boolean => {
  const today = getCurrentDate();
  return !!activity.checkIns[today]?.completed;
};

/**
 * Calculate streak from check-ins
 */
export const calculateStreak = (checkIns: Record<string, DailyCheckIn>): number => {
  const today = getCurrentDate();
  const sortedDates = Object.keys(checkIns)
    .filter(date => checkIns[date].completed)
    .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

  if (sortedDates.length === 0) {
    return 0;
  }

  // If most recent check-in is not today or yesterday, streak is broken
  const mostRecent = sortedDates[0];
  const yesterday = getYesterdayDate();

  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0;
  }

  // Count consecutive days backwards from most recent
  let streak = 0;
  let currentDate = new Date(mostRecent);

  for (const dateStr of sortedDates) {
    const checkInDate = new Date(dateStr);
    const expectedDate = new Date(currentDate);

    // Check if this check-in is on the expected date
    if (
      checkInDate.getFullYear() === expectedDate.getFullYear() &&
      checkInDate.getMonth() === expectedDate.getMonth() &&
      checkInDate.getDate() === expectedDate.getDate()
    ) {
      streak++;
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Gap found, streak ends
      break;
    }
  }

  return streak;
};

/**
 * Update activity data with new check-in
 */
export const processCheckIn = (activity: UserActivity): UserActivity => {
  const today = getCurrentDate();
  const now = Date.now();

  // Don't allow multiple check-ins on same day
  if (hasCheckedInToday(activity)) {
    return activity;
  }

  // Add new check-in
  const newCheckIn: DailyCheckIn = {
    date: today,
    completed: true,
    timestamp: now,
  };

  const updatedCheckIns = {
    ...activity.checkIns,
    [today]: newCheckIn,
  };

  // Recalculate streak
  const currentStreak = calculateStreak(updatedCheckIns);
  const totalCheckIns = activity.streakData.totalCheckIns + 1;
  const longestStreak = Math.max(activity.streakData.longestStreak, currentStreak);

  const updatedStreakData: StreakData = {
    currentStreak,
    longestStreak,
    lastCheckInDate: today,
    totalCheckIns,
  };

  return {
    checkIns: updatedCheckIns,
    streakData: updatedStreakData,
  };
};

/**
 * Get insight message based on streak data
 */
export const getInsightMessage = (streakData: StreakData): string => {
  const { currentStreak, longestStreak, totalCheckIns } = streakData;

  if (currentStreak === 0 && totalCheckIns === 0) {
    return 'Start your journey today!';
  }

  if (currentStreak === 0 && totalCheckIns > 0) {
    return "Don't break the chain! Start a new streak today.";
  }

  if (currentStreak === longestStreak && currentStreak > 1) {
    return `New record! Your longest streak is ${longestStreak} days!`;
  }

  if (currentStreak >= 30) {
    return `Incredible! ${currentStreak} days in a row!`;
  }

  if (currentStreak >= 10) {
    return `You're on fire! ${currentStreak} days in a row!`;
  }

  if (currentStreak >= 5) {
    return `Keep it up! ${currentStreak} days strong!`;
  }

  if (currentStreak >= 3) {
    return `Great momentum! ${currentStreak} days in a row!`;
  }

  return `${currentStreak} day streak - keep going!`;
};

/**
 * Check if streak milestone is reached (for celebrations)
 */
export const isMilestone = (streak: number): boolean => {
  const milestones = [5, 10, 30, 50, 100, 365];
  return milestones.includes(streak);
};

/**
 * Format timestamp for display
 */
export const formatCheckInTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes} ${ampm}`;
};

/**
 * Get monthly completion rate
 */
export const getMonthlyCompletionRate = (checkIns: Record<string, DailyCheckIn>): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const completedDays = Object.keys(checkIns).filter(dateStr => {
    const checkInDate = new Date(dateStr);
    return (
      checkInDate.getFullYear() === year &&
      checkInDate.getMonth() === month &&
      checkIns[dateStr].completed
    );
  }).length;

  return `${completedDays}/${daysInMonth} days this month`;
};
