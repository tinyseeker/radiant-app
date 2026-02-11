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

type EditMorningRoutineScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditMorningRoutine'>;
};

export default function EditMorningRoutineScreen({ navigation }: EditMorningRoutineScreenProps) {
  const { journal, updateJournal } = useJournal();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [routine, setRoutine] = useState(journal.morningRoutine);
  const scrollViewRef = useRef<ScrollView>(null);
  const styles = createStyles(colors);

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
  };

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Morning Routine</Text>
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
            Define your ideal morning routine. How do you want to start each day?
          </Text>

          {!routine.trim() && (
            <EmptyState message="No morning routine yet. Start building your ideal morning!" />
          )}
          <TextInput
            style={styles.textArea}
            placeholder="Describe your morning routine...

Example:
• 6:00 AM - Wake up, hydrate
• 6:15 AM - Meditation & read journal
• 6:45 AM - Workout
• 7:30 AM - Healthy breakfast"
            placeholderTextColor={colors.text.tertiary}
            value={routine}
            onChangeText={setRoutine}
            multiline
            textAlignVertical="top"
            onFocus={(e) => {
              e.target.measure((x, y, width, height, pageX, pageY) => {
                scrollToInput(pageY);
              });
            }}
          />

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
  textArea: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
    minHeight: 300,
    lineHeight: 24,
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
