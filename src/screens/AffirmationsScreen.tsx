import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';

type AffirmationsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Affirmations'>;
};

const TIMER_OPTIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
];

export default function AffirmationsScreen({ navigation }: AffirmationsScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { journal } = useJournal();
  const styles = createStyles(colors, isDarkMode);

  const [showAllAffirmations, setShowAllAffirmations] = useState(false);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [selectedAffirmations, setSelectedAffirmations] = useState<string[]>([]);
  const [customAffirmation, setCustomAffirmation] = useState('');
  const [selectedTimer, setSelectedTimer] = useState(180); // Default 3 minutes

  const displayedAffirmations = showAllAffirmations
    ? journal.affirmations
    : journal.affirmations.slice(0, 3);

  const toggleAffirmationSelection = (affirmation: string) => {
    setSelectedAffirmations(prev =>
      prev.includes(affirmation)
        ? prev.filter(a => a !== affirmation)
        : [...prev, affirmation]
    );
  };

  const selectAllAffirmations = () => {
    const allSelected = journal.affirmations.every(a => selectedAffirmations.includes(a));
    if (allSelected) {
      // Deselect all saved affirmations, keep custom ones
      setSelectedAffirmations(prev => prev.filter(a => !journal.affirmations.includes(a)));
    } else {
      // Select all saved affirmations, keep any custom ones
      setSelectedAffirmations(prev => {
        const customOnes = prev.filter(a => !journal.affirmations.includes(a));
        return [...journal.affirmations, ...customOnes];
      });
    }
  };

  const allAffirmationsSelected = journal.affirmations.length > 0 &&
    journal.affirmations.every(a => selectedAffirmations.includes(a));

  const addCustomAffirmation = () => {
    if (customAffirmation.trim()) {
      setSelectedAffirmations(prev => [...prev, customAffirmation.trim()]);
      setCustomAffirmation('');
    }
  };

  const startLoop = () => {
    if (selectedAffirmations.length === 0) return;
    setShowLoopModal(false);
    navigation.navigate('AffirmationLoop', {
      affirmations: selectedAffirmations,
      duration: selectedTimer,
    });
  };

  const openLoopModal = () => {
    setSelectedAffirmations([]);
    setCustomAffirmation('');
    setSelectedTimer(180);
    setShowLoopModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>Affirmations</Text>
        <Text style={styles.headerSubtitle}>
          Positive statements to reinforce your mindset and goals
        </Text>

        {/* Affirmation Loop Card */}
        <TouchableOpacity
          style={styles.loopCard}
          onPress={openLoopModal}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.loopCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.loopCardContent}>
              <View style={styles.loopIconContainer}>
                <Ionicons name="repeat" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.loopTextContainer}>
                <Text style={styles.loopTitle}>Affirmation Loop</Text>
                <Text style={styles.loopDescription}>
                  Meditative practice to reinforce your affirmations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Your Affirmations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Affirmations</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditAffirmations')}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit</Text>
              <Ionicons name="pencil" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {journal.affirmations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="sparkles-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>No affirmations yet</Text>
              <Text style={styles.emptySubtext}>Add affirmations to get started</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('EditAffirmations')}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>Add Affirmations</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {displayedAffirmations.map((affirmation, index) => (
                <View key={index} style={styles.affirmationCard}>
                  <View style={styles.affirmationNumber}>
                    <Text style={styles.affirmationNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.affirmationText}>{affirmation}</Text>
                </View>
              ))}

              {journal.affirmations.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllAffirmations(!showAllAffirmations)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.showMoreText}>
                    {showAllAffirmations
                      ? 'Show Less'
                      : `Show ${journal.affirmations.length - 3} More`}
                  </Text>
                  <Ionicons
                    name={showAllAffirmations ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Loop Setup Modal */}
      <Modal
        visible={showLoopModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLoopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Affirmation Loop</Text>
              <TouchableOpacity
                onPress={() => setShowLoopModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Timer Selection */}
              <Text style={styles.modalSectionTitle}>Duration</Text>
              <View style={styles.timerOptions}>
                {TIMER_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timerOption,
                      selectedTimer === option.value && styles.timerOptionSelected,
                    ]}
                    onPress={() => setSelectedTimer(option.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timerOptionText,
                        selectedTimer === option.value && styles.timerOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Select Affirmations */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.modalSectionTitle, { marginTop: 0, marginBottom: 0 }]}>Select Affirmations</Text>
                {journal.affirmations.length > 0 && (
                  <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={selectAllAffirmations}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={allAffirmationsSelected ? 'checkbox' : 'checkbox-outline'}
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.selectAllText}>
                      {allAffirmationsSelected ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {journal.affirmations.map((affirmation, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.selectableAffirmation,
                    selectedAffirmations.includes(affirmation) && styles.selectableAffirmationSelected,
                  ]}
                  onPress={() => toggleAffirmationSelection(affirmation)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkbox}>
                    {selectedAffirmations.includes(affirmation) && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.selectableAffirmationText} numberOfLines={2}>
                    {affirmation}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Add Custom Affirmation */}
              <Text style={styles.modalSectionTitle}>Or Add Custom</Text>
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter a custom affirmation..."
                  placeholderTextColor={colors.text.tertiary}
                  value={customAffirmation}
                  onChangeText={setCustomAffirmation}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.addCustomButton,
                    !customAffirmation.trim() && styles.addCustomButtonDisabled,
                  ]}
                  onPress={addCustomAffirmation}
                  disabled={!customAffirmation.trim()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Selected Custom Affirmations */}
              {selectedAffirmations.filter(a => !journal.affirmations.includes(a)).map((affirmation, index) => (
                <View key={`custom-${index}`} style={styles.customAffirmationTag}>
                  <Text style={styles.customAffirmationTagText} numberOfLines={1}>
                    {affirmation}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleAffirmationSelection(affirmation)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Start Button */}
            <TouchableOpacity
              style={[
                styles.startButton,
                selectedAffirmations.length === 0 && styles.startButtonDisabled,
              ]}
              onPress={startLoop}
              disabled={selectedAffirmations.length === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedAffirmations.length === 0 ? ['#CCCCCC', '#AAAAAA'] : colors.gradients.primary}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>
                  Start Loop ({selectedAffirmations.length} selected)
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  loopCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loopCardGradient: {
    padding: spacing.lg,
  },
  loopCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loopIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  loopTextContainer: {
    flex: 1,
  },
  loopTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  loopDescription: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    fontFamily: 'Quicksand_600SemiBold',
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.text.light,
    marginTop: spacing.xs,
  },
  addButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  addButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  affirmationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  affirmationNumberText: {
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
  },
  affirmationText: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 4,
  },
  showMoreText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  modalScroll: {
    paddingHorizontal: spacing.lg,
    maxHeight: 400,
  },
  modalSectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Quicksand_600SemiBold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  selectAllText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  timerOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timerOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
  },
  timerOptionText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  timerOptionTextSelected: {
    color: colors.primary,
  },
  selectableAffirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectableAffirmationSelected: {
    borderColor: colors.primary,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  selectableAffirmationText: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    fontSize: 14,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    minHeight: 50,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  addCustomButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCustomButtonDisabled: {
    backgroundColor: colors.text.light,
  },
  customAffirmationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  customAffirmationTagText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.primary,
  },
  startButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  startButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
