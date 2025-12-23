import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';

type EditEveningRoutineScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditEveningRoutine'>;
};

export default function EditEveningRoutineScreen({ navigation }: EditEveningRoutineScreenProps) {
  const { journal, updateJournal } = useJournal();
  const [routine, setRoutine] = useState(journal.eveningRoutine);

  const handleSave = async () => {
    try {
      await updateJournal({ eveningRoutine: routine });
      Alert.alert('Saved', 'Your evening routine has been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save evening routine.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Evening Routine</Text>
        <Text style={styles.description}>
          Define your ideal evening routine. How do you want to wind down and reflect on your day?
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Describe your evening routine...

Example:
• 8:00 PM - Finish work, disconnect from devices
• 8:30 PM - Light dinner
• 9:00 PM - Read journal, gratitude practice
• 9:30 PM - Reading or meditation
• 10:00 PM - Sleep"
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
