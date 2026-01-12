import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/EmptyState';

type EditGoalsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditGoals'>;
};

export default function EditGoalsScreen({ navigation }: EditGoalsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const [goals, setGoals] = useState(journal.goals);
  const styles = createStyles(colors);

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
    <View style={styles.modalOverlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Goals</Text>
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
            value={goals.wealth}
            onChangeText={(text) => updateGoal('wealth', text)}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.label}>Business Goals</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What are your business and career goals?"
            value={goals.business}
            onChangeText={(text) => updateGoal('business', text)}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.label}>Health & Fitness Goals</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What are your health and fitness goals?"
            value={goals.healthFitness}
            onChangeText={(text) => updateGoal('healthFitness', text)}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.label}>Personal & Behavior Goals</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What personal development and behavior goals do you have?"
            value={goals.personalBehavior}
            onChangeText={(text) => updateGoal('personalBehavior', text)}
            multiline
            textAlignVertical="top"
          />
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 80,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  goalSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 100,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#FF9A76',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#FF9A76',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
