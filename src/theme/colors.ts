export const lightColors = {
  // Gradients
  gradients: {
    primary: ['#FF9A76', '#FF6B9D'] as const,
    secondary: ['#A8E6CF', '#8FBC8F'] as const,
    background: ['#FFF9F5', '#FFE8E0'] as const,
    card: ['#FFFFFF', '#FFF9F5'] as const,
    dark: ['#2C3E50', '#34495E'] as const,
  },

  // Solid colors
  primary: '#FF9A76',
  primaryDark: '#FF6B9D',
  secondary: '#8FBC8F',
  secondaryLight: '#A8E6CF',

  background: '#FFF9F5',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#FFE8E0',

  text: {
    primary: '#2C3E50',
    secondary: '#5D6D7E',
    tertiary: '#95A5A6',
    light: '#BDC3C7',
    white: '#FFFFFF',
  },

  accent: {
    success: '#8FBC8F',
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB',
  },

  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(255, 255, 255, 0.9)',
};

export const darkColors = {
  // Gradients
  gradients: {
    primary: ['#FF6B9D', '#FF9A76'] as const,
    secondary: ['#6B9B7B', '#7FAC7F'] as const,
    background: ['#1a1a1a', '#2d2d2d'] as const,
    card: ['#2d2d2d', '#3a3a3a'] as const,
    dark: ['#2C3E50', '#34495E'] as const,
  },

  // Solid colors
  primary: '#FF9A76',
  primaryDark: '#FF6B9D',
  secondary: '#7FAC7F',
  secondaryLight: '#8FBC8F',

  background: '#1a1a1a',
  backgroundLight: '#2d2d2d',
  backgroundDark: '#0d0d0d',

  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#808080',
    light: '#606060',
    white: '#FFFFFF',
  },

  accent: {
    success: '#7FAC7F',
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB',
  },

  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.9)',
};

// Default to light colors for backward compatibility
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const typography = {
  h1: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
};
