import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';
import { VisionBoardCategory } from '../types/journal';

type VisionBoardScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'VisionBoard'>;
};

const { width } = Dimensions.get('window');
const imageSize = (width - spacing.lg * 2 - spacing.sm * 2) / 3;

const CATEGORIES: { id: VisionBoardCategory; title: string; icon: keyof typeof Ionicons.glyphMap; color: string[] }[] = [
  { id: 'roleModels', title: 'Role Models', icon: 'people', color: ['#667eea', '#764ba2'] },
  { id: 'lifestyle', title: 'Lifestyle', icon: 'home', color: ['#f093fb', '#f5576c'] },
  { id: 'bodyGoals', title: 'Body Goals', icon: 'fitness', color: ['#4facfe', '#00f2fe'] },
  { id: 'successSymbols', title: 'Success', icon: 'trophy', color: ['#43e97b', '#38f9d7'] },
  { id: 'inspiration', title: 'Inspiration', icon: 'sparkles', color: ['#fa709a', '#fee140'] },
];

export default function VisionBoardScreen({ navigation }: VisionBoardScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { journal } = useJournal();
  const styles = createStyles(colors, isDarkMode);

  // Get total image count
  const totalImages = Object.values(journal.visionBoards).reduce(
    (sum, category) => sum + category.length,
    0
  );

  // Get all images for the main grid (up to 9)
  const allImages = Object.values(journal.visionBoards)
    .flat()
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 9);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vision Board</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditVisionBoard', {})}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Visualize your goals and dreams
        </Text>

        {/* Slideshow Card */}
        {totalImages > 0 && (
          <TouchableOpacity
            style={styles.slideshowCard}
            onPress={() => navigation.navigate('VisionBoardSlideshow')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.slideshowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.slideshowContent}>
                <View style={styles.slideshowIconContainer}>
                  <Ionicons name="play-circle" size={36} color="#FFFFFF" />
                </View>
                <View style={styles.slideshowTextContainer}>
                  <Text style={styles.slideshowTitle}>Vision Flow</Text>
                  <Text style={styles.slideshowDescription}>
                    View all {totalImages} images in fullscreen
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Preview Grid */}
        {allImages.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Images</Text>
            <View style={styles.imageGrid}>
              {allImages.map((image, index) => (
                <TouchableOpacity
                  key={image.id}
                  style={styles.imageContainer}
                  onPress={() => navigation.navigate('VisionBoardSlideshow')}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  {index === 8 && allImages.length === 9 && totalImages > 9 && (
                    <View style={styles.moreOverlay}>
                      <Text style={styles.moreText}>+{totalImages - 9}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No images yet</Text>
            <Text style={styles.emptySubtext}>
              Add images to visualize your goals and dreams
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('EditVisionBoard', {})}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>Add Images</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => {
              const categoryImages = journal.visionBoards[category.id] || [];
              const imageCount = categoryImages.length;
              const previewImage = categoryImages[0];

              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate('EditVisionBoard', { category: category.id })}
                  activeOpacity={0.7}
                >
                  {previewImage ? (
                    <Image
                      source={{ uri: previewImage.uri }}
                      style={styles.categoryImage}
                    />
                  ) : (
                    <LinearGradient
                      colors={category.color}
                      style={styles.categoryPlaceholder}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={category.icon}
                        size={24}
                        color="rgba(255,255,255,0.8)"
                      />
                    </LinearGradient>
                  )}
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryCount}>
                      {imageCount} {imageCount === 1 ? 'image' : 'images'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: colors.primary,
  },
  slideshowCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  slideshowGradient: {
    padding: spacing.lg,
  },
  slideshowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slideshowIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  slideshowTextContainer: {
    flex: 1,
  },
  slideshowTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  slideshowDescription: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
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
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
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
  categoriesGrid: {
    gap: spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.md,
  },
  categoryImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
  },
  categoryPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: 'Quicksand_600SemiBold',
  },
  categoryCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
