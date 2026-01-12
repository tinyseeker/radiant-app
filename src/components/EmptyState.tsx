import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { spacing, typography } from '../theme/colors';

type EmptyStateProps = {
  message?: string;
};

export function EmptyState({ message = "Nothing here yet..." }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/phoenix - transparent background.png')}
          style={styles.phoenixImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const createStyles = (colors: typeof import('../theme/colors').lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    opacity: 0.3,
  },
  phoenixImage: {
    width: 100,
    height: 100,
  },
  message: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
