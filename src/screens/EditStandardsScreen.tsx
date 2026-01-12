import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/EmptyState';

type EditStandardsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditStandards'>;
};

export default function EditStandardsScreen({ navigation }: EditStandardsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const [standards, setStandards] = useState<string[]>(journal.standards);
  const [newStandard, setNewStandard] = useState('');
  const styles = createStyles(colors);

  const addStandard = () => {
    if (newStandard.trim()) {
      setStandards([...standards, newStandard.trim()]);
      setNewStandard('');
    }
  };

  const removeStandard = (index: number) => {
    setStandards(standards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateJournal({ standards });
      Alert.alert('Saved', 'Your standards have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save standards.');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Standards & Non-Negotiables</Text>
        <Text style={styles.description}>
          Define your unquestionable standards. These are the behaviors and principles you refuse to compromise on.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter a standard..."
            value={newStandard}
            onChangeText={setNewStandard}
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={addStandard}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.countText}>{standards.length} standards</Text>

        <View style={styles.listContainer}>
          {standards.length === 0 ? (
            <EmptyState message="No standards yet. Add your first one above!" />
          ) : (
            standards.map((standard, index) => (
              <View key={index} style={styles.standardCard}>
                <Text style={styles.standardText}>{standard}</Text>
                <TouchableOpacity onPress={() => removeStandard(index)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text.primary,
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
    color: colors.text.tertiary,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  standardCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  standardText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  removeText: {
    fontSize: 20,
    color: '#E74C3C',
    marginLeft: 12,
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
