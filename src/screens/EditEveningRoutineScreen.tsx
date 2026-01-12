import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/EmptyState';

type EditEveningRoutineScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditEveningRoutine'>;
};

export default function EditEveningRoutineScreen({ navigation }: EditEveningRoutineScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const [routine, setRoutine] = useState(journal.eveningRoutine);
  const styles = createStyles(colors);

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
    <View style={styles.modalOverlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Evening Routine</Text>
          <Text style={styles.description}>
            Define your ideal evening routine. How do you want to wind down and reflect on your day?
          </Text>

          {!routine.trim() && (
            <EmptyState message="No evening routine yet. Start building your ideal evening!" />
          )}
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
  textArea: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 300,
    lineHeight: 24,
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
