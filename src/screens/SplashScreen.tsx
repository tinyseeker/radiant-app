import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground, Animated, Dimensions, View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type SplashScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
};

const { width, height } = Dimensions.get('window');

const INSPIRATIONAL_QUOTES = [
  "You are capable of amazing things.",
  "Today is a new beginning.",
  "Your potential is limitless.",
  "Believe in your journey.",
  "You deserve happiness and peace.",
  "Every day is a chance to grow.",
  "You are stronger than you think.",
  "Embrace the light within you.",
  "Your story is just beginning.",
  "Radiate positivity today.",
];

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const quoteFadeAnim = new Animated.Value(0);
  const [quote] = useState(() =>
    INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)]
  );

  useEffect(() => {
    // Fade in background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Fade in quote after a short delay
    const quoteTimer = setTimeout(() => {
      Animated.timing(quoteFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Navigate to Welcome after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(quoteTimer);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={require('../../assets/Load Screen.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.quoteContainer}>
          <Animated.Text style={[styles.quote, { opacity: quoteFadeAnim }]}>
            {quote}
          </Animated.Text>
        </View>
        <Text style={styles.brandName}>Radiant</Text>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quote: {
    fontSize: 22,
    fontFamily: 'Quicksand_500Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  brandName: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
