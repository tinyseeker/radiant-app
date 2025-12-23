import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';

type EditMorningRoutineScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditMorningRoutine'>;
};

export default function EditMorningRoutineScreen({ navigation }: EditMorningRoutineScreenProps) {
  const { journal, updateJournal } = useJournal();
  const [routine, setRoutine] = useState(journal.morningRoutine);

  const handleSave = async () => {
    try {
      await updateJournal({ morningRoutine: routine });
      Alert.alert('Saved', 'Your morning routine has been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save morning routine.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Morning Routine</Text>
        <Text style={styles.description}>
          Define your ideal morning routine. How do you want to start each day?
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Describe your morning routine...

Example:
• 6:00 AM - Wake up, hydrate
• 6:15 AM - Meditation & read journal
• 6:45 AM - Workout
• 7:30 AM - Healthy breakfast"
          value={routine}
          onChangeText={setRoutine}
          multiline
          textAlignVertical="top"
        />
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
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 300,
    lineHeight: 24,
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
