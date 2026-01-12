import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../hooks/useTheme';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const journalSections = [
  { title: 'Affirmations', route: 'EditAffirmations' as const, icon: '✨', image: require('../../assets/phoenix pray - transparent background.png'), color: ['#FF9A76', '#FF6B9D'] as const },
  { title: 'Vision Board', route: 'EditVisionBoard' as const, icon: '🖼️', image: require('../../assets/vision board.png'), color: ['#B19CD9', '#9B7EBD'] as const },
  { title: 'Morning Routine', route: 'EditMorningRoutine' as const, icon: '🌅', image: require('../../assets/phoenix morning - transparent background.png'), color: ['#A8E6CF', '#8FBC8F'] as const },
  { title: 'Evening Routine', route: 'EditEveningRoutine' as const, icon: '🌙', image: require('../../assets/phoenix night - transparent background.png'), color: ['#FFB6C1', '#FF69B4'] as const },
  { title: 'Goals', route: 'EditGoals' as const, icon: '🎯', image: require('../../assets/phoenix goal- transparent background.png'), color: ['#FFB347', '#FF8C42'] as const },
  { title: 'Traits', route: 'EditTraits' as const, icon: '💎', image: require('../../assets/phoenix diamond - transparent background.png'), color: ['#87CEEB', '#6BB6E3'] as const },
  { title: 'Standards', route: 'EditStandards' as const, icon: '⭐', image: require('../../assets/phoenix diamond - transparent background (2).png'), color: ['#FFD700', '#FFC700'] as const },
  { title: 'Daily Reminders', route: 'EditReminders' as const, icon: '🔔', image: require('../../assets/phoenix bell - transparent background.png'), color: ['#FF9A76', '#FF7F66'] as const },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoSmall}>
            <Image
              source={require('../../assets/phoenix - transparent.png')}
              style={styles.phoenixImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Radiant</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                <BlurView
                  intensity={isDarkMode ? 40 : 20}
                  tint={isDarkMode ? 'dark' : 'light'}
                  style={styles.sectionCard}
                >
                  {section.image ? (
                    <Image
                      source={section.image}
                      style={styles.iconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.iconText}>{section.icon}</Text>
                  )}
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors | typeof import('../theme/colors').darkColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoSmall: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  phoenixImage: {
    width: 50,
    height: 50,
  },
  logoEmoji: {
    fontSize: 30,
  },
  title: {
    ...typography.h1,
    color: colors.text.white,
    fontSize: 28,
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
    paddingBottom: 120,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  sectionCard: {
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    overflow: 'hidden',
    shadowColor: isDarkMode ? '#000' : colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  iconImage: {
    width: 50,
    height: 50,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 15,
  },
});
