import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../theme/colors';
import { useTheme } from '../hooks/useTheme';

interface ScreenContainerProps {
  children: React.ReactNode;
  hasGradient?: boolean;
}

export default function ScreenContainer({ children, hasGradient = false }: ScreenContainerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (hasGradient) {
    return (
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {children}
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
});
