import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, typography } from '../theme/colors';
import { StreakData } from '../types/activity';
import { getInsightMessage, formatCheckInTime, getMonthlyCompletionRate } from '../utils/streakCalculator';
import { useTheme } from '../hooks/useTheme';

interface ProgressCardProps {
  streakData: StreakData;
  checkIns: Record<string, any>;
  hasCheckedInToday: boolean;
  onPress: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  streakData,
  checkIns,
  hasCheckedInToday,
  onPress,
}) => {
  const { currentStreak, longestStreak, totalCheckIns, lastCheckInDate } = streakData;
  const { colors } = useTheme();

  const getLastCheckInText = (): string => {
    if (!lastCheckInDate) {
      return 'No check-ins yet';
    }

    const checkIn = checkIns[lastCheckInDate];
    if (!checkIn) {
      return 'No check-ins yet';
    }

    const today = new Date().toISOString().split('T')[0];
    if (lastCheckInDate === today) {
      return `Today at ${formatCheckInTime(checkIn.timestamp)}`;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastCheckInDate === yesterdayStr) {
      return `Yesterday at ${formatCheckInTime(checkIn.timestamp)}`;
    }

    const date = new Date(lastCheckInDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const insightMessage = getInsightMessage(streakData);
  const monthlyRate = getMonthlyCompletionRate(checkIns);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={colors.gradients.secondary}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progress & Insights</Text>
          <Text style={styles.icon}>📊</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statLabel}>Current Streak:</Text>
            <Text style={styles.statValue}>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statLabel}>Longest Streak:</Text>
            <Text style={styles.statValue}>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statLabel}>Total Check-ins:</Text>
            <Text style={styles.statValue}>{totalCheckIns}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>Last Check-in:</Text>
            <Text style={styles.statValue}>{getLastCheckInText()}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statLabel}>This Month:</Text>
            <Text style={styles.statValue}>{monthlyRate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.insightContainer}>
          <Text style={styles.insightText}>{insightMessage}</Text>
        </View>

        {!hasCheckedInToday && (
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Tap to check in today! 🌟</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 20,
  },
  icon: {
    fontSize: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.md,
  },
  statsContainer: {
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 18,
    width: 28,
  },
  statLabel: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
    opacity: 0.9,
  },
  statValue: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  insightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  ctaContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
