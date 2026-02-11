export const lightColors = {
  // Gradients - Twilight sky inspired
  gradients: {
    primary: ['#7B68EE', '#9B7ED9'] as const,  // Medium slate blue to soft purple
    secondary: ['#E8B4A0', '#D4956A'] as const, // Peachy cloud tones
    background: ['#F8F5FC', '#F0EBF7'] as const, // Soft lavender
    card: ['#FFFFFF', '#FAF8FD'] as const,
    dark: ['#2E2654', '#433B6B'] as const,  // Deep twilight
    twilight: ['#1a1a2e', '#4a3f6b', '#7B68EE'] as const, // Full sky gradient
  },

  // Solid colors - Twilight purple/indigo
  primary: '#7B68EE',      // Medium slate blue
  primaryDark: '#5B4FCF',  // Deeper indigo
  secondary: '#E8B4A0',    // Peachy cloud
  secondaryLight: '#F0C5B0',

  background: '#F8F5FC',     // Soft lavender tint
  backgroundLight: '#FFFFFF',
  backgroundDark: '#EDE8F5',  // Slightly darker lavender

  text: {
    primary: '#2E2654',    // Deep twilight purple
    secondary: '#5D5680',  // Muted purple-gray
    tertiary: '#8A85A3',
    light: '#B8B4C9',
    white: '#FFFFFF',
  },

  accent: {
    success: '#7FAC8F',    // Soft teal-green
    error: '#E07070',      // Softer red
    warning: '#E8B87C',    // Golden sunset
    info: '#7B9FEE',       // Sky blue
  },

  shadow: 'rgba(46, 38, 84, 0.1)',
  overlay: 'rgba(255, 255, 255, 0.9)',
};

export const darkColors = {
  // Gradients - Deep twilight sky
  gradients: {
    primary: ['#9B7ED9', '#7B68EE'] as const,  // Soft purple to slate blue
    secondary: ['#D4956A', '#E8B4A0'] as const, // Peachy cloud tones
    background: ['#1a1a2e', '#16213e'] as const, // Deep navy twilight
    card: ['#252542', '#2d2d4a'] as const,
    dark: ['#0f0f1e', '#1a1a2e'] as const,
    twilight: ['#0f3460', '#16213e', '#1a1a2e'] as const, // Full dark sky gradient
  },

  // Solid colors - Twilight purple/indigo
  primary: '#9B8DF0',      // Lighter purple for dark mode
  primaryDark: '#7B68EE',
  secondary: '#E8B4A0',    // Peachy cloud
  secondaryLight: '#F0C5B0',

  background: '#1a1a2e',     // Deep navy (like top of sky)
  backgroundLight: '#252542', // Slightly lighter navy
  backgroundDark: '#0f0f1e',

  text: {
    primary: '#F0EBF7',    // Soft lavender white
    secondary: '#B8B4C9',
    tertiary: '#7A7694',
    light: '#5A5670',
    white: '#FFFFFF',
  },

  accent: {
    success: '#7FAC8F',
    error: '#E07070',
    warning: '#E8B87C',    // Golden moon color
    info: '#7B9FEE',
  },

  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(26, 26, 46, 0.9)',
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

// Font families
export const fonts = {
  // Elegant serif for headings and quotes
  heading: {
    regular: 'CormorantGaramond_400Regular',
    italic: 'CormorantGaramond_400Regular_Italic',
    semiBold: 'CormorantGaramond_600SemiBold',
    bold: 'CormorantGaramond_700Bold',
  },
  // Friendly sans-serif for body and UI
  body: {
    regular: 'Quicksand_400Regular',
    medium: 'Quicksand_500Medium',
    semiBold: 'Quicksand_600SemiBold',
    bold: 'Quicksand_700Bold',
  },
};

export const typography = {
  h1: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 22,
    fontFamily: 'Quicksand_600SemiBold',
  },
  body: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontFamily: 'Quicksand_400Regular',
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    lineHeight: 20,
  },
  button: {
    fontSize: 17,
    fontFamily: 'Quicksand_600SemiBold',
  },
  quote: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    lineHeight: 36,
    letterSpacing: 0.5,
  },
};
