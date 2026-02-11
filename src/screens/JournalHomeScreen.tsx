import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useActivity } from '../context/ActivityContext';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';

type JournalHomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'JournalHome'>;
};

// Get current week days (Mon-Sun)
const getCurrentWeekDays = () => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push({
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
      isToday: day.toDateString() === today.toDateString(),
    });
  }
  return days;
};

// Get most recent 7 entries
const getRecentEntries = (dailyEntries: Record<string, any>) => {
  return Object.values(dailyEntries)
    .sort((a: any, b: any) => {
      // Sort by date string (YYYY-MM-DD format sorts correctly)
      return b.date.localeCompare(a.date);
    })
    .slice(0, 7);
};

export default function JournalHomeScreen({ navigation }: JournalHomeScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { activity, hasCheckedInToday } = useActivity();
  const { journal } = useJournal();
  const styles = createStyles(colors, isDarkMode);

  const weekDays = getCurrentWeekDays();
  const recentEntries = getRecentEntries(journal.dailyEntries || {});

  // Check which days have check-ins
  const checkInDates = new Set(Object.keys(activity.checkIns));

  // Get a random affirmation (changes daily based on date seed)
  const dailyAffirmation = useMemo(() => {
    if (!journal.affirmations || journal.affirmations.length === 0) {
      return null;
    }
    // Use today's date as seed for consistent daily randomness
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % journal.affirmations.length;
    return journal.affirmations[index];
  }, [journal.affirmations]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Sky background image with overlay for blending */}
      <ImageBackground
        source={isDarkMode
          ? require('../../assets/sky image.jpeg')
          : require('../../assets/Sky sun.png')
        }
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.backgroundOverlay} />
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Your Journal</Text>

        {/* Streak Box */}
        <TouchableOpacity
          style={styles.streakBox}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('StreakHistory')}
        >
          <View style={styles.streakLeft}>
            <Text style={styles.streakNumber}>{activity.streakData.currentStreak}</Text>
            <Text style={styles.streakLabel}>streak</Text>
          </View>

          <View style={styles.weekContainer}>
            {weekDays.map((day, index) => {
              const hasCheckIn = checkInDates.has(day.date);
              return (
                <View key={index} style={styles.dayColumn}>
                  <View style={[
                    styles.dayBox,
                    hasCheckIn && styles.dayBoxCompleted,
                    day.isToday && styles.dayBoxToday,
                  ]}>
                    {hasCheckIn && (
                      <Ionicons name="flame" size={14} color="#FF6B35" />
                    )}
                  </View>
                  <Text style={[
                    styles.dayLabel,
                    day.isToday && styles.dayLabelToday,
                  ]}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>

        {/* Daily Affirmation */}
        {dailyAffirmation && (
          <View style={styles.affirmationSection}>
            <Text style={styles.affirmationLabel}>Daily Affirmation</Text>
            <Text style={styles.affirmationText}>{dailyAffirmation}</Text>
          </View>
        )}

        {/* My Inner World Section */}
        <View style={styles.transcendentSection}>
          <View style={styles.transcendentHeader}>
            <Text style={styles.transcendentTitle}>My Inner World</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entries Section */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>

          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No entries yet</Text>
              <Text style={styles.emptySubtext}>Start your daily journaling practice</Text>
            </View>
          ) : (
            recentEntries.map((entry: any) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => navigation.navigate('DailyEntry', { date: entry.date })}
                activeOpacity={0.7}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryDateRow}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    {entry.mood && (
                      <Text style={styles.moodEmoji}>
                        {entry.mood === 1 ? '😢' : entry.mood === 2 ? '😕' : entry.mood === 3 ? '😐' : entry.mood === 4 ? '😊' : '😄'}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                </View>

                {entry.gratitude && entry.gratitude.length > 0 && (
                  <View style={styles.entrySection}>
                    <View style={styles.entrySectionHeader}>
                      <Ionicons name="heart" size={14} color={colors.primary} />
                      <Text style={styles.entrySectionTitle}>Gratitude</Text>
                    </View>
                    <Text style={styles.entryPreview} numberOfLines={2}>
                      {entry.gratitude.slice(0, 2).join(' • ')}
                      {entry.gratitude.length > 2 ? ' ...' : ''}
                    </Text>
                  </View>
                )}

                {entry.eveningReview && (
                  <View style={styles.entrySection}>
                    <View style={styles.entrySectionHeader}>
                      <Ionicons name="moon" size={14} color={colors.secondary} />
                      <Text style={styles.entrySectionTitle}>Evening Review</Text>
                    </View>
                    <Text style={styles.entryPreview} numberOfLines={2}>{entry.eveningReview}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 100 }]}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('JournalReview')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#B19CD9', '#9B7EBD']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="book" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.fabLabel}>Review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('DailyEntry', { section: 'gratitude' })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="heart" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.fabLabel}>Gratitude</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate('DailyEntry', { section: 'evening' })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6B9B7B', '#7FAC7F']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="moon" size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.fabLabel}>Evening</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImageStyle: {
    opacity: isDarkMode ? 0.4 : 0.7,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDarkMode ? 'rgba(26, 26, 46, 0.6)' : 'rgba(248, 245, 252, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 200,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  streakBox: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakLeft: {
    alignItems: 'center',
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    minWidth: 60,
  },
  streakNumber: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.primary,
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Quicksand_500Medium',
    color: colors.text.secondary,
    marginTop: -2,
  },
  weekContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  dayColumn: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayBoxCompleted: {
    backgroundColor: isDarkMode ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 107, 53, 0.15)',
  },
  dayBoxToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: 'Quicksand_500Medium',
    color: colors.text.tertiary,
  },
  dayLabelToday: {
    color: colors.primary,
    fontFamily: 'Quicksand_700Bold',
  },
  affirmationSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  affirmationLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Quicksand_600SemiBold',
    marginBottom: spacing.sm,
  },
  affirmationText: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'CormorantGaramond_500Medium_Italic',
    fontSize: 18,
    lineHeight: 26,
  },
  transcendentSection: {
    marginBottom: spacing.lg,
  },
  transcendentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcendentTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.primary,
    marginRight: 2,
  },
  entriesSection: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    fontFamily: 'Quicksand_600SemiBold',
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.text.light,
    marginTop: spacing.xs,
  },
  entryCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  entryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryDate: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  entrySection: {
    marginTop: spacing.sm,
  },
  entrySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entrySectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Quicksand_600SemiBold',
    marginLeft: spacing.xs,
  },
  entryText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  entryPreview: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
    fontSize: 14,
  },
  moodEmoji: {
    fontSize: 16,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'flex-end',
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fabGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Quicksand_600SemiBold',
    marginRight: spacing.sm,
    position: 'absolute',
    right: 52,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
});
