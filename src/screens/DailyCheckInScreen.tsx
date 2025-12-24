import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useJournal } from '../context/JournalContext';
import { useActivity } from '../context/ActivityContext';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { StreakBadge } from '../components/StreakBadge';
import { VisionBoardImage } from '../types/journal';
import { isMilestone } from '../utils/streakCalculator';

type DailyCheckInScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'DailyCheckIn'>;
};

export default function DailyCheckInScreen({ navigation }: DailyCheckInScreenProps) {
  const { journal } = useJournal();
  const { activity, checkIn, hasCheckedInToday } = useActivity();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  const getFormattedDate = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getRandomAffirmation = (): string => {
    if (journal.affirmations.length === 0) {
      return 'Add affirmations to your journal to see them here!';
    }
    const randomIndex = Math.floor(Math.random() * journal.affirmations.length);
    return journal.affirmations[randomIndex];
  };

  const getRandomVisionBoardImages = (): VisionBoardImage[] => {
    const allImages: VisionBoardImage[] = [];

    Object.values(journal.visionBoards).forEach(categoryImages => {
      allImages.push(...categoryImages);
    });

    if (allImages.length === 0) {
      return [];
    }

    // Shuffle and take 3
    const shuffled = [...allImages].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const handleCheckIn = async () => {
    if (hasCheckedInToday) {
      Alert.alert('Already Checked In', "You've already checked in today! Come back tomorrow.");
      return;
    }

    try {
      const previousStreak = activity.streakData.currentStreak;
      await checkIn();
      const newStreak = previousStreak + 1;

      // Check for milestone
      if (isMilestone(newStreak)) {
        Alert.alert(
          '🎉 Milestone Achieved!',
          `Congratulations! You've reached a ${newStreak}-day streak! Keep up the amazing work!`,
          [
            {
              text: 'Awesome!',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          '✅ Check-in Complete!',
          `Great job! Your streak is now ${newStreak} ${newStreak === 1 ? 'day' : 'days'}!`,
          [
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete check-in. Please try again.');
    }
  };

  const visionImages = getRandomVisionBoardImages();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{getFormattedDate()}</Text>

          <View style={styles.streakContainer}>
            <StreakBadge streak={activity.streakData.currentStreak} size="large" />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Affirmation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Today's Affirmation</Text>
        <Animated.View style={[styles.affirmationCard, { opacity: fadeAnim }]}>
          <Text style={styles.affirmationText}>"{getRandomAffirmation()}"</Text>
        </Animated.View>
      </View>

      {/* Vision Board Preview */}
      {visionImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Vision</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {visionImages.map((image, index) => (
              <Animated.View
                key={image.id}
                style={[
                  styles.visionImageContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image source={{ uri: image.uri }} style={styles.visionImage} />
                {image.label && (
                  <View style={styles.imageLabelBadge}>
                    <Text style={styles.imageLabelText} numberOfLines={1}>
                      {image.label}
                    </Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.slideshowLink}
            onPress={() => navigation.navigate('VisionBoardSlideshow')}
          >
            <Text style={styles.slideshowLinkText}>View Full Slideshow →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Check-in Button */}
      <TouchableOpacity
        style={styles.checkInButton}
        onPress={handleCheckIn}
        activeOpacity={0.8}
        disabled={hasCheckedInToday}
      >
        <LinearGradient
          colors={hasCheckedInToday ? ['#A0A0A0', '#808080'] : colors.gradients.primary}
          style={styles.checkInGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.checkInIcon}>{hasCheckedInToday ? '✅' : '🌟'}</Text>
          <Text style={styles.checkInText}>
            {hasCheckedInToday ? 'Already Checked In Today!' : 'Complete Daily Check-in'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ViewJournal')}
        >
          <Text style={styles.actionButtonText}>📖 View My Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditVisionBoard')}
        >
          <Text style={styles.actionButtonText}>🖼️ Update Vision Board</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  greeting: {
    ...typography.h1,
    color: colors.text.white,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.body,
    color: colors.text.white,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  streakContainer: {
    marginTop: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  affirmationCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  affirmationText: {
    ...typography.h3,
    color: colors.text.primary,
    fontSize: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 30,
  },
  imageScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  visionImageContainer: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  visionImage: {
    width: '100%',
    height: '100%',
  },
  imageLabelBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.xs,
  },
  imageLabelText: {
    color: colors.text.white,
    fontSize: 11,
    fontWeight: '500',
  },
  slideshowLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  slideshowLinkText: {
    ...typography.button,
    color: colors.accent.info,
    fontSize: 15,
  },
  checkInButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  checkInGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  checkInIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  checkInText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 18,
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actionButton: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
  },
});
