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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { colors, spacing } from '../theme/colors';
import { VisionBoardImage } from '../types/journal';

type VisionBoardSlideshowScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'VisionBoardSlideshow'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VisionBoardSlideshowScreen({ navigation }: VisionBoardSlideshowScreenProps) {
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
        <Text style={styles.emptySubtext}>Add images to your vision board to view the slideshow</Text>
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

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <View style={styles.closeButtonInner}>
          <Text style={styles.closeButtonText}>✕</Text>
        </View>
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIsAutoPlay(!isAutoPlay)}
        >
          <Text style={styles.controlIcon}>{isAutoPlay ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        {/* Position Indicator */}
        <View style={styles.positionIndicator}>
          <Text style={styles.positionText}>
            {currentIndex + 1} / {allImages.length}
          </Text>
        </View>
      </View>

      {/* Dot Indicators */}
      <View style={styles.dotContainer}>
        {allImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: spacing.md,
    borderRadius: 12,
  },
  labelText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlIcon: {
    fontSize: 20,
  },
  positionIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    fontWeight: '600',
    color: colors.text.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.text.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
