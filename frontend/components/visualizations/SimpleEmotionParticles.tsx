import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { EmotionAnalysisResult } from '../../types';

interface SimpleEmotionParticlesProps {
  moodAnalysis: EmotionAnalysisResult;
  count?: number;
}

interface Particle {
  id: number;
  size: number;
  color: string;
  x: number;
  y: number;
  opacity: number;
}

/**
 * Component that renders animated particles based on emotion analysis
 */
export const SimpleEmotionParticles: React.FC<SimpleEmotionParticlesProps> = ({ 
  moodAnalysis, 
  count = 40 
}) => {
  const { width, height } = Dimensions.get('window');
  const particles = useRef<Particle[]>([]);
  
  // Generate particles based on emotion
  useEffect(() => {
    const colors = getEmotionColors(moodAnalysis.dominantEmotion);
    const intensity = moodAnalysis.intensity / 100;
    
    // Generate particles
    particles.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 20 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.6 + 0.2
    }));
  }, [moodAnalysis, width, height, count]);

  // Using string component names to avoid TypeScript errors
  return React.createElement(
    'View', 
    { style: [styles.container, { width, height }] },
    particles.current.map((particle) => 
      React.createElement(
        ParticleItem, 
        { 
          key: particle.id,
          particle,
          intensity: moodAnalysis.intensity / 100,
          emotion: moodAnalysis.dominantEmotion
        }
      )
    )
  );
};

interface ParticleItemProps {
  particle: Particle;
  intensity: number;
  emotion: string;
}

const ParticleItem: React.FC<ParticleItemProps> = ({ 
  particle, 
  intensity,
  emotion 
}) => {
  // Animation values
  const translateX = useSharedValue(particle.x);
  const translateY = useSharedValue(particle.y);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(particle.opacity);
  
  // Set up animations based on emotion
  useEffect(() => {
    // Duration varies by emotion
    const duration = getEmotionDuration(emotion, intensity);
    
    // Simple animations
    translateX.value = withRepeat(
      withTiming(particle.x + (Math.random() - 0.5) * 100, { 
        duration: duration * 1.5 
      }),
      -1,
      true
    );
    
    translateY.value = withRepeat(
      withTiming(particle.y + (Math.random() - 0.5) * 100, { 
        duration: duration 
      }),
      -1,
      true
    );
    
    // Scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { 
          duration: duration * 0.5, 
          easing: Easing.inOut(Easing.ease) 
        }),
        withTiming(0.8, { 
          duration: duration * 0.5, 
          easing: Easing.inOut(Easing.ease) 
        })
      ),
      -1,
      true
    );
    
    // Opacity animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(particle.opacity + 0.2, { duration: duration * 0.7 }),
        withTiming(particle.opacity - 0.1, { duration: duration * 0.3 })
      ),
      -1,
      true
    );
  }, [emotion, intensity, particle]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });
  
  // Using string component name for Animated.View
  return React.createElement(
    'Animated.View',
    {
      style: [
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          left: 0,
          top: 0,
        },
        animatedStyle,
      ]
    }
  );
};

// Helper functions for emotion-based animations
const getEmotionColors = (emotion: string): string[] => {
  const emotionColors: Record<string, string[]> = {
    joy: ['#FFD700', '#FFA500', '#FF8C00', '#FF4500'],
    contentment: ['#4682B4', '#6495ED', '#87CEEB', '#ADD8E6'],
    anger: ['#8B0000', '#B22222', '#CD5C5C', '#FF6347'],
    sadness: ['#191970', '#000080', '#4169E1', '#6495ED'],
    fear: ['#2F4F4F', '#556B2F', '#708090', '#778899'],
    surprise: ['#9932CC', '#8A2BE2', '#9370DB', '#BA55D3'],
    disgust: ['#006400', '#228B22', '#6B8E23', '#808000'],
    neutral: ['#A9A9A9', '#D3D3D3', '#DCDCDC', '#F5F5F5'],
  };
  
  return emotionColors[emotion] || emotionColors.neutral;
};

const getEmotionDuration = (emotion: string, intensity: number): number => {
  // Base durations for different emotions
  const baseDurations: Record<string, number> = {
    joy: 1500,
    contentment: 3000,
    anger: 800,
    sadness: 4000,
    fear: 1200,
    surprise: 1000,
    disgust: 2000,
    neutral: 2500,
  };
  
  // Adjust duration based on intensity (higher intensity = faster)
  const base = baseDurations[emotion] || 2000;
  return base - (base * 0.5 * intensity);
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
  },
}); 