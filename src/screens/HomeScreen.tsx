import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { useActivity } from '../context/ActivityContext';
import { ProgressCard } from '../components/ProgressCard';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const journalSections = [
  { title: 'Affirmations', route: 'EditAffirmations' as const, icon: '✨', color: ['#FF9A76', '#FF6B9D'] as const },
  { title: 'Vision Board', route: 'EditVisionBoard' as const, icon: '🖼️', color: ['#B19CD9', '#9B7EBD'] as const },
  { title: 'Morning Routine', route: 'EditMorningRoutine' as const, icon: '🌅', color: ['#A8E6CF', '#8FBC8F'] as const },
  { title: 'Evening Routine', route: 'EditEveningRoutine' as const, icon: '🌙', color: ['#FFB6C1', '#FF69B4'] as const },
  { title: 'Goals', route: 'EditGoals' as const, icon: '🎯', color: ['#FFB347', '#FF8C42'] as const },
  { title: 'Traits', route: 'EditTraits' as const, icon: '💎', color: ['#87CEEB', '#6BB6E3'] as const },
  { title: 'Standards', route: 'EditStandards' as const, icon: '⭐', color: ['#FFD700', '#FFC700'] as const },
  { title: 'Daily Reminders', route: 'EditReminders' as const, icon: '🔔', color: ['#FF9A76', '#FF7F66'] as const },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { activity, hasCheckedInToday } = useActivity();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <Text style={styles.title}>Radiant</Text>
          <Text style={styles.subtitle}>Your Self-Transcendence Journal</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ViewJournal')}
        >
          <LinearGradient
            colors={colors.gradients.secondary}
            style={styles.viewButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.viewButtonIcon}>📖</Text>
            <Text style={styles.viewButtonText}>View My Journal</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.progressCardContainer}>
          <ProgressCard
            streakData={activity.streakData}
            checkIns={activity.checkIns}
            hasCheckedInToday={hasCheckedInToday}
            onPress={() => navigation.navigate('DailyCheckIn')}
          />
        </View>

        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionHeader}>Journal Sections</Text>
          <View style={styles.cardsGrid}>
            {journalSections.map((section) => (
              <TouchableOpacity
                key={section.route}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(section.route)}
                style={styles.cardWrapper}
              >
                <View style={styles.sectionCard}>
                  <LinearGradient
                    colors={section.color}
                    style={styles.iconBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.iconText}>{section.icon}</Text>
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoSmall: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: {
    fontSize: 30,
  },
  title: {
    ...typography.h1,
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  viewButton: {
    marginHorizontal: spacing.lg,
    paddingVertical: 20,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: spacing.xl,
  },
  viewButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  viewButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 18,
  },
  progressCardContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionsContainer: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  cardsGrid: {
    marginTop: -spacing.sm,
  },
  cardWrapper: {
    marginTop: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 24,
  },
  sectionTitle: {
    flex: 1,
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: colors.text.tertiary,
  },
});
