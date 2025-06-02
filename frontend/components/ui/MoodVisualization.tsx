import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import theme from '../../constants/theme';
import { EmotionAnalysisResult } from '../../types';

interface MoodVisualizationProps {
  moodAnalysis: EmotionAnalysisResult;
}

// Helper function to get background color
const getEmotionBackgroundColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    joy: '#FFF8E1',
    contentment: '#E1F5FE',
    anger: '#FFEBEE',
    sadness: '#E8EAF6',
    fear: '#ECEFF1',
    surprise: '#F3E5F5',
    disgust: '#E8F5E9',
    neutral: '#F5F5F5',
  };
  
  return emotionColors[emotion] || '#F5F5F5';
};

// Dummy function to replace sound import
const getDummySound = () => {
  console.log('Returning dummy sound');
  return null;
};

export const MoodVisualization: React.FC<MoodVisualizationProps> = ({ moodAnalysis }) => {
  const { width, height } = Dimensions.get('window');
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  
  const playDummySound = (soundName: string) => {
    console.log(`Playing dummy sound: ${soundName}`);
    setSelectedSound(soundName);
  };

  const stopDummySound = () => {
    console.log('Stopping dummy sound');
    setSelectedSound(null);
  };

  return React.createElement(
    View,
    { style: [styles.container, { width, height }] },
    React.createElement(
      Text,
      { style: styles.title },
      'Mood Visualization'
    ),
    React.createElement(
      View,
      { style: styles.soundControls },
      React.createElement(
        Text,
        { style: styles.currentSound },
        selectedSound ? `Playing: ${selectedSound}` : 'No sound playing'
      ),
      React.createElement(
        View,
        { style: styles.buttonContainer },
        React.createElement(
          TouchableOpacity,
          { 
            style: styles.button,
            onPress: () => playDummySound('Ambient')
          },
          React.createElement(
            Text,
            { style: styles.buttonText },
            'Play Ambient'
          )
        ),
        React.createElement(
          TouchableOpacity,
          { 
            style: styles.button,
            onPress: stopDummySound
          },
          React.createElement(
            Text,
            { style: styles.buttonText },
            'Stop'
          )
        )
      )
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as '700',
    marginBottom: theme.spacing.lg,
  },
  soundControls: {
    alignItems: 'center',
  },
  currentSound: {
    fontSize: theme.typography.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
  },
});

export default MoodVisualization; 