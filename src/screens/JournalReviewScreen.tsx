import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useActivity } from '../context/ActivityContext';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';

type JournalReviewScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'JournalReview'>;
};

type JournalSection = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: readonly [string, string];
};

const JOURNAL_SECTIONS: JournalSection[] = [
  { id: 'affirmations', title: 'Affirmations', icon: 'sparkles', color: ['#FF9A76', '#FF6B9D'] },
  { id: 'morningRoutine', title: 'Morning Routine', icon: 'sunny', color: ['#A8E6CF', '#8FBC8F'] },
  { id: 'dailyHabits', title: 'Daily Habits', icon: 'checkbox', color: ['#9ED2C6', '#54BAB9'] },
  { id: 'eveningRoutine', title: 'Evening Routine', icon: 'moon', color: ['#FFB6C1', '#FF69B4'] },
  { id: 'goals', title: 'Goals', icon: 'flag', color: ['#FFB347', '#FF8C42'] },
  { id: 'traits', title: 'My Traits', icon: 'diamond', color: ['#87CEEB', '#6BB6E3'] },
  { id: 'standards', title: 'Standards', icon: 'star', color: ['#FFD700', '#FFC700'] },
  { id: 'dailyReminders', title: 'Daily Reminders', icon: 'notifications', color: ['#B19CD9', '#9B7EBD'] },
  { id: 'visionBoard', title: 'Vision Board', icon: 'images', color: ['#FF9A76', '#FF6B9D'] },
];

export default function JournalReviewScreen({ navigation }: JournalReviewScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { journal } = useJournal();
  const { checkIn, hasCheckedInToday } = useActivity();
  const [currentIndex, setCurrentIndex] = useState(0);
  const styles = createStyles(colors, isDarkMode);

  const currentSection = JOURNAL_SECTIONS[currentIndex];
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === JOURNAL_SECTIONS.length - 1;

  const handleNext = async () => {
    if (!isLastSection) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete review - check in if not already done today
      if (!hasCheckedInToday) {
        try {
          await checkIn();
          Alert.alert(
            'Review Complete!',
            'Great job reviewing your journal today! Your streak has been updated.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } catch (error) {
          navigation.goBack();
        }
      } else {
        Alert.alert(
          'Review Complete!',
          "You've already checked in today. Keep up the great work!",
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderSectionContent = () => {
    switch (currentSection.id) {
      case 'affirmations':
        return (
          <View style={styles.contentContainer}>
            {journal.affirmations.length === 0 ? (
              <Text style={styles.emptyText}>No affirmations added yet</Text>
            ) : (
              journal.affirmations.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))
            )}
          </View>
        );

      case 'morningRoutine':
        return (
          <View style={styles.contentContainer}>
            {!journal.morningRoutine ? (
              <Text style={styles.emptyText}>No morning routine added yet</Text>
            ) : (
              <Text style={styles.bodyText}>{journal.morningRoutine}</Text>
            )}
          </View>
        );

      case 'dailyHabits':
        const dailyHabits = journal.dailyHabits || [];
        return (
          <View style={styles.contentContainer}>
            {dailyHabits.length === 0 ? (
              <Text style={styles.emptyText}>No daily habits added yet</Text>
            ) : (
              dailyHabits.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))
            )}
          </View>
        );

      case 'eveningRoutine':
        return (
          <View style={styles.contentContainer}>
            {!journal.eveningRoutine ? (
              <Text style={styles.emptyText}>No evening routine added yet</Text>
            ) : (
              <Text style={styles.bodyText}>{journal.eveningRoutine}</Text>
            )}
          </View>
        );

      case 'goals':
        const hasGoals = journal.goals.wealth || journal.goals.business ||
                         journal.goals.healthFitness || journal.goals.personalBehavior;
        return (
          <View style={styles.contentContainer}>
            {!hasGoals ? (
              <Text style={styles.emptyText}>No goals added yet</Text>
            ) : (
              <>
                {journal.goals.wealth && (
                  <View style={styles.goalSection}>
                    <Text style={styles.goalLabel}>Wealth</Text>
                    <Text style={styles.bodyText}>{journal.goals.wealth}</Text>
                  </View>
                )}
                {journal.goals.business && (
                  <View style={styles.goalSection}>
                    <Text style={styles.goalLabel}>Business</Text>
                    <Text style={styles.bodyText}>{journal.goals.business}</Text>
                  </View>
                )}
                {journal.goals.healthFitness && (
                  <View style={styles.goalSection}>
                    <Text style={styles.goalLabel}>Health & Fitness</Text>
                    <Text style={styles.bodyText}>{journal.goals.healthFitness}</Text>
                  </View>
                )}
                {journal.goals.personalBehavior && (
                  <View style={styles.goalSection}>
                    <Text style={styles.goalLabel}>Personal & Behavior</Text>
                    <Text style={styles.bodyText}>{journal.goals.personalBehavior}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        );

      case 'traits':
        return (
          <View style={styles.contentContainer}>
            {journal.traits.length === 0 ? (
              <Text style={styles.emptyText}>No traits added yet</Text>
            ) : (
              journal.traits.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))
            )}
          </View>
        );

      case 'standards':
        return (
          <View style={styles.contentContainer}>
            {journal.standards.length === 0 ? (
              <Text style={styles.emptyText}>No standards added yet</Text>
            ) : (
              journal.standards.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))
            )}
          </View>
        );

      case 'dailyReminders':
        return (
          <View style={styles.contentContainer}>
            {journal.dailyReminders.length === 0 ? (
              <Text style={styles.emptyText}>No daily reminders added yet</Text>
            ) : (
              journal.dailyReminders.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))
            )}
          </View>
        );

      case 'visionBoard':
        const allImages = [
          ...journal.visionBoards.roleModels,
          ...journal.visionBoards.lifestyle,
          ...journal.visionBoards.bodyGoals,
          ...journal.visionBoards.successSymbols,
          ...journal.visionBoards.inspiration,
        ];
        return (
          <View style={styles.contentContainer}>
            {allImages.length === 0 ? (
              <Text style={styles.emptyText}>No vision board images added yet</Text>
            ) : (
              <View style={styles.imageGrid}>
                {allImages.slice(0, 6).map((image) => (
                  <View key={image.id} style={styles.imageContainer}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.label && (
                      <Text style={styles.imageLabel} numberOfLines={1}>{image.label}</Text>
                    )}
                  </View>
                ))}
                {allImages.length > 6 && (
                  <View style={styles.moreImages}>
                    <Text style={styles.moreImagesText}>+{allImages.length - 6} more</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={currentSection.color}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + spacing.md }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={currentSection.icon} size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.sectionTitle}>{currentSection.title}</Text>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {JOURNAL_SECTIONS.length}
          </Text>
        </View>
      </LinearGradient>

      {/* Progress dots */}
      <View style={styles.progressContainer}>
        {JOURNAL_SECTIONS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
              index < currentIndex && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSectionContent()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={[styles.navigationContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary, isFirstSection && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstSection}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={isFirstSection ? colors.text.light : colors.text.primary} />
          <Text style={[styles.navButtonTextSecondary, isFirstSection && styles.navButtonTextDisabled]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={currentSection.color}
            style={styles.navButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.navButtonText}>{isLastSection ? 'Done' : 'Next'}</Text>
            <Ionicons name={isLastSection ? 'checkmark' : 'chevron-forward'} size={20} color="#FFFFFF" />
          </LinearGradient>
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
  header: {
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  contentContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 200,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.xl,
  },
  listItem: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  listItemText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  bodyText: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    lineHeight: 28,
  },
  goalSection: {
    marginBottom: spacing.lg,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Quicksand_600SemiBold',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    margin: 4,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFFFFF',
    fontSize: 10,
    padding: 4,
    textAlign: 'center',
  },
  moreImages: {
    width: '31%',
    aspectRatio: 1,
    margin: 4,
    borderRadius: borderRadius.md,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    ...typography.body,
    color: colors.text.secondary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  navButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  navButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    marginRight: spacing.xs,
  },
  navButtonTextSecondary: {
    ...typography.button,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  navButtonTextDisabled: {
    color: colors.text.light,
  },
});
