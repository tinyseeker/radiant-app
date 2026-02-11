import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { spacing, borderRadius } from '../theme/colors';
import { useTheme } from '../hooks/useTheme';
import { VisionBoardImage } from '../types/journal';

type VisionBoardSlideshowScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'VisionBoardSlideshow'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VisionBoardSlideshowScreen({ navigation }: VisionBoardSlideshowScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { journal } = useJournal();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Collect all images from all categories
  const allImages: VisionBoardImage[] = [];
  Object.values(journal.visionBoards).forEach(categoryImages => {
    allImages.push(...categoryImages);
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlay && allImages.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % allImages.length;

          // Fade animation
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start();

          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlay, allImages.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const styles = createStyles(colors);

  const renderItem = ({ item }: { item: VisionBoardImage }) => (
    <View style={styles.imageSlide}>
      <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
        <Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
      </Animated.View>
      {item.label && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{item.label}</Text>
        </View>
      )}
    </View>
  );

  if (allImages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📸</Text>
        <Text style={styles.emptyText}>No Vision Board Images</Text>
        <Text style={styles.emptySubtext}>Add images to your vision board to view the Vision Flow</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={allImages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Top Controls Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View style={styles.topBarContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Position Indicator */}
            <View style={styles.positionIndicator}>
              <Text style={styles.positionText}>
                {currentIndex + 1} of {allImages.length}
              </Text>
            </View>

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsAutoPlay(!isAutoPlay)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isAutoPlay ? 'pause' : 'play'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { bottom: insets.bottom + 40 }]}>
        <BlurView intensity={60} tint="dark" style={styles.progressBlur}>
          <View style={styles.progressBar}>
            {allImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  index === currentIndex && styles.progressSegmentActive,
                  index < currentIndex && styles.progressSegmentCompleted,
                ]}
              />
            ))}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  labelContainer: {
    position: 'absolute',
    bottom: 120,
    left: spacing.lg,
    right: spacing.lg,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    textAlign: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  blurContainer: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionIndicator: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  positionText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  progressContainer: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
  },
  progressBlur: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressSegmentActive: {
    backgroundColor: '#FFFFFF',
    height: 4,
  },
  progressSegmentCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
  },
});
