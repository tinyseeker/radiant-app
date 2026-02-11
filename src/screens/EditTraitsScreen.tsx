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

type EditTraitsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditTraits'>;
};

const SAMPLE_TRAITS = [
  'Confident', 'Disciplined', 'Resilient', 'Kind', 'Focused',
  'Grateful', 'Patient', 'Ambitious', 'Compassionate', 'Authentic',
  'Courageous', 'Creative', 'Determined', 'Empathetic', 'Honest',
  'Humble', 'Optimistic', 'Passionate', 'Persistent', 'Wise',
];

export default function EditTraitsScreen({ navigation }: EditTraitsScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [traits, setTraits] = useState<string[]>(journal.traits);
  const [newTrait, setNewTrait] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const styles = createStyles(colors);

  const availableSampleTraits = SAMPLE_TRAITS.filter(
    sample => !traits.some(t => t.toLowerCase() === sample.toLowerCase())
  );

  const INITIAL_TRAITS_COUNT = 6;
  const visibleSampleTraits = showAllSuggestions
    ? availableSampleTraits
    : availableSampleTraits.slice(0, INITIAL_TRAITS_COUNT);
  const hasMoreTraits = availableSampleTraits.length > INITIAL_TRAITS_COUNT;

  const addSampleTrait = (trait: string) => {
    if (traits.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 traits.');
      return;
    }
    setTraits([...traits, trait]);
  };

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 150), animated: true });
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      if (editingIndex !== null) {
        const updated = [...traits];
        updated[editingIndex] = newTrait.trim();
        setTraits(updated);
        setEditingIndex(null);
      } else {
        if (traits.length >= 10) {
          Alert.alert('Limit Reached', 'You can add up to 10 traits.');
          return;
        }
        setTraits([...traits, newTrait.trim()]);
      }
      setNewTrait('');
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewTrait(traits[index]);
    inputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setNewTrait('');
  };

  const removeTrait = (index: number) => {
    if (editingIndex === index) {
      cancelEditing();
    }
    setTraits(traits.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...traits];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setTraits(updated);
  };

  const moveDown = (index: number) => {
    if (index === traits.length - 1) return;
    const updated = [...traits];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setTraits(updated);
  };

  const handleSave = async () => {
    try {
      await updateJournal({ traits });
      Alert.alert('Saved', 'Your traits have been saved.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save traits.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Traits</Text>
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
            Define 5-10 key traits that describe the person you're becoming. Use arrows to reorder.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, editingIndex !== null && styles.inputEditing]}
              placeholder="Enter a trait or tap suggestions below..."
              placeholderTextColor={colors.text.tertiary}
              value={newTrait}
              onChangeText={setNewTrait}
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
            <TouchableOpacity style={[styles.addButton, editingIndex !== null && styles.updateButton]} onPress={addTrait}>
              <Text style={styles.addButtonText}>{editingIndex !== null ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>

          {availableSampleTraits.length > 0 && traits.length < 10 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsLabel}>Tap to add:</Text>
              <View style={styles.suggestionsGrid}>
                {visibleSampleTraits.map((sample, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => addSampleTrait(sample)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text style={styles.suggestionText}>{sample}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {hasMoreTraits && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllSuggestions(!showAllSuggestions)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.showMoreText}>
                    {showAllSuggestions ? 'Show less' : `Show ${availableSampleTraits.length - INITIAL_TRAITS_COUNT} more`}
                  </Text>
                  <Ionicons
                    name={showAllSuggestions ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          <Text style={styles.countText}>{traits.length} / 10 traits</Text>

          <View style={styles.listContainer}>
            {traits.length === 0 ? (
              <EmptyState message="No traits yet. Add your first one above!" />
            ) : (
              traits.map((trait, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.traitCard, editingIndex === index && styles.cardEditing]}
                  onPress={() => startEditing(index)}
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
                      disabled={index === traits.length - 1}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={index === traits.length - 1 ? colors.text.light : colors.text.secondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.traitText}>{trait}</Text>
                  <View style={styles.cardActions}>
                    <Ionicons name="pencil" size={16} color={colors.text.tertiary} style={styles.editIcon} />
                    <TouchableOpacity onPress={() => removeTrait(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
  suggestionsContainer: {
    marginBottom: spacing.md,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: colors.primary,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.secondary,
  },
  countText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  listContainer: {
  },
  traitCard: {
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
  reorderButtons: {
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitText: {
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
