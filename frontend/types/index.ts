// Emotion-related types
export type EmotionType = 'happy' | 'sad' | 'angry' | 'neutral' | 'surprised' | 'fearful' | 'disgusted';

export interface EmotionData {
  emotion: EmotionType;
  confidence: number;
}

export interface DrawingData {
  strokes: Stroke[];
  uri?: string;
  dominantColors: string[];
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface VoiceData {
  uri: string;
  duration: number;
  toneMeasurements: ToneMeasurements;
  emotionAnalysis: EmotionData;
}

export interface ToneMeasurements {
  avgVolume: number;
  avgPitch: number;
  variability: number;
}

export interface SliderValues {
  mood: number;
  energy: number;
  calmness: number;
  anxiety: number;
}

export interface EmotionProfile {
  voiceData?: VoiceData;
  faceData?: EmotionData;
  drawingData?: DrawingData;
  sliderValues: SliderValues;
  timestamp: string;
  overallMood?: EmotionData;
}

export interface JournalEntry extends EmotionProfile {
  id: string;
  ambientTags: string[];
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Session: undefined;
  MoodDiary: undefined;
  EntryDetails: { entryId: string };
}; 