import React from 'react';
import { StyleSheet, View, Dimensions, ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmotionData } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EmotionAnimatedBackgroundProps {
  emotion: EmotionData;
  dominantEmotion: keyof EmotionData;
}

/**
 * Component that renders an animated background based on the current emotion
 */
export const EmotionAnimatedBackground: React.FC<EmotionAnimatedBackgroundProps> = ({ 
  emotion,
  dominantEmotion
}) => {
  // Determine colors based on dominant emotion
  const getEmotionColors = (emotion: keyof EmotionData): ColorValue[] => {
    switch(emotion) {
      case 'joy':
        return ['#FFD700', '#FFA500', '#FF8C00'];
      case 'sadness':
        return ['#4682B4', '#1E90FF', '#00BFFF'];
      case 'anger':
        return ['#FF0000', '#8B0000', '#B22222'];
      case 'fear':
        return ['#556B2F', '#6B8E23', '#808000'];
      case 'surprise':
        return ['#9932CC', '#8A2BE2', '#9400D3'];
      case 'disgust':
        return ['#228B22', '#008000', '#006400'];
      case 'contentment':
        return ['#20B2AA', '#48D1CC', '#40E0D0'];
      case 'neutral':
        return ['#A9A9A9', '#D3D3D3', '#DCDCDC'];
      default:
        return ['#4682B4', '#87CEEB', '#ADD8E6'];
    }
  };
  
  // Animation parameters based on emotion values
  const particleAmount = 10 + Math.floor(emotion.energy / 10);
  
  // Generate particle positions
  const generateParticles = () => {
    const particles = [];
    
    for (let i = 0; i < particleAmount; i++) {
      const size = 10 + Math.random() * 40;
      const x = Math.random() * SCREEN_WIDTH;
      const y = Math.random() * SCREEN_HEIGHT;
      const opacity = 0.1 + Math.random() * 0.6;
      const rotation = Math.random() * 360;
      const emotionColors = getEmotionColors(dominantEmotion);
      const color = emotionColors[Math.floor(Math.random() * emotionColors.length)];
      
      particles.push({ size, x, y, opacity, rotation, color });
    }
    
    return particles;
  };
  
  const particles = generateParticles();
  
  // Get appropriate icon for the emotion
  const getEmotionIcon = (emotion: keyof EmotionData): string => {
    switch(emotion) {
      case 'joy':
        return 'happy';
      case 'sadness':
        return 'sad';
      case 'anger':
        return 'flame';
      case 'fear':
        return 'warning';
      case 'surprise':
        return 'flash';
      case 'disgust':
        return 'remove-circle';
      case 'contentment':
        return 'heart';
      case 'neutral':
        return 'radio-button-off';
      default:
        return 'help-circle';
    }
  };
  
  return React.createElement(
    'View', 
    { style: styles.container },
    [
      // Background color
      React.createElement(
        'View', 
        { 
          key: 'background',
          style: [
            styles.backgroundGradient, 
            { backgroundColor: getEmotionColors(dominantEmotion)[0] }
          ] 
        }
      ),
      
      // Wavy background
      React.createElement(
        'View',
        {
          key: 'wavy-background',
          style: styles.wavyBackground
        },
        React.createElement('View', { style: styles.wave })
      ),
      
      // Particles
      ...particles.map((particle, index) => 
        React.createElement(
          'View',
          {
            key: `particle-${index}`,
            style: [
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                left: particle.x,
                top: particle.y,
                opacity: particle.opacity,
                backgroundColor: particle.color,
                borderRadius: particle.size / 2,
                transform: [
                  { rotate: `${particle.rotation}deg` }
                ]
              }
            ]
          }
        )
      ),
      
      // Center icon
      React.createElement(
        'View',
        { key: 'center-icon', style: styles.centerIconContainer },
        React.createElement(
          'Ionicons',
          {
            name: getEmotionIcon(dominantEmotion),
            size: 100,
            color: "rgba(255, 255, 255, 0.8)"
          }
        )
      )
    ]
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  wavyBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT * 0.8,
    left: -SCREEN_WIDTH * 0.25,
    bottom: -SCREEN_HEIGHT * 0.2,
  },
  wave: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: SCREEN_WIDTH * 0.5,
    borderTopRightRadius: SCREEN_WIDTH * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  particle: {
    position: 'absolute',
    borderRadius: 20,
  },
  centerIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Utility function to convert drawing data to base64
 */
export const drawingToBase64 = async (drawingData: string): Promise<string | null> => {
  try {
    return drawingData;
  } catch (error) {
    console.error('Error converting drawing to base64', error);
    return null;
  }
}; 