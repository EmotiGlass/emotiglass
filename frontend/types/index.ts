// Point type definition
export interface Point {
  x: number;
  y: number;
}

// Path type definition for drawings
export interface Path {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

// Emotion data types
export interface EmotionData {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  contentment: number;
  neutral: number;
  energy: number;
  calmness: number;
  tension: number;
  drawingData?: string;
  voiceRecordingUri?: string;
  faceImageUri?: string;
}

// Emotion analysis types
export interface EmotionAnalysisResult {
  dominantEmotion: string;
  emotionScores: Record<string, number>;
  confidence: number;
}

// Face detection types
export interface FaceDetectionData {
  smilingProbability: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  headEulerAngleX: number; // Head tilt (pitch)
  headEulerAngleY: number; // Head rotation (yaw)
  headEulerAngleZ: number; // Head roll
}

export interface FaceAnalysisResult {
  faceDetected: boolean;
  dominantEmotion: string;
  emotionScores: Record<string, number>;
  faceData?: FaceDetectionData;
}

// Voice recording types
export interface VoiceRecordingData {
  uri: string;
  duration: number;
  fileSize: number;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textLight: string;
  border: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  white: string;
  lightGray: string;
  // Emotion colors
  joy: string;
  sadness: string;
  anger: string;
  fear: string;
  surprise: string;
  disgust: string;
  contentment: string;
  neutral: string;
  // Additional colors
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accentLight: string;
  accentDark: string;
  offWhite: string;
  gray: string;
  darkGray: string;
  charcoal: string;
  black: string;
  glassBackground: string;
  glassLight: string;
  glassDark: string;
  glassBorder: string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    display: number;
  };
  fontWeights: {
    light: string | number;
    regular: string | number;
    medium: string | number;
    bold: string | number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    loose: number;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeRadii {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
  round: number;
}

export interface ThemeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: {
    light: ThemeShadow;
    medium: ThemeShadow;
    dark: ThemeShadow;
  };
  animation: {
    fast: number;
    normal: number;
    slow: number;
  };
  zIndices: {
    base: number;
    content: number;
    overlay: number;
    modal: number;
    toast: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  EmotionInput: undefined;
  MoodDiary: undefined;
  EntryDetails: { id: string };
  MoodVisualization: { emotionData: EmotionData };
  MoodAnalysis: undefined;
  Settings: undefined;
  AmbientMode: undefined;
};

// Mood entry type
export interface MoodEntry {
  id: string;
  timestamp: number;
  createdAt: number;
  updatedAt: number;
  title?: string;
  dominantEmotion: string;
  emotionValues: Record<string, number>;
  emotions: EmotionData;
  source: 'sliders' | 'drawing' | 'voice' | 'face';
  notes?: string;
  tags: string[];
  favorite?: boolean;
  isFavorite?: boolean;
  emojiSummary?: string;
  drawingData?: string;
  voiceRecordingUri?: string;
  faceImageUri?: string;
}

// Chart and trend analysis types
export interface TrendData {
  emotionFrequency: Record<string, number>;
  emotionTimeline: {
    dates: string[];
    emotions: Record<string, number[]>;
  };
  inputMethodUsage: Record<string, number>;
  moodFactorsTimeline: {
    dates: string[];
    energy: number[];
    calmness: number[];
    tension: number[];
  };
}

// Toast notification types
export interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastOptions['type'], duration?: number) => void;
  hideToast: () => void;
} 