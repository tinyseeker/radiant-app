import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, typography } from '../theme/colors';
import { useTheme } from '../hooks/useTheme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export default function GradientButton({ title, onPress, variant = 'primary', style }: GradientButtonProps) {
  const { colors } = useTheme();
  const gradientColors = variant === 'primary' ? colors.gradients.primary : colors.gradients.secondary;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={style}>
      <LinearGradient
        colors={gradientColors}
        style={[styles.button, { shadowColor: colors.primary }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 18,
  },
});
