import { EmotionData } from '../types';
import { generateAmbientParameters, getEmotionColorPalette, getEmotionSoundProfile } from '../utils/emotionClassifier';
import * as FileSystem from 'expo-file-system';

// Define types locally if not exported from types file
interface AmbientVisualParams {
  backgroundColors: string[];
  particleCount: number;
  particleColors: string[];
  particleSize: number;
  particleSpeed: number;
  movementPattern: 'flowing' | 'pulsing' | 'expanding' | 'contracting' | 'random';
}

interface AmbientAudioParams {
  uri: string;
  volume: number;
  loop: boolean;
}

// Sound file directories
const SOUND_DIR = `${FileSystem.documentDirectory}ambient_sounds/`;

// Default sounds - in a real app, these would be actual sound files
const DEFAULT_SOUNDS: Record<string, string> = {
  joy: 'joy_ambient.mp3',
  sadness: 'sadness_ambient.mp3',
  anger: 'anger_ambient.mp3',
  fear: 'fear_ambient.mp3',
  surprise: 'surprise_ambient.mp3',
  contentment: 'contentment_ambient.mp3',
  neutral: 'neutral_ambient.mp3',
};

// Initialize sound directory
export const initSoundDirectory = async (): Promise<boolean> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(SOUND_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SOUND_DIR, { intermediates: true });
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize sound directory:', error);
    return false;
  }
};

/**
 * Generate ambient visuals based on emotion data
 * @param emotionData Emotion data to visualize
 * @returns Parameters for visual generation
 */
export const generateAmbientVisuals = (emotionData: EmotionData): AmbientVisualParams => {
  // Use the emotion classifier to get ambient parameters
  const ambientParams = generateAmbientParameters(emotionData);
  const colorPalette = getEmotionColorPalette(emotionData);
  
  // Extract energy and tension values for movement parameters
  const energy = emotionData.energy !== undefined ? emotionData.energy : 50;
  const tension = emotionData.tension !== undefined ? emotionData.tension : 50;
  
  // Calculate particle parameters based on emotion
  const particleCount = Math.round(30 + (energy / 100) * 70); // 30-100 particles
  const particleSize = Math.round(5 + (100 - tension) / 10); // 5-15 size
  const particleSpeed = 0.3 + (energy / 100) * 1.2; // 0.3-1.5 speed
  
  // Determine movement pattern based on dominant emotion
  let movementPattern: 'flowing' | 'pulsing' | 'expanding' | 'contracting' | 'random' = 'flowing';
  
  switch (ambientParams.visual.dominantEmotion) {
    case 'joy':
      movementPattern = 'expanding';
      break;
    case 'sadness':
      movementPattern = 'flowing';
      break;
    case 'anger':
      movementPattern = 'pulsing';
      break;
    case 'fear':
      movementPattern = 'contracting';
      break;
    case 'surprise':
      movementPattern = 'random';
      break;
    case 'contentment':
      movementPattern = 'flowing';
      break;
    default:
      movementPattern = 'flowing';
  }
  
  // Create visual parameters
  return {
    backgroundColors: colorPalette.slice(0, 2),
    particleCount,
    particleColors: colorPalette,
    particleSize,
    particleSpeed,
    movementPattern
  };
};

/**
 * Generate ambient sounds based on emotion data
 * @param emotionData Emotion data to sonify
 * @returns URI of the generated sound file
 */
export const generateAmbientSounds = async (emotionData: EmotionData): Promise<string> => {
  try {
    // Initialize sound directory
    await initSoundDirectory();
    
    // Use the emotion classifier to get sound profile
    const ambientParams = generateAmbientParameters(emotionData);
    const soundProfile = getEmotionSoundProfile(emotionData);
    
    // In a real app, we would generate or mix sounds here based on the profile
    // For now, we'll use pre-recorded ambient sounds based on the dominant emotion
    
    const dominantEmotion = ambientParams.audio.dominantEmotion;
    const timestamp = Date.now();
    const fileName = `${dominantEmotion}_${timestamp}.mp3`;
    const fileUri = `${SOUND_DIR}${fileName}`;
    
    // In a production app, we would dynamically generate or mix audio here
    // For this prototype, we'll use pre-recorded sounds
    
    // Return a placeholder sound URI based on the dominant emotion
    // In a real app, this would be a real sound file
    const soundFileName = DEFAULT_SOUNDS[dominantEmotion as keyof typeof DEFAULT_SOUNDS] || DEFAULT_SOUNDS.neutral;
    return `${SOUND_DIR}${soundFileName}`;
  } catch (error) {
    console.error('Error generating ambient sounds:', error);
    return `${SOUND_DIR}${DEFAULT_SOUNDS.neutral}`;
  }
};

/**
 * Update ambient visualization in real-time based on changing emotion data
 * @param currentParams Current visual parameters
 * @param newEmotionData New emotion data
 * @returns Updated visual parameters
 */
export const updateAmbientVisuals = (
  currentParams: AmbientVisualParams,
  newEmotionData: EmotionData
): AmbientVisualParams => {
  const newParams = generateAmbientVisuals(newEmotionData);
  
  // Smoothly transition between states by blending parameters
  return {
    backgroundColors: newParams.backgroundColors,
    particleCount: Math.round((currentParams.particleCount + newParams.particleCount) / 2),
    particleColors: newParams.particleColors,
    particleSize: (currentParams.particleSize + newParams.particleSize) / 2,
    particleSpeed: (currentParams.particleSpeed + newParams.particleSpeed) / 2,
    movementPattern: newParams.movementPattern
  };
};

/**
 * Generate parameters for both visual and audio ambient generation
 * @param emotionData Emotion data to visualize and sonify
 * @returns Combined ambient parameters
 */
export const generateCombinedAmbient = async (emotionData: EmotionData) => {
  const visualParams = generateAmbientVisuals(emotionData);
  const soundUri = await generateAmbientSounds(emotionData);
  
  return {
    visual: visualParams,
    audio: {
      uri: soundUri,
      volume: emotionData.energy ? emotionData.energy / 100 * 0.5 + 0.5 : 0.8, // 0.5-1.0 range
      loop: true
    }
  };
};
