import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';

type EditGoalsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditGoals'>;
};

export default function EditGoalsScreen({ navigation }: EditGoalsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const [goals, setGoals] = useState(journal.goals);

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.description}>
          Define clear goals across the key areas of your life.
        </Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 24,
  },
  goalSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 100,
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF9F5',
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
