import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { VisionBoardCategory, VisionBoardImage } from '../types/journal';

type EditVisionBoardScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditVisionBoard'>;
};

const categories: { key: VisionBoardCategory; title: string; icon: string; color: readonly [string, string] }[] = [
  { key: 'roleModels', title: 'Role Models', icon: '👤', color: ['#FF9A76', '#FF6B9D'] as const },
  { key: 'lifestyle', title: 'Lifestyle', icon: '🏡', color: ['#A8E6CF', '#8FBC8F'] as const },
  { key: 'bodyGoals', title: 'Body Goals', icon: '💪', color: ['#B19CD9', '#9B7EBD'] as const },
  { key: 'successSymbols', title: 'Success', icon: '🏆', color: ['#FFB347', '#FF8C42'] as const },
  { key: 'inspiration', title: 'Inspiration', icon: '⭐', color: ['#87CEEB', '#6BB6E3'] as const },
];

export default function EditVisionBoardScreen({ navigation }: EditVisionBoardScreenProps) {
  const { colors } = useTheme();
  const { journal, updateJournal } = useJournal();
  const [selectedCategory, setSelectedCategory] = useState<VisionBoardCategory>('roleModels');
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [selectedImageForLabel, setSelectedImageForLabel] = useState<VisionBoardImage | null>(null);
  const [labelText, setLabelText] = useState('');

  const currentImages = journal.visionBoards[selectedCategory];
  const maxImages = 10;

  // Calculate total images across all categories
  const totalImages = Object.values(journal.visionBoards).reduce(
    (sum, categoryImages) => sum + categoryImages.length,
    0
  );

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

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            activeOpacity={0.7}
            onPress={() => setSelectedCategory(category.key)}
          >
            <LinearGradient
              colors={selectedCategory === category.key ? category.color : ['#F0F0F0', '#F0F0F0']}
              style={styles.tab}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.tabIcon}>{category.icon}</Text>
              <Text style={[
                styles.tabText,
                selectedCategory === category.key && styles.tabTextActive
              ]}>
                {category.title}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {categories.find(c => c.key === selectedCategory)?.title}
            </Text>
            <Text style={styles.count}>{currentImages.length} / {maxImages} images</Text>
          </View>
          <TouchableOpacity
            style={[styles.slideshowButton, totalImages === 0 && styles.slideshowButtonDisabled]}
            onPress={() => totalImages > 0 && navigation.navigate('VisionBoardSlideshow')}
            activeOpacity={totalImages > 0 ? 0.7 : 1}
            disabled={totalImages === 0}
          >
            <Text style={[styles.slideshowButtonText, totalImages === 0 && styles.slideshowButtonTextDisabled]}>
              🎬 Slideshow
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Grid */}
        <View style={styles.grid}>
          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={addImageOptions} activeOpacity={0.7}>
            <LinearGradient
              colors={categories.find(c => c.key === selectedCategory)!.color}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.addButtonIcon}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Images */}
          {currentImages.map((image) => (
            <View key={image.id} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              {image.label && (
                <View style={styles.labelBadge}>
                  <Text style={styles.labelText} numberOfLines={1}>{image.label}</Text>
                </View>
              )}
              <View style={styles.imageActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openLabelModal(image)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>🏷️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteImage(image.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {currentImages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyText}>No images yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first image</Text>
          </View>
        )}
      </ScrollView>

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
              <TouchableOpacity onPress={saveLabel} activeOpacity={0.8}>
                <LinearGradient
                  colors={colors.gradients.primary}
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

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
  },
  tabIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  tabText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.text.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  slideshowButton: {
    backgroundColor: colors.accent.info,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slideshowButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 14,
  },
  slideshowButtonDisabled: {
    backgroundColor: colors.backgroundDark,
    opacity: 0.5,
  },
  slideshowButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  addButton: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    fontSize: 48,
    color: colors.text.white,
    fontWeight: '300',
  },
  imageContainer: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.xs,
  },
  labelText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '500',
  },
  imageActions: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.light,
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
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    width: '48%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundDark,
  },
  modalButtonSave: {},
  modalButtonTextCancel: {
    ...typography.button,
    color: colors.text.secondary,
  },
  modalButtonTextSave: {
    ...typography.button,
    color: colors.text.white,
  },
});
