import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { VisionBoardCategory } from '../types/journal';
import { useTheme } from '../hooks/useTheme';

type ViewJournalScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ViewJournal'>;
};

export default function ViewJournalScreen({ navigation }: ViewJournalScreenProps) {
  const { journal } = useJournal();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.mainTitle}>My Self-Transcendence Journal</Text>

      {journal.affirmations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affirmations</Text>
          {journal.affirmations.map((affirmation, index) => (
            <Text key={index} style={styles.listItem}>
              • {affirmation}
            </Text>
          ))}
        </View>
      )}

      {journal.morningRoutine && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning Routine</Text>
          <Text style={styles.bodyText}>{journal.morningRoutine}</Text>
        </View>
      )}

      {journal.eveningRoutine && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evening Routine</Text>
          <Text style={styles.bodyText}>{journal.eveningRoutine}</Text>
        </View>
      )}

      {(journal.goals.wealth || journal.goals.business || journal.goals.healthFitness || journal.goals.personalBehavior) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>

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
        </View>
      )}

      {journal.traits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Traits</Text>
          {journal.traits.map((trait, index) => (
            <Text key={index} style={styles.listItem}>
              • {trait}
            </Text>
          ))}
        </View>
      )}

      {journal.standards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standards & Non-Negotiables</Text>
          {journal.standards.map((standard, index) => (
            <Text key={index} style={styles.listItem}>
              • {standard}
            </Text>
          ))}
        </View>
      )}

      {journal.dailyReminders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          {journal.dailyReminders.map((reminder, index) => (
            <Text key={index} style={styles.listItem}>
              • {reminder}
            </Text>
          ))}
        </View>
      )}

      {/* Vision Boards */}
      {Object.entries(journal.visionBoards).some(([_, images]) => images.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vision Board</Text>

          {journal.visionBoards.roleModels.length > 0 && (
            <View style={styles.visionBoardCategory}>
              <Text style={styles.visionBoardLabel}>Role Models</Text>
              <View style={styles.imageGrid}>
                {journal.visionBoards.roleModels.map((image) => (
                  <View key={image.id} style={styles.visionImage}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.label && <Text style={styles.imageLabel}>{image.label}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {journal.visionBoards.lifestyle.length > 0 && (
            <View style={styles.visionBoardCategory}>
              <Text style={styles.visionBoardLabel}>Lifestyle</Text>
              <View style={styles.imageGrid}>
                {journal.visionBoards.lifestyle.map((image) => (
                  <View key={image.id} style={styles.visionImage}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.label && <Text style={styles.imageLabel}>{image.label}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {journal.visionBoards.bodyGoals.length > 0 && (
            <View style={styles.visionBoardCategory}>
              <Text style={styles.visionBoardLabel}>Body Goals</Text>
              <View style={styles.imageGrid}>
                {journal.visionBoards.bodyGoals.map((image) => (
                  <View key={image.id} style={styles.visionImage}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.label && <Text style={styles.imageLabel}>{image.label}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {journal.visionBoards.successSymbols.length > 0 && (
            <View style={styles.visionBoardCategory}>
              <Text style={styles.visionBoardLabel}>Success Symbols</Text>
              <View style={styles.imageGrid}>
                {journal.visionBoards.successSymbols.map((image) => (
                  <View key={image.id} style={styles.visionImage}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.label && <Text style={styles.imageLabel}>{image.label}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}

          {journal.visionBoards.inspiration.length > 0 && (
            <View style={styles.visionBoardCategory}>
              <Text style={styles.visionBoardLabel}>Inspiration</Text>
              <View style={styles.imageGrid}>
                {journal.visionBoards.inspiration.map((image) => (
                  <View key={image.id} style={styles.visionImage}>
                    <Image source={{ uri: image.uri }} style={styles.image} />
                    {image.label && <Text style={styles.imageLabel}>{image.label}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {journal.affirmations.length === 0 &&
       !journal.morningRoutine &&
       !journal.eveningRoutine &&
       journal.traits.length === 0 &&
       journal.standards.length === 0 &&
       journal.dailyReminders.length === 0 &&
       Object.entries(journal.visionBoards).every(([_, images]) => images.length === 0) && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your journal is empty.</Text>
          <Text style={styles.emptySubtext}>Start by adding your affirmations, routines, and goals.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 120,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF9A76',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  listItem: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 26,
    marginBottom: 8,
  },
  goalSection: {
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  visionBoardCategory: {
    marginBottom: 24,
  },
  visionBoardLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  visionImage: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: 6,
    marginBottom: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
