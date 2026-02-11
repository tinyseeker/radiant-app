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

type EditDailyHabitsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditDailyHabits'>;
};

export default function EditDailyHabitsScreen({ navigation }: EditDailyHabitsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<string[]>(journal.dailyHabits || []);
  const [newHabit, setNewHabit] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const styles = createStyles(colors);

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 150), animated: true });
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      if (editingIndex !== null) {
        const updated = [...habits];
        updated[editingIndex] = newHabit.trim();
        setHabits(updated);
        setEditingIndex(null);
      } else {
        if (habits.length >= 15) {
          Alert.alert('Limit Reached', 'You can add up to 15 daily habits.');
          return;
        }
        setHabits([...habits, newHabit.trim()]);
      }
      setNewHabit('');
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewHabit(habits[index]);
    inputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewHabit('');
  };

  const removeHabit = (index: number) => {
    if (editingIndex === index) {
      cancelEditing();
    }
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateJournal({ dailyHabits: habits });
      Alert.alert('Saved', 'Your daily habits have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save habits.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Habits</Text>
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
            Track up to 15 habits you want to build. Check them off each evening in your journal.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, editingIndex !== null && styles.inputEditing]}
              placeholder="Enter a habit (e.g., Drink 8 glasses of water)..."
              placeholderTextColor={colors.text.tertiary}
              value={newHabit}
              onChangeText={setNewHabit}
              onFocus={(e) => {
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  scrollToInput(pageY);
                });
              }}
            />
            {editingIndex !== null && (
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.addButton, editingIndex !== null && styles.updateButton]} onPress={addHabit}>
              <Text style={styles.addButtonText}>{editingIndex !== null ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.countText}>{habits.length} / 15 habits</Text>

          <View style={styles.listContainer}>
            {habits.length === 0 ? (
              <EmptyState message="No habits yet. Add your first one above!" />
            ) : (
              habits.map((habit, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.habitCard, editingIndex === index && styles.cardEditing]}
                  onPress={() => startEditing(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitIconContainer}>
                    <Ionicons name="checkbox-outline" size={20} color={colors.text.tertiary} />
                  </View>
                  <Text style={styles.habitText}>{habit}</Text>
                  <View style={styles.cardActions}>
                    <Ionicons name="pencil" size={16} color={colors.text.tertiary} style={styles.editIcon} />
                    <TouchableOpacity onPress={() => removeHabit(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
  },
  inputEditing: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cancelButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: '#8FBC8F',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  updateButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  countText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  listContainer: {
  },
  habitCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardEditing: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  habitIconContainer: {
    marginRight: spacing.sm,
  },
  habitText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginRight: spacing.sm,
  },
  removeText: {
    fontSize: 20,
    color: '#E74C3C',
    marginLeft: 4,
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
