import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput, Modal, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../hooks/useTheme';
import { VisionBoardCategory, VisionBoardImage } from '../types/journal';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - spacing.lg * 2 - spacing.sm * 2) / 3;

type EditVisionBoardScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditVisionBoard'>;
  route: RouteProp<RootStackParamList, 'EditVisionBoard'>;
};

const categories: { key: VisionBoardCategory; title: string; icon: string; color: readonly [string, string] }[] = [
  { key: 'roleModels', title: 'Role Models', icon: '👤', color: ['#FF9A76', '#FF6B9D'] as const },
  { key: 'lifestyle', title: 'Lifestyle', icon: '🏡', color: ['#A8E6CF', '#8FBC8F'] as const },
  { key: 'bodyGoals', title: 'Body Goals', icon: '💪', color: ['#B19CD9', '#9B7EBD'] as const },
  { key: 'successSymbols', title: 'Success', icon: '🏆', color: ['#FFB347', '#FF8C42'] as const },
  { key: 'inspiration', title: 'Inspiration', icon: '⭐', color: ['#87CEEB', '#6BB6E3'] as const },
];

export default function EditVisionBoardScreen({ navigation, route }: EditVisionBoardScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { journal, updateJournal } = useJournal();
  const initialCategory = route.params?.category || 'roleModels';
  const [selectedCategory, setSelectedCategory] = useState<VisionBoardCategory>(initialCategory);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const categoryScrollRef = useRef<ScrollView>(null);

  // Scroll to the initially selected category
  useEffect(() => {
    const categoryIndex = categories.findIndex(c => c.key === initialCategory);
    if (categoryIndex > 0 && categoryScrollRef.current) {
      // Approximate width per pill (adjust based on actual styling)
      const pillWidth = 120;
      const scrollPosition = categoryIndex * pillWidth;
      setTimeout(() => {
        categoryScrollRef.current?.scrollTo({ x: scrollPosition, animated: false });
      }, 100);
    }
  }, [initialCategory]);
  const [selectedImageForLabel, setSelectedImageForLabel] = useState<VisionBoardImage | null>(null);
  const [labelText, setLabelText] = useState('');

  const currentImages = journal.visionBoards[selectedCategory];
  const maxImages = 10;

  const totalImages = Object.values(journal.visionBoards).reduce(
    (sum, categoryImages) => sum + categoryImages.length,
    0
  );

  const currentCategory = categories.find(c => c.key === selectedCategory)!;

  const pickImage = async () => {
    if (currentImages.length >= maxImages) {
      Alert.alert('Limit Reached', `You can add up to ${maxImages} images per category.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: VisionBoardImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        addedAt: Date.now(),
      };

      const updatedImages = [...currentImages, newImage];
      await updateJournal({
        visionBoards: {
          ...journal.visionBoards,
          [selectedCategory]: updatedImages,
        },
      });
    }
  };

  const takePhoto = async () => {
    if (currentImages.length >= maxImages) {
      Alert.alert('Limit Reached', `You can add up to ${maxImages} images per category.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: VisionBoardImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        addedAt: Date.now(),
      };

      const updatedImages = [...currentImages, newImage];
      await updateJournal({
        visionBoards: {
          ...journal.visionBoards,
          [selectedCategory]: updatedImages,
        },
      });
    }
  };

  const deleteImage = (imageId: string) => {
    Alert.alert('Delete Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedImages = currentImages.filter(img => img.id !== imageId);
          await updateJournal({
            visionBoards: {
              ...journal.visionBoards,
              [selectedCategory]: updatedImages,
            },
          });
        },
      },
    ]);
  };

  const openLabelModal = (image: VisionBoardImage) => {
    setSelectedImageForLabel(image);
    setLabelText(image.label || '');
    setLabelModalVisible(true);
  };

  const saveLabel = async () => {
    if (!selectedImageForLabel) return;

    const updatedImages = currentImages.map(img =>
      img.id === selectedImageForLabel.id
        ? { ...img, label: labelText.trim() || undefined }
        : img
    );

    await updateJournal({
      visionBoards: {
        ...journal.visionBoards,
        [selectedCategory]: updatedImages,
      },
    });

    setLabelModalVisible(false);
    setSelectedImageForLabel(null);
    setLabelText('');
  };

  const addImageOptions = () => {
    Alert.alert('Add Image', 'Choose an option:', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const styles = createStyles(colors, isDarkMode);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vision Board</Text>
        <TouchableOpacity
          style={[styles.slideshowButton, totalImages === 0 && styles.slideshowButtonDisabled]}
          onPress={() => totalImages > 0 && navigation.navigate('VisionBoardSlideshow')}
          disabled={totalImages === 0}
        >
          <Ionicons name="play" size={18} color={totalImages > 0 ? '#FFFFFF' : colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <ScrollView
        ref={categoryScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.key;
          const categoryCount = journal.visionBoards[category.key].length;
          return (
            <TouchableOpacity
              key={category.key}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(category.key)}
              style={[
                styles.categoryPill,
                isSelected && { backgroundColor: category.color[0] }
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                {category.title}
              </Text>
              {categoryCount > 0 && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                  <Text style={[styles.countBadgeText, isSelected && styles.countBadgeTextActive]}>
                    {categoryCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentImages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>{currentCategory.icon}</Text>
            </View>
            <Text style={styles.emptyTitle}>No {currentCategory.title} yet</Text>
            <Text style={styles.emptySubtext}>
              Add images that inspire your vision
            </Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={addImageOptions}>
              <LinearGradient
                colors={currentCategory.color}
                style={styles.emptyAddButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyAddButtonText}>Add First Image</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {currentImages.map((image) => (
              <TouchableOpacity
                key={image.id}
                style={styles.imageContainer}
                onLongPress={() => deleteImage(image.id)}
                onPress={() => openLabelModal(image)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: image.uri }} style={styles.image} />
                {image.label && (
                  <View style={styles.labelBadge}>
                    <Text style={styles.labelText} numberOfLines={1}>{image.label}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteImage(image.id)}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      {currentImages.length > 0 && currentImages.length < maxImages && (
        <TouchableOpacity
          style={styles.fab}
          onPress={addImageOptions}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={currentCategory.color}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Label Modal */}
      <Modal
        visible={labelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLabelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Label</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter a description..."
              placeholderTextColor={colors.text.tertiary}
              value={labelText}
              onChangeText={setLabelText}
              maxLength={50}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setLabelModalVisible(false);
                  setLabelText('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveLabel} activeOpacity={0.8} style={{ flex: 1 }}>
                <LinearGradient
                  colors={currentCategory.color}
                  style={[styles.modalButton, styles.modalButtonSave]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.modalButtonTextSave}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any, isDarkMode: boolean) => StyleSheet.create({
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
  slideshowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  slideshowButtonDisabled: {
    backgroundColor: colors.backgroundLight,
  },
  categoryContainer: {
    maxHeight: 50,
  },
  categoryContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.secondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: colors.backgroundDark,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.tertiary,
  },
  countBadgeTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  labelBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Quicksand_500Medium',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  emptyAddButton: {
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  emptyAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  emptyAddButtonText: {
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundDark,
  },
  modalButtonSave: {
    flex: 1,
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.text.secondary,
  },
  modalButtonTextSave: {
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
  },
});
