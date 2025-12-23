import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';

type EditRemindersScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditReminders'>;
};

export default function EditRemindersScreen({ navigation }: EditRemindersScreenProps) {
  const { journal, updateJournal } = useJournal();
  const [reminders, setReminders] = useState<string[]>(journal.dailyReminders);
  const [newReminder, setNewReminder] = useState('');

  const addReminder = () => {
    if (newReminder.trim()) {
      if (reminders.length >= 10) {
        Alert.alert('Limit Reached', 'You can add up to 10 daily reminders.');
        return;
      }
      setReminders([...reminders, newReminder.trim()]);
      setNewReminder('');
    }
  };

  const removeReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateJournal({ dailyReminders: reminders });
      Alert.alert('Saved', 'Your daily reminders have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminders.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Daily Reminders</Text>
        <Text style={styles.description}>
          Set up to 10 reminders of who you're becoming and what matters most.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a daily reminder..."
            value={newReminder}
            onChangeText={setNewReminder}
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={addReminder}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.countText}>{reminders.length} / 10 reminders</Text>

        <View style={styles.listContainer}>
          {reminders.map((reminder, index) => (
            <View key={index} style={styles.reminderCard}>
              <Text style={styles.reminderText}>{reminder}</Text>
              <TouchableOpacity onPress={() => removeReminder(index)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2C3E50',
    marginRight: 8,
    minHeight: 50,
  },
  addButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderText: {
    flex: 1,
    fontSize: 16,
    color: '#34495E',
    lineHeight: 22,
  },
  removeText: {
    fontSize: 20,
    color: '#E74C3C',
    marginLeft: 12,
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
