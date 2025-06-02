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

// Emotion analysis result
export interface EmotionAnalysisResult {
  dominantEmotion: string;
  intensity: number;
}

// Face detection data
export interface FaceDetectionData {
  smilingProbability: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  headEulerAngleX: number; // Head tilt (pitch)
  headEulerAngleY: number; // Head rotation (yaw)
  headEulerAngleZ: number; // Head roll
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
  };
  fontWeights: {
    light: string;
    regular: string;
    medium: string;
    bold: string;
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
}

export interface ThemeRadii {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: {
    light: {
      boxShadow: string;
      textShadow: string;
    };
    medium: {
      boxShadow: string;
      textShadow: string;
    };
    dark: {
      boxShadow: string;
      textShadow: string;
    };
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