import { Dimensions, Platform } from 'react-native';
import { Theme } from '../types';

const { width, height } = Dimensions.get('window');

// Theme constants for EmotiGlass app
export const theme: Theme = {
  // Color palette
  colors: {
    primary: '#4A90E2',
    secondary: '#50E3C2',
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    text: '#333333',
    textLight: '#777777',
    border: '#E1E4E8',
    accent: '#FF9500',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    info: '#5AC8FA',
    white: '#FFFFFF',
    lightGray: '#E1E4E8',
    // Emotion colors
    joy: '#FFD700', // Gold
    sadness: '#4682B4', // Steel Blue
    anger: '#FF4500', // Red Orange
    fear: '#800080', // Purple
    surprise: '#FF69B4', // Hot Pink
    disgust: '#228B22', // Forest Green
    contentment: '#87CEEB', // Sky Blue
    neutral: '#A9A9A9', // Dark Gray
    // Additional color values that were added
    primaryLight: '#6BABEB',
    primaryDark: '#2A70C2',
    secondaryLight: '#70E9D1',
    secondaryDark: '#30C3A2',
    accentLight: '#FFB340',
    accentDark: '#DF7500',
    offWhite: '#F5F5F5',
    gray: '#CCCCCC',
    darkGray: '#666666',
    charcoal: '#222222',
    black: '#000000',
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassLight: 'rgba(255, 255, 255, 0.9)',
    glassDark: 'rgba(0, 0, 0, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.5)'
  },
  
  // Typography
  typography: {
    // Font families
    fontFamily: {
      sans: Platform.OS === 'ios' ? 'System' : 'Roboto',
      mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    
    // Font sizes
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      xxxl: 36,
      display: 48,
    },
    
    // Font weights
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    },
    
    // Line heights
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius
  radii: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    full: 9999,
    round: 999,
  },
  
  // Shadows
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: Platform.OS === 'android' ? 2 : 0,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: Platform.OS === 'android' ? 4 : 0,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: Platform.OS === 'android' ? 8 : 0,
    },
  },
  
  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Z-index values
  zIndices: {
    base: 0,
    content: 1,
    overlay: 10,
    modal: 20,
    toast: 30,
  },
};

export default theme; 