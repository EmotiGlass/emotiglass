import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate,
  Extrapolate,
  AnimatedStyleProp
} from 'react-native-reanimated';
import { EmotionAnalysisResult } from '../../types';
import Svg, { Path } from 'react-native-svg';

interface EmotionWavesProps {
  moodAnalysis: EmotionAnalysisResult;
}

/**
 * Component that renders animated wave patterns based on emotion analysis
 */
export const EmotionWaves: React.FC<EmotionWavesProps> = ({ moodAnalysis }) => {
  const { width, height } = Dimensions.get('window');
  const colors = getEmotionGradient(moodAnalysis.dominantEmotion);
  const intensity = moodAnalysis.intensity / 100;
  
  // Animation progress values
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);
  
  // Set up animations
  useEffect(() => {
    // Duration based on emotion intensity (faster for higher intensity)
    const baseDuration = 10000 - (intensity * 5000);
    
    progress1.value = 0;
    progress2.value = 0;
    progress3.value = 0;
    
    progress1.value = withRepeat(
      withTiming(1, { duration: baseDuration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    progress2.value = withRepeat(
      withTiming(1, { duration: baseDuration * 1.5, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    progress3.value = withRepeat(
      withTiming(1, { duration: baseDuration * 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [moodAnalysis]);
  
  // Animated styles for each wave with type assertion to bypass TypeScript error
  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(progress1.value, [0, 1], [0, -width], Extrapolate.CLAMP) }],
    } as any;
  });
  
  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(progress2.value, [0, 1], [0, -width * 1.5], Extrapolate.CLAMP) }],
    } as any;
  });
  
  const animatedStyle3 = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(progress3.value, [0, 1], [0, -width * 0.8], Extrapolate.CLAMP) }],
    } as any;
  });
  
  // Generate wave paths based on emotion
  const getWavePath = (waveHeight: number, waveWidth: number, offset: number) => {
    // Customize wave shape based on emotion
    const amplitude = getEmotionAmplitude(moodAnalysis.dominantEmotion, intensity) * waveHeight;
    const frequency = getEmotionFrequency(moodAnalysis.dominantEmotion, intensity);
    
    let path = `M 0 ${height} `;
    
    // Generate a complete wave cycle
    for (let i = 0; i <= waveWidth; i += 10) {
      const x = i;
      const y = height - amplitude * Math.sin((i / waveWidth) * Math.PI * frequency + offset);
      path += `L ${x} ${y} `;
    }
    
    // Close the path
    path += `L ${waveWidth} ${height} L 0 ${height} Z`;
    
    return path;
  };
  
  return React.createElement(
    React.Fragment,
    null,
    [
      React.createElement(
        Animated.View,
        { 
          key: 'wave1',
          style: [styles.waveContainer, animatedStyle1] 
        },
        React.createElement(
          Svg,
          { 
            width: width * 2, 
            height: height, 
            style: styles.wave 
          },
          React.createElement(
            Path,
            {
              d: getWavePath(height * 0.15, width * 2, 0),
              fill: colors[0],
              fillOpacity: 0.6
            }
          )
        )
      ),
      
      React.createElement(
        Animated.View,
        { 
          key: 'wave2',
          style: [styles.waveContainer, animatedStyle2] 
        },
        React.createElement(
          Svg,
          { 
            width: width * 2, 
            height: height, 
            style: styles.wave 
          },
          React.createElement(
            Path,
            {
              d: getWavePath(height * 0.2, width * 2, Math.PI / 2),
              fill: colors[1],
              fillOpacity: 0.4
            }
          )
        )
      ),
      
      React.createElement(
        Animated.View,
        { 
          key: 'wave3',
          style: [styles.waveContainer, animatedStyle3] 
        },
        React.createElement(
          Svg,
          { 
            width: width * 2, 
            height: height, 
            style: styles.wave 
          },
          React.createElement(
            Path,
            {
              d: getWavePath(height * 0.25, width * 2, Math.PI),
              fill: colors[2],
              fillOpacity: 0.3
            }
          )
        )
      )
    ]
  );
};

// Helper functions for emotion-based wave properties
const getEmotionGradient = (emotion: string): string[] => {
  const emotionGradients: Record<string, string[]> = {
    joy: ['#FFD700', '#FFA500', '#FF8C00'],
    contentment: ['#4682B4', '#6495ED', '#87CEEB'],
    anger: ['#8B0000', '#B22222', '#CD5C5C'],
    sadness: ['#191970', '#000080', '#4169E1'],
    fear: ['#2F4F4F', '#556B2F', '#708090'],
    surprise: ['#9932CC', '#8A2BE2', '#9370DB'],
    disgust: ['#006400', '#228B22', '#6B8E23'],
    neutral: ['#A9A9A9', '#D3D3D3', '#DCDCDC'],
  };
  
  return emotionGradients[emotion] || emotionGradients.neutral;
};

const getEmotionAmplitude = (emotion: string, intensity: number): number => {
  // Different wave amplitudes for different emotions
  const baseAmplitudes: Record<string, number> = {
    joy: 0.8,
    contentment: 0.4,
    anger: 1.0,
    sadness: 0.3,
    fear: 0.7,
    surprise: 0.9,
    disgust: 0.6,
    neutral: 0.5,
  };
  
  // Adjust amplitude based on intensity
  const baseAmplitude = baseAmplitudes[emotion] || 0.5;
  return baseAmplitude * (0.7 + (intensity * 0.6));
};

const getEmotionFrequency = (emotion: string, intensity: number): number => {
  // Different wave frequencies for different emotions
  const baseFrequencies: Record<string, number> = {
    joy: 4,
    contentment: 2,
    anger: 6,
    sadness: 1.5,
    fear: 5,
    surprise: 3.5,
    disgust: 3,
    neutral: 2.5,
  };
  
  // Adjust frequency based on intensity
  const baseFrequency = baseFrequencies[emotion] || 2.5;
  return baseFrequency * (0.8 + (intensity * 0.4));
};

const styles = StyleSheet.create({
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
  },
});
