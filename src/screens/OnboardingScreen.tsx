import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { useJournal } from '../context/JournalContext';

type OnboardingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const onboardingSteps = [
  {
    title: 'Your Daily Practice',
    description: 'Read your journal first thing in the morning and before bed. This simple ritual will transform your mindset over time.',
  },
  {
    title: 'Reprogram Your Mind',
    description: 'Affirmations work through the formula: Thought + Image + Emotion = Belief. You\'re not just reading—you\'re rewiring.',
  },
  {
    title: 'Align with Your Vision',
    description: 'Define your goals, routines, and the person you\'re becoming. Your journal keeps you focused on what matters most.',
  },
];

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { updateJournal } = useJournal();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const completeOnboarding = async () => {
    await updateJournal({ hasCompletedOnboarding: true });
    navigation.replace('Home');
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const step = onboardingSteps[currentStep];

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}>
          {onboardingSteps.map((_, index) => (
            <View key={index} style={styles.dotContainer}>
              {index === currentStep ? (
                <LinearGradient
                  colors={colors.gradients.primary}
                  style={styles.activeDot}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              ) : (
                <View style={styles.dot} />
              )}
            </View>
          ))}
        </View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.iconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iconText}>
                {currentStep === 0 ? '🌅' : currentStep === 1 ? '🧠' : '🎯'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={handleNext}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
  },
  dotContainer: {
    marginHorizontal: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.light,
  },
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  skipText: {
    ...typography.body,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.round,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    ...typography.button,
    color: colors.text.white,
  },
});
