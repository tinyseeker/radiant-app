import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useActivity } from '../context/ActivityContext';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';

type StreakHistoryScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'StreakHistory'>;
};

// Helper to format date as YYYY-MM-DD using local timezone
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get days in a month
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

// Get month name
const getMonthName = (month: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
};

export default function StreakHistoryScreen({ navigation }: StreakHistoryScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { activity } = useActivity();
  const { journal } = useJournal();
  const styles = createStyles(colors, isDarkMode);

  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Calculate total entries
  const totalEntries = useMemo(() => {
    return Object.keys(journal.dailyEntries || {}).length;
  }, [journal.dailyEntries]);

  // Get dates with entries (check-ins or journal entries)
  const datesWithEntries = useMemo(() => {
    const dates = new Set<string>();

    // Add check-in dates
    Object.keys(activity.checkIns || {}).forEach(date => dates.add(date));

    // Add journal entry dates
    Object.keys(journal.dailyEntries || {}).forEach(date => dates.add(date));

    return dates;
  }, [activity.checkIns, journal.dailyEntries]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Generate calendar days for a month
  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days: (number | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Check if a date is today
  const isToday = (year: number, month: number, day: number): boolean => {
    return year === today.getFullYear() &&
           month === today.getMonth() &&
           day === today.getDate();
  };

  // Handle day press
  const handleDayPress = (year: number, month: number, day: number) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    if (datesWithEntries.has(dateKey)) {
      setSelectedDate(dateKey);
      setShowEntryModal(true);
    }
  };

  // Get entry for selected date
  const getSelectedEntry = () => {
    if (!selectedDate) return null;
    return journal.dailyEntries?.[selectedDate] || null;
  };

  // Format selected date for display
  const formatSelectedDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Generate months to display (current + 2 previous)
  const monthsToDisplay = useMemo(() => {
    const months = [];
    for (let i = 0; i < 3; i++) {
      let month = viewDate.month - i;
      let year = viewDate.year;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      months.push({ year, month });
    }
    return months;
  }, [viewDate]);

  const selectedEntry = getSelectedEntry();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak History</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dashboard Metrics */}
        <View style={styles.dashboardContainer}>
          <View style={styles.metricCard}>
            <Ionicons name="flame" size={24} color="#FF6B35" />
            <Text style={styles.metricValue}>{activity.streakData.currentStreak}</Text>
            <Text style={styles.metricLabel}>Current{'\n'}Streak</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.metricValue}>{activity.streakData.longestStreak}</Text>
            <Text style={styles.metricLabel}>Best{'\n'}Streak</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="journal" size={24} color={colors.primary} />
            <Text style={styles.metricValue}>{totalEntries}</Text>
            <Text style={styles.metricLabel}>Total{'\n'}Entries</Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {getMonthName(viewDate.month)} {viewDate.year}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendars (3 months) */}
        {monthsToDisplay.map(({ year, month }) => (
          <View key={`${year}-${month}`} style={styles.calendarSection}>
            <Text style={styles.calendarMonthTitle}>
              {getMonthName(month)} {year}
            </Text>

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <Text key={index} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays(year, month).map((day, index) => {
                if (day === null) {
                  return <View key={index} style={styles.dayCell} />;
                }

                const dateKey = formatDateKey(new Date(year, month, day));
                const hasEntry = datesWithEntries.has(dateKey);
                const isTodayDate = isToday(year, month, day);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      hasEntry && styles.dayCellWithEntry,
                      isTodayDate && styles.dayCellToday,
                    ]}
                    onPress={() => handleDayPress(year, month, day)}
                    disabled={!hasEntry}
                    activeOpacity={hasEntry ? 0.7 : 1}
                  >
                    <View style={styles.dayCellContent}>
                      <Text style={[
                        styles.dayText,
                        hasEntry && styles.dayTextWithEntry,
                        isTodayDate && styles.dayTextToday,
                      ]}>
                        {day}
                      </Text>
                      {hasEntry && (
                        <Ionicons name="flame" size={10} color="#FF6B35" style={styles.flameIcon} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Entry Detail Modal */}
      <Modal
        visible={showEntryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEntryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatSelectedDate(selectedDate) : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowEntryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedEntry ? (
                <>
                  {/* Gratitude Section */}
                  {selectedEntry.gratitude && selectedEntry.gratitude.length > 0 && (
                    <View style={styles.entrySection}>
                      <View style={styles.entrySectionHeader}>
                        <Ionicons name="heart" size={18} color={colors.primary} />
                        <Text style={styles.entrySectionTitle}>Gratitude</Text>
                      </View>
                      {selectedEntry.gratitude.map((item, index) => (
                        <Text key={index} style={styles.entryItem}>
                          {'\u2022'} {item}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Evening Reflection Section */}
                  {selectedEntry.eveningReview && (
                    <View style={styles.entrySection}>
                      <View style={styles.entrySectionHeader}>
                        <Ionicons name="moon" size={18} color={colors.secondary} />
                        <Text style={styles.entrySectionTitle}>Evening Reflection</Text>
                      </View>
                      <Text style={styles.entryText}>{selectedEntry.eveningReview}</Text>
                    </View>
                  )}

                  {/* Mood Section */}
                  {selectedEntry.mood && (
                    <View style={styles.entrySection}>
                      <View style={styles.entrySectionHeader}>
                        <Text style={styles.moodEmoji}>
                          {selectedEntry.mood === 1 ? '😢' :
                           selectedEntry.mood === 2 ? '😕' :
                           selectedEntry.mood === 3 ? '😐' :
                           selectedEntry.mood === 4 ? '😊' : '😄'}
                        </Text>
                        <Text style={styles.entrySectionTitle}>Mood</Text>
                      </View>
                    </View>
                  )}

                  {!selectedEntry.gratitude?.length && !selectedEntry.eveningReview && (
                    <Text style={styles.noEntryText}>No journal entry for this day, but you checked in!</Text>
                  )}
                </>
              ) : (
                <Text style={styles.noEntryText}>No entry details available.</Text>
              )}
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalEditButton}
                onPress={() => {
                  setShowEntryModal(false);
                  if (selectedDate) {
                    navigation.navigate('DailyEntry', { date: selectedDate });
                  }
                }}
              >
                <Ionicons name="pencil" size={18} color="#FFFFFF" />
                <Text style={styles.modalEditButtonText}>Edit Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowEntryModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricValue: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Quicksand_500Medium',
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
  },
  monthTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  calendarSection: {
    marginBottom: spacing.xl,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  calendarMonthTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.tertiary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellWithEntry: {
    backgroundColor: isDarkMode ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.1)',
    borderRadius: borderRadius.md,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: colors.text.secondary,
  },
  dayTextWithEntry: {
    color: colors.text.primary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  dayTextToday: {
    color: colors.primary,
    fontFamily: 'Quicksand_700Bold',
  },
  flameIcon: {
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: 400,
  },
  entrySection: {
    marginBottom: spacing.lg,
  },
  entrySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entrySectionTitle: {
    ...typography.body,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  entryItem: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.lg,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  entryText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  moodEmoji: {
    fontSize: 20,
  },
  noEntryText: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: 0,
  },
  modalEditButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  modalEditButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  modalCloseButton: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
