import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface StreakBadgeProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, size = 'medium' }) => {
  const sizes = {
    small: {
      container: 60,
      emoji: 24,
      number: 18,
      label: 10,
    },
    medium: {
      container: 80,
      emoji: 32,
      number: 24,
      label: 12,
    },
    large: {
      container: 100,
      emoji: 40,
      number: 30,
      label: 14,
    },
  };

  const currentSize = sizes[size];

  return (
    <LinearGradient
      colors={streak > 0 ? ['#FF6B6B', '#FF8E53'] : ['#E0E0E0', '#CCCCCC']}
      style={[styles.container, { width: currentSize.container, height: currentSize.container }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.emoji, { fontSize: currentSize.emoji }]}>
        {streak > 0 ? '🔥' : '💤'}
      </Text>
      <Text style={[styles.number, { fontSize: currentSize.number }]}>{streak}</Text>
      <Text style={[styles.label, { fontSize: currentSize.label }]}>
        {streak === 1 ? 'day' : 'days'}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    marginBottom: spacing.xs,
  },
  number: {
    color: colors.text.white,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  label: {
    color: colors.text.white,
    fontWeight: '600',
    opacity: 0.9,
    textTransform: 'uppercase',
  },
});
