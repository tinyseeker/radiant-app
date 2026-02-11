import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/EmptyState';
import { spacing, borderRadius } from '../theme/colors';

type EditGoalsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditGoals'>;
};

export default function EditGoalsScreen({ navigation }: EditGoalsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState(journal.goals);
  const scrollViewRef = useRef<ScrollView>(null);
  const styles = createStyles(colors);

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
  };

  const updateGoal = (key: keyof typeof goals, value: string) => {
    setGoals({ ...goals, [key]: value });
  };

  const handleSave = async () => {
    try {
      await updateJournal({ goals });
      Alert.alert('Saved', 'Your goals have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals.');
    }
  };

  const hasAnyGoals = goals.wealth.trim() || goals.business.trim() || goals.healthFitness.trim() || goals.personalBehavior.trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Define clear goals across the key areas of your life.
          </Text>

          {!hasAnyGoals && (
            <EmptyState message="No goals yet. Start defining your goals below!" />
          )}

          <View style={styles.goalSection}>
            <Text style={styles.label}>Wealth Goals</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What are your financial and wealth goals?"
              placeholderTextColor={colors.text.tertiary}
              value={goals.wealth}
              onChangeText={(text) => updateGoal('wealth', text)}
              multiline
              textAlignVertical="top"
              onFocus={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  scrollToInput(pageY);
                });
              }}
            />
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.label}>Business Goals</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What are your business and career goals?"
              placeholderTextColor={colors.text.tertiary}
              value={goals.business}
              onChangeText={(text) => updateGoal('business', text)}
              multiline
              textAlignVertical="top"
              onFocus={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  scrollToInput(pageY);
                });
              }}
            />
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.label}>Health & Fitness Goals</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What are your health and fitness goals?"
              placeholderTextColor={colors.text.tertiary}
              value={goals.healthFitness}
              onChangeText={(text) => updateGoal('healthFitness', text)}
              multiline
              textAlignVertical="top"
              onFocus={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  scrollToInput(pageY);
                });
              }}
            />
          </View>

          <View style={styles.goalSection}>
            <Text style={styles.label}>Personal & Behavior Goals</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What personal development and behavior goals do you have?"
              placeholderTextColor={colors.text.tertiary}
              value={goals.personalBehavior}
              onChangeText={(text) => updateGoal('personalBehavior', text)}
              multiline
              textAlignVertical="top"
              onFocus={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  scrollToInput(pageY);
                });
              }}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors) => StyleSheet.create({
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
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: 100,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  goalSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 17,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
    minHeight: 100,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
