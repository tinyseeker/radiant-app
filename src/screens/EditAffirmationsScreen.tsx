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

type EditAffirmationsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditAffirmations'>;
};

export default function EditAffirmationsScreen({ navigation }: EditAffirmationsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [affirmations, setAffirmations] = useState<string[]>(journal.affirmations);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const styles = createStyles(colors);

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 150), animated: true });
  };

  const addAffirmation = () => {
    if (newAffirmation.trim()) {
      if (editingIndex !== null) {
        const updated = [...affirmations];
        updated[editingIndex] = newAffirmation.trim();
        setAffirmations(updated);
        setEditingIndex(null);
      } else {
        if (affirmations.length >= 100) {
          Alert.alert('Limit Reached', 'You can add up to 100 affirmations.');
          return;
        }
        setAffirmations([...affirmations, newAffirmation.trim()]);
      }
      setNewAffirmation('');
      setIsInputFocused(false);
      inputRef.current?.blur();
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setExpandedIndex(null);
    setNewAffirmation(affirmations[index]);
    inputRef.current?.focus();
  };

  const toggleExpand = (index: number) => {
    if (editingIndex !== null) return;
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewAffirmation('');
  };

  const removeAffirmation = (index: number) => {
    if (editingIndex === index) {
      cancelEditing();
    }
    setAffirmations(affirmations.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...affirmations];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setAffirmations(updated);
  };

  const moveDown = (index: number) => {
    if (index === affirmations.length - 1) return;
    const updated = [...affirmations];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setAffirmations(updated);
  };

  const handleSave = async () => {
    try {
      await updateJournal({ affirmations });
      Alert.alert('Saved', 'Your affirmations have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save affirmations.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Affirmations</Text>
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
            Create powerful affirmations that align with who you're becoming. Use arrows to reorder.
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                isInputFocused && styles.inputExpanded,
                editingIndex !== null && styles.inputEditing,
              ]}
              placeholder={isInputFocused ? "Write your affirmation here... Make it personal, powerful, and present tense." : "I am..."}
              placeholderTextColor={colors.text.tertiary}
              value={newAffirmation}
              onChangeText={setNewAffirmation}
              multiline
              textAlignVertical="top"
              onFocus={(e) => {
                setIsInputFocused(true);
                e.target.measure((x, y, width, height, pageX, pageY) => {
                  scrollToInput(pageY);
                });
              }}
              onBlur={() => {
                if (!newAffirmation.trim()) {
                  setIsInputFocused(false);
                }
              }}
            />
            <View style={styles.inputActions}>
              {editingIndex !== null && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => { cancelEditing(); setIsInputFocused(false); }}>
                  <Ionicons name="close" size={20} color={colors.text.secondary} />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.addButton, editingIndex !== null && styles.updateButton]} onPress={addAffirmation}>
                <Text style={styles.addButtonText}>{editingIndex !== null ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.countText}>{affirmations.length} / 100 affirmations</Text>

          <View style={styles.listContainer}>
            {affirmations.length === 0 ? (
              <EmptyState message="No affirmations yet. Add your first one above!" />
            ) : (
              affirmations.map((affirmation, index) => {
                const isExpanded = expandedIndex === index;
                const isLong = affirmation.length > 100;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.affirmationCard, editingIndex === index && styles.cardEditing]}
                    onPress={() => isLong ? toggleExpand(index) : startEditing(index)}
                    onLongPress={() => startEditing(index)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reorderButtons}>
                      <TouchableOpacity
                        onPress={() => moveUp(index)}
                        disabled={index === 0}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="chevron-up"
                          size={20}
                          color={index === 0 ? colors.text.light : colors.text.secondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveDown(index)}
                        disabled={index === affirmations.length - 1}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={index === affirmations.length - 1 ? colors.text.light : colors.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cardContent}>
                      <Text
                        style={styles.affirmationText}
                        numberOfLines={isExpanded ? undefined : 2}
                      >
                        {affirmation}
                      </Text>
                      {isLong && (
                        <Text style={styles.expandHint}>
                          {isExpanded ? 'Tap to collapse • Long press to edit' : 'Tap to expand'}
                        </Text>
                      )}
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity onPress={() => startEditing(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="pencil" size={16} color={colors.text.tertiary} style={styles.editIcon} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeAffirmation(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
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
  inputWrapper: {
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
    minHeight: 50,
  },
  inputExpanded: {
    minHeight: 120,
    paddingBottom: 50,
  },
  inputEditing: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelButton: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: colors.text.secondary,
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
  affirmationCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  reorderButtons: {
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  affirmationText: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
    lineHeight: 22,
  },
  expandHint: {
    fontSize: 12,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.tertiary,
    marginTop: 6,
    fontStyle: 'italic',
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
