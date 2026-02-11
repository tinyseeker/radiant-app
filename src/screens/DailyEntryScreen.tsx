import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';
import { MoodRating, DailyJournalEntry } from '../types/journal';

type DailyEntryScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'DailyEntry'>;
  route: RouteProp<RootStackParamList, 'DailyEntry'>;
};

type MoodOption = {
  value: MoodRating;
  emoji: string;
  label: string;
  color: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😢', label: 'Terrible', color: '#E74C3C' },
  { value: 2, emoji: '😕', label: 'Bad', color: '#E67E22' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#F1C40F' },
  { value: 4, emoji: '😊', label: 'Good', color: '#2ECC71' },
  { value: 5, emoji: '😄', label: 'Great', color: '#27AE60' },
];

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function DailyEntryScreen({ navigation, route }: DailyEntryScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { journal, updateJournal } = useJournal();
  const styles = createStyles(colors, isDarkMode);
  const scrollViewRef = useRef<ScrollView>(null);
  const gratitude1Ref = useRef<TextInput>(null);
  const gratitude2Ref = useRef<TextInput>(null);
  const gratitude3Ref = useRef<TextInput>(null);
  const reflectionRef = useRef<TextInput>(null);

  const initialSection = route.params?.section || 'gratitude';
  // Use date from params if provided, otherwise use today
  const entryDate = route.params?.date || getCurrentDate();

  // Get existing entry for the specified date if it exists
  const existingEntry = journal.dailyEntries?.[entryDate];

  // State
  const [gratitude1, setGratitude1] = useState(existingEntry?.gratitude?.[0] || '');
  const [gratitude2, setGratitude2] = useState(existingEntry?.gratitude?.[1] || '');
  const [gratitude3, setGratitude3] = useState(existingEntry?.gratitude?.[2] || '');
  const [eveningReview, setEveningReview] = useState(existingEntry?.eveningReview || '');
  const [mood, setMood] = useState<MoodRating | undefined>(existingEntry?.mood);
  const [completedHabits, setCompletedHabits] = useState<string[]>(existingEntry?.completedHabits || []);
  const [activeSection, setActiveSection] = useState<'gratitude' | 'evening'>(initialSection);
  const [entryId] = useState(existingEntry?.id || generateId());
  const [createdAt] = useState(existingEntry?.createdAt || Date.now());

  // Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false);
  const speechModuleRef = useRef<any>(null);

  // Check if speech recognition is available (not in Expo Go)
  useEffect(() => {
    const checkSpeechAvailability = async () => {
      try {
        const speechModule = await import('expo-speech-recognition');
        speechModuleRef.current = speechModule.ExpoSpeechRecognitionModule;
        setIsSpeechAvailable(true);

        // Set up event listeners
        const startSub = speechModule.ExpoSpeechRecognitionModule.addListener('start', () => {
          setIsRecording(true);
        });
        const endSub = speechModule.ExpoSpeechRecognitionModule.addListener('end', () => {
          setIsRecording(false);
        });
        const resultSub = speechModule.ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
          const transcript = event.results?.[0]?.transcript || '';
          if (transcript) {
            setEveningReview(prev => prev ? `${prev} ${transcript}` : transcript);
          }
        });
        const errorSub = speechModule.ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
          setIsRecording(false);
          Alert.alert('Voice Recognition Error', event.error || 'Something went wrong. Please try again.');
        });

        return () => {
          startSub?.remove();
          endSub?.remove();
          resultSub?.remove();
          errorSub?.remove();
        };
      } catch {
        // Speech recognition not available (Expo Go)
        setIsSpeechAvailable(false);
      }
    };
    checkSpeechAvailability();
  }, []);

  // Start/stop voice recording
  const toggleVoiceRecording = async () => {
    if (!isSpeechAvailable || !speechModuleRef.current) {
      Alert.alert(
        'Not Available',
        'Voice input requires a development build. It is not available in Expo Go.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (isRecording) {
      speechModuleRef.current.stop();
      return;
    }

    // Request permissions
    const result = await speechModuleRef.current.requestPermissionsAsync();
    if (!result.granted) {
      Alert.alert(
        'Permission Required',
        'Please enable microphone and speech recognition permissions in your device settings to use voice input.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Start speech recognition
    speechModuleRef.current.start({
      lang: 'en-US',
      interimResults: false,
      continuous: true,
    });
  };

  // Get daily habits from journal
  const dailyHabits = journal.dailyHabits || [];

  // Toggle habit completion
  const toggleHabit = (habit: string) => {
    setCompletedHabits(prev =>
      prev.includes(habit)
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  };

  // Auto-save function
  const saveEntry = useCallback(async (
    g1: string,
    g2: string,
    g3: string,
    evening: string,
    currentMood: MoodRating | undefined,
    habits: string[]
  ) => {
    const gratitudeList = [g1, g2, g3].filter(g => g.trim() !== '');
    const hasContent = gratitudeList.length > 0 || evening.trim() !== '' || currentMood !== undefined || habits.length > 0;

    if (!hasContent) return;

    const entry: DailyJournalEntry = {
      id: entryId,
      date: entryDate,
      gratitude: gratitudeList,
      eveningReview: evening.trim(),
      mood: currentMood,
      completedHabits: habits,
      createdAt,
      updatedAt: Date.now(),
    };

    const updatedEntries = {
      ...journal.dailyEntries,
      [entryDate]: entry,
    };

    await updateJournal({ dailyEntries: updatedEntries });
  }, [entryId, entryDate, createdAt, journal.dailyEntries, updateJournal]);

  // Debounced auto-save effect
  useEffect(() => {
    const hasContent = gratitude1.trim() || gratitude2.trim() || gratitude3.trim() || eveningReview.trim() || mood !== undefined || completedHabits.length > 0;
    if (!hasContent) return;

    const timeoutId = setTimeout(() => {
      saveEntry(gratitude1, gratitude2, gratitude3, eveningReview, mood, completedHabits);
    }, 500); // Save 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [gratitude1, gratitude2, gratitude3, eveningReview, mood, completedHabits, saveEntry]);

  const handleSave = async () => {
    // Final save before navigating away
    await saveEntry(gratitude1, gratitude2, gratitude3, eveningReview, mood, completedHabits);
    navigation.goBack();
  };

  const formatDate = () => {
    const date = new Date(entryDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Track keyboard height and visibility
  const keyboardHeightRef = useRef(0);
  const currentScrollY = useRef(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        keyboardHeightRef.current = e.endCoordinates.height;
        setIsKeyboardVisible(true);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardHeightRef.current = 0;
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Track scroll position
  const handleScroll = (event: any) => {
    currentScrollY.current = event.nativeEvent.contentOffset.y;
  };

  // Scroll to input when focused - wait for keyboard to appear
  const handleInputFocus = (inputRef: React.RefObject<TextInput>) => {
    // Wait for keyboard to be fully shown
    const delay = Platform.OS === 'ios' ? 300 : 500;
    setTimeout(() => {
      if (!inputRef.current) return;

      inputRef.current.measureInWindow((x, y, width, height) => {
        const screenHeight = Dimensions.get('window').height;
        const keyboardHeight = keyboardHeightRef.current || 320; // Fallback height
        // Only add small margin (20px) since footer is hidden when keyboard is visible
        const visibleAreaBottom = screenHeight - keyboardHeight - 20;
        const inputBottom = y + height;

        // Only scroll if input is below visible area
        if (inputBottom > visibleAreaBottom) {
          // Scroll just enough to show input with 10px margin above keyboard
          const scrollNeeded = inputBottom - visibleAreaBottom + 10;
          const newScrollY = currentScrollY.current + scrollNeeded;
          scrollViewRef.current?.scrollTo({ y: newScrollY, animated: true });
        }
      });
    }, delay);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <LinearGradient
        colors={activeSection === 'gratitude' ? colors.gradients.primary : ['#6B9B7B', '#7FAC7F']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.dateText}>{formatDate()}</Text>
          <Text style={styles.headerTitle}>Daily Journal</Text>
        </View>

        {/* Section Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeSection === 'gratitude' && styles.tabActive]}
            onPress={() => setActiveSection('gratitude')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="heart"
              size={18}
              color={activeSection === 'gratitude' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[styles.tabText, activeSection === 'gratitude' && styles.tabTextActive]}>
              Gratitude
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeSection === 'evening' && styles.tabActive]}
            onPress={() => setActiveSection('evening')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="moon"
              size={18}
              color={activeSection === 'evening' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[styles.tabText, activeSection === 'evening' && styles.tabTextActive]}>
              Evening
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {activeSection === 'gratitude' ? (
          <View style={styles.section}>
            <Text style={styles.promptTitle}>What are 3 things you're grateful for today?</Text>
            <Text style={styles.promptSubtitle}>
              Taking a moment to appreciate the good things in life can boost your mood and wellbeing.
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.inputNumber}>1</Text>
                <TextInput
                  ref={gratitude1Ref}
                  style={styles.textInput}
                  placeholder="I'm grateful for..."
                  placeholderTextColor={colors.text.tertiary}
                  value={gratitude1}
                  onChangeText={setGratitude1}
                  onFocus={() => handleInputFocus(gratitude1Ref)}
                  multiline
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputNumber}>2</Text>
                <TextInput
                  ref={gratitude2Ref}
                  style={styles.textInput}
                  placeholder="I'm grateful for..."
                  placeholderTextColor={colors.text.tertiary}
                  value={gratitude2}
                  onChangeText={setGratitude2}
                  onFocus={() => handleInputFocus(gratitude2Ref)}
                  multiline
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputNumber}>3</Text>
                <TextInput
                  ref={gratitude3Ref}
                  style={styles.textInput}
                  placeholder="I'm grateful for..."
                  placeholderTextColor={colors.text.tertiary}
                  value={gratitude3}
                  onChangeText={setGratitude3}
                  onFocus={() => handleInputFocus(gratitude3Ref)}
                  multiline
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.promptTitle}>How was your day?</Text>
            <Text style={styles.promptSubtitle}>
              Reflect on your day - what went well, what could be better, and how you're feeling.
            </Text>

            {/* Mood Selector */}
            <View style={styles.moodContainer}>
              <Text style={styles.moodLabel}>How are you feeling?</Text>
              <View style={styles.moodOptions}>
                {MOOD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.moodOption,
                      mood === option.value && styles.moodOptionSelected,
                      mood === option.value && { borderColor: option.color },
                    ]}
                    onPress={() => setMood(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.moodText,
                        mood === option.value && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Habit Tracker */}
            {dailyHabits.length > 0 && (
              <View style={styles.habitTrackerContainer}>
                <Text style={styles.habitTrackerLabel}>Daily Habits</Text>
                <Text style={styles.habitTrackerSubtitle}>
                  {completedHabits.length} of {dailyHabits.length} completed
                </Text>
                <View style={styles.habitsList}>
                  {dailyHabits.map((habit, index) => {
                    const isCompleted = completedHabits.includes(habit);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.habitItem,
                          isCompleted && styles.habitItemCompleted,
                        ]}
                        onPress={() => toggleHabit(habit)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.habitCheckbox,
                          isCompleted && styles.habitCheckboxCompleted,
                        ]}>
                          {isCompleted && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={[
                          styles.habitText,
                          isCompleted && styles.habitTextCompleted,
                        ]}>
                          {habit}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Evening Reflection */}
            <View style={styles.reflectionContainer}>
              <View style={styles.reflectionHeader}>
                <Text style={styles.reflectionLabel}>Evening Reflection</Text>
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    isRecording && styles.voiceButtonActive,
                  ]}
                  onPress={toggleVoiceRecording}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isRecording ? 'stop' : 'mic'}
                    size={20}
                    color={isRecording ? '#FFFFFF' : colors.primary}
                  />
                  <Text style={[
                    styles.voiceButtonText,
                    isRecording && styles.voiceButtonTextActive,
                  ]}>
                    {isRecording ? 'Stop' : 'Voice'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                ref={reflectionRef}
                style={styles.reflectionInput}
                placeholder="Write about your day... What happened? What did you learn? What are you looking forward to tomorrow?"
                placeholderTextColor={colors.text.tertiary}
                value={eveningReview}
                onChangeText={setEveningReview}
                onFocus={() => handleInputFocus(reflectionRef)}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button - hidden when keyboard is visible */}
      {!isKeyboardVisible && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={activeSection === 'gratitude' ? colors.gradients.primary : ['#6B9B7B', '#7FAC7F']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.saveButtonText}>Save Entry</Text>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  dateText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.round,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Quicksand_600SemiBold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },
  section: {
    flex: 1,
  },
  promptTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  promptSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  inputContainer: {
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'Quicksand_700Bold',
    fontSize: 14,
    marginRight: spacing.md,
    marginTop: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    minHeight: 60,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  moodContainer: {
    marginBottom: spacing.xl,
  },
  moodLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Quicksand_600SemiBold',
    marginBottom: spacing.md,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.backgroundLight,
    minWidth: 58,
  },
  moodOptionSelected: {
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    fontFamily: 'Quicksand_500Medium',
    color: colors.text.tertiary,
  },
  habitTrackerContainer: {
    marginBottom: spacing.xl,
  },
  habitTrackerLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Quicksand_600SemiBold',
    marginBottom: spacing.xs,
  },
  habitTrackerSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  habitsList: {
    gap: spacing.sm,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  habitItemCompleted: {
    backgroundColor: isDarkMode ? 'rgba(107, 155, 123, 0.2)' : 'rgba(107, 155, 123, 0.1)',
    borderColor: '#6B9B7B',
  },
  habitCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitCheckboxCompleted: {
    backgroundColor: '#6B9B7B',
    borderColor: '#6B9B7B',
  },
  habitText: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },
  habitTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  reflectionContainer: {
    flex: 1,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reflectionLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 4,
  },
  voiceButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  voiceButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.primary,
  },
  voiceButtonTextActive: {
    color: '#FFFFFF',
  },
  reflectionInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    minHeight: 180,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    width: '100%',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  saveButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
