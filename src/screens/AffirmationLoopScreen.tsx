import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography } from '../theme/colors';

type AffirmationLoopScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AffirmationLoop'>;
  route: RouteProp<RootStackParamList, 'AffirmationLoop'>;
};

type AmbientSound = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
};

// Free ambient sounds from public domain sources
const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'none',
    name: 'None',
    icon: 'volume-mute',
    url: '',
  },
  {
    id: 'rain',
    name: 'Rain',
    icon: 'rainy',
    url: 'https://cdn.pixabay.com/audio/2022/05/13/audio_257112181d.mp3',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: 'water',
    url: 'https://cdn.pixabay.com/audio/2024/11/13/audio_c6b2e01f55.mp3',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: 'leaf',
    url: 'https://cdn.pixabay.com/audio/2022/02/23/audio_ea70ad08cc.mp3',
  },
];

const { width, height } = Dimensions.get('window');

export default function AffirmationLoopScreen({ navigation, route }: AffirmationLoopScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const { affirmations, duration } = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string>('none');
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [isLoadingSound, setIsLoadingSound] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  // Breathing circle animation - continuous gentle pulse
  useEffect(() => {
    const breatheCycle = () => {
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isPaused) {
          breatheCycle();
        }
      });
    };

    if (!isPaused) {
      breatheCycle();
    }

    return () => {
      breatheAnim.stopAnimation();
    };
  }, [isPaused]);

  // Calculate time per affirmation
  const timePerAffirmation = Math.max(5, Math.floor(duration / affirmations.length));

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load and play ambient sound
  const playAmbientSound = async (soundId: string) => {
    // Stop current sound if playing
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (soundId === 'none') {
      setSelectedSound('none');
      return;
    }

    const soundConfig = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!soundConfig || !soundConfig.url) return;

    setIsLoadingSound(true);
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: soundConfig.url },
        { isLooping: true, volume: 0.4 }
      );
      soundRef.current = sound;
      await sound.playAsync();
      setSelectedSound(soundId);
    } catch {
      // Sound loading can fail if offline or URL is unavailable - silently handle
      setSelectedSound('none');
    } finally {
      setIsLoadingSound(false);
    }
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Pause/resume sound with affirmation pause
  useEffect(() => {
    if (soundRef.current) {
      if (isPaused) {
        soundRef.current.pauseAsync();
      } else {
        soundRef.current.playAsync();
      }
    }
  }, [isPaused]);

  // Animate affirmation in
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animate affirmation out
  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  // Timer effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.goBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, navigation]);

  // Affirmation cycling effect
  useEffect(() => {
    if (isPaused) return;

    animateIn();

    const cycleTimer = setInterval(() => {
      animateOut(() => {
        setCurrentIndex(prev => (prev + 1) % affirmations.length);
      });
    }, timePerAffirmation * 1000);

    return () => clearInterval(cycleTimer);
  }, [isPaused, affirmations.length, timePerAffirmation]);

  // Animate in when index changes
  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    animateIn();
  }, [currentIndex]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleClose = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }
    navigation.goBack();
  };

  const goToPrevious = () => {
    animateOut(() => {
      setCurrentIndex(prev => (prev - 1 + affirmations.length) % affirmations.length);
    });
  };

  const goToNext = () => {
    animateOut(() => {
      setCurrentIndex(prev => (prev + 1) % affirmations.length);
    });
  };

  const progress = 1 - timeRemaining / duration;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#2E2654', '#4a3f6b']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Close Button */}
        <TouchableOpacity
          style={[styles.closeButton, { top: insets.top + spacing.md }]}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* Top Right Controls */}
        <View style={[styles.topRightControls, { top: insets.top + spacing.md }]}>
          {/* Info Button */}
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          {/* Sound Toggle Button */}
          <TouchableOpacity
            style={styles.soundButton}
            onPress={() => setShowSoundPicker(!showSoundPicker)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={selectedSound === 'none' ? 'volume-mute' : 'volume-high'}
              size={22}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>

        {/* Sound Picker */}
        {showSoundPicker && (
          <View style={[styles.soundPicker, { top: insets.top + spacing.md + 50 }]}>
            {AMBIENT_SOUNDS.map(sound => (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundOption,
                  selectedSound === sound.id && styles.soundOptionActive,
                ]}
                onPress={() => {
                  playAmbientSound(sound.id);
                  setShowSoundPicker(false);
                }}
                activeOpacity={0.7}
                disabled={isLoadingSound}
              >
                <Ionicons
                  name={sound.icon}
                  size={18}
                  color={selectedSound === sound.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
                />
                <Text style={[
                  styles.soundOptionText,
                  selectedSound === sound.id && styles.soundOptionTextActive,
                ]}>
                  {sound.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Affirmation Display */}
        <View style={styles.affirmationContainer}>
          {/* Breathing Circle - ambient background pulse */}
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: breatheAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.breathingCircleInner,
              {
                transform: [{ scale: breatheAnim }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.affirmationWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.affirmationText}>
              {affirmations[currentIndex]}
            </Text>
          </Animated.View>
        </View>

        {/* Affirmation Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {currentIndex + 1} of {affirmations.length}
          </Text>
        </View>

        {/* Controls */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xl }]}>
          {/* Navigation and Play/Pause */}
          <View style={styles.controlsRow}>
            {/* Previous Button */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPrevious}
              activeOpacity={0.7}
            >
              <Ionicons name="play-back" size={28} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={togglePause}
              activeOpacity={0.7}
            >
              <View style={styles.controlButtonInner}>
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={32}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNext}
              activeOpacity={0.7}
            >
              <Ionicons name="play-forward" size={28} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        {/* Info Modal */}
        <Modal
          visible={showInfoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>How to Practice</Text>
                <TouchableOpacity
                  onPress={() => setShowInfoModal(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.tipContainer}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="mic-outline" size={20} color="#9B7ED9" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Speak Out Loud</Text>
                    <Text style={styles.tipText}>
                      Say each affirmation out loud with conviction. Hearing your own voice makes it more powerful.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipContainer}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="eye-outline" size={20} color="#9B7ED9" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Visualize</Text>
                    <Text style={styles.tipText}>
                      As you speak, picture yourself already embodying the affirmation. Feel it as if it's already true.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipContainer}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="heart-outline" size={20} color="#9B7ED9" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Feel the Emotion</Text>
                    <Text style={styles.tipText}>
                      Connect with the feeling behind each affirmation. Emotion is what makes affirmations stick.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipContainer}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="refresh-outline" size={20} color="#9B7ED9" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Repeat Daily</Text>
                    <Text style={styles.tipText}>
                      Consistency is key. Practice morning and evening for best results. It takes 21+ days to form new beliefs.
                    </Text>
                  </View>
                </View>

                <View style={styles.tipContainer}>
                  <View style={styles.tipIcon}>
                    <Ionicons name="pulse-outline" size={20} color="#9B7ED9" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Use the Breathing Circle</Text>
                    <Text style={styles.tipText}>
                      The gentle pulsing circle can help you relax. Breathe naturally and let yourself sink into the practice.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightControls: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
  },
  soundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundPicker: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 20,
    backgroundColor: 'rgba(30, 30, 50, 0.95)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  soundOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  soundOptionText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: 'rgba(255,255,255,0.7)',
  },
  soundOptionTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Quicksand_600SemiBold',
  },
  progressContainer: {
    position: 'absolute',
    top: 100,
    left: spacing.xl,
    right: spacing.xl,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
  },
  affirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  affirmationWrapper: {
    maxWidth: width - spacing.xl * 2,
  },
  affirmationText: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_500Medium_Italic',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  counterText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: 'rgba(255,255,255,0.5)',
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: spacing.md,
  },
  controlButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  // Decorative circles
  decorCircle1: {
    position: 'absolute',
    top: height * 0.15,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: height * 0.25,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  decorCircle3: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.7,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  // Info button
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Breathing circle styles
  breathingCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(155, 126, 217, 0.15)',
    backgroundColor: 'transparent',
  },
  breathingCircleInner: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(155, 126, 217, 0.1)',
    backgroundColor: 'rgba(155, 126, 217, 0.03)',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(155, 126, 217, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: spacing.lg,
  },
  tipContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 126, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
});
