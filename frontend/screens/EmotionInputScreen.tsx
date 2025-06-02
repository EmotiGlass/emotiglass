import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import { EmotionSlider } from '../components/ui/EmotionSlider';
import { DrawingCanvas } from '../components/ui/DrawingCanvas';
import VoiceRecorder from '../components/ui/VoiceRecorder';
import FaceCamera from '../components/ui/FaceCamera';
import { EmotionData, RootStackParamList, MoodEntry } from '../types';
import { generateRandomEmotionData } from '../services/dummyData';
import { analyzeDrawing, saveDrawing, initDrawingStorage } from '../services/drawingService';
import { analyzeAudioRecording } from '../services/audioService';
import { FaceAnalysisResult, faceAnalysisToEmotionData } from '../services/faceAnalysis';
import { initStorage, saveMoodEntry } from '../services/storage';
import { Card } from '../components/ui/Card';

type EmotionInputScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmotionInput'>;

export const EmotionInputScreen: React.FC = () => {
  const navigation = useNavigation<EmotionInputScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'sliders' | 'drawing' | 'voice' | 'face'>('sliders');
  const [emotionData, setEmotionData] = useState<EmotionData>({
    joy: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    surprise: 0,
    disgust: 0,
    contentment: 0,
    neutral: 1,
    energy: 50,
    calmness: 50,
    tension: 50
  });
  const [faceAnalysis, setFaceAnalysis] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize storage and drawing services
        const storageInitialized = await initStorage();
        const drawingInitialized = await initDrawingStorage();
        
        if (!storageInitialized || !drawingInitialized) {
          console.error('Failed to initialize services');
          Alert.alert(
            'Initialization Error',
            'Some app features may not work correctly. Please restart the app.',
            [{ text: 'OK' }]
          );
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing services:', error);
        setIsInitialized(true); // Still set to true to allow app to function
      }
    };
    
    initializeServices();
  }, []);
  
  // Save entry to storage
  const saveEntry = async (entryData: any) => {
    try {
      setLoading(true);
      
      // Determine the dominant emotion
      const emotions = Object.entries(entryData).filter(([key]) => 
        ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'contentment', 'neutral'].includes(key)
      );
      
      // Find the emotion with the highest value
      let dominantEmotion: string = 'neutral';
      let highestValue = 0;
      
      emotions.forEach(([emotion, value]) => {
        if (typeof value === 'number' && value > highestValue) {
          dominantEmotion = emotion;
          highestValue = value;
        }
      });
      
      // Create a new MoodEntry object
      const newEntry: MoodEntry = {
        id: `entry_${Date.now()}`,
        timestamp: Date.now(),
        createdAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
        emotions: entryData as EmotionData,
        dominantEmotion: dominantEmotion as keyof EmotionData,
        confidence: highestValue,
        notes: '',
        source: (entryData.source as 'sliders' | 'drawing' | 'voice' | 'face') || 'sliders',
        tags: [],
        emojiSummary: '',
        title: '',
        isFavorite: false,
        drawingData: entryData.drawingData
      };
      
      // Save the entry using the storage service
      const saved = await saveMoodEntry(newEntry);
      
      if (!saved) {
        throw new Error('Failed to save entry');
      }
      
      // Navigate to visualization after saving
      navigation.navigate('MoodVisualization', {
        emotionData: entryData
      });
      
      return true;
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update emotion data from sliders
  const handleSliderChange = (name: keyof EmotionData, value: number) => {
    setEmotionData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Update emotion data from drawing
  const handleDrawingComplete = async (drawingData: string) => {
    // Skip if empty drawing
    if (!drawingData || drawingData === '[]') {
      console.log('Empty drawing, skipping analysis');
      return;
    }
    
    try {
      console.log('Processing drawing data...');
      
      // Validate drawing data
      try {
        const parsedData = JSON.parse(drawingData);
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          console.log('Invalid or empty drawing data, skipping analysis');
          return;
        }
      } catch (parseError) {
        console.error('Invalid drawing data format:', parseError);
        return;
      }
      
      // Save the drawing
      const uri = await saveDrawing(drawingData);
      
      if (!uri) {
        console.error('Failed to save drawing - null URI returned');
        return;
      }
      
      console.log(`Drawing saved to: ${uri}`);
      
      // Analyze the drawing for emotional content
      const emotionResults = await analyzeDrawing(drawingData);
      console.log('Drawing analysis complete', emotionResults);
      
      // Update the emotion data and store drawing data for thumbnails
      setEmotionData(prev => ({
        ...prev,
        ...emotionResults,
        // Store drawing data for thumbnail generation
        drawingData: drawingData
      }));
    } catch (error) {
      console.error('Failed to process drawing:', error);
      // If analysis fails, use random data as fallback
      const randomData = generateRandomEmotionData();
      setEmotionData(prev => ({
        ...prev,
        ...randomData
      }));
    }
  };
  
  // Handle voice recording
  const handleVoiceRecording = async (recordingData: any) => {
    setLoading(true);
    try {
      // In a real app, we would send the recording to an API for analysis
      // For now, just use the URI and generate random emotion data
      console.log('Voice recording URI:', recordingData.uri);
      
      // Generate random emotion data for prototype
      const emotionData = generateRandomEmotionData();
      
      // Save the entry
      await saveEntry({
        ...emotionData,
        source: 'voice',
        voiceRecordingUri: recordingData.uri
      });
      
    } catch (error) {
      console.error('Error processing voice recording:', error);
      Alert.alert('Error', 'Failed to process voice recording');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle face emotion detection
  const handleFaceEmotionDetected = (result: FaceAnalysisResult) => {
    setFaceAnalysis(result);
    
    if (result.faceDetected) {
      // Convert face analysis to emotion data format
      const emotionData = faceAnalysisToEmotionData(result);
      
      // Update the emotion data
      setEmotionData(prev => ({
        ...prev,
        ...emotionData
      }));
    }
  };
  
  // Submit and analyze emotion data
  const handleSubmit = async () => {
    setAnalyzing(true);
    
    try {
      // Navigate to visualization screen after a short delay
      setTimeout(() => {
        navigation.navigate('MoodVisualization', {
          emotionData: emotionData
        });
        setAnalyzing(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to analyze emotions:', error);
      Alert.alert('Error', 'Failed to analyze emotions. Please try again.');
      setAnalyzing(false);
    }
  };
  
  // Helper function to get a color for each emotion
  const getEmotionColor = (emotion: string): string => {
    const emotionColors: Record<string, string> = {
      joy: theme.colors.joy,
      sadness: theme.colors.sadness,
      anger: theme.colors.anger,
      fear: theme.colors.fear,
      surprise: theme.colors.surprise,
      disgust: theme.colors.disgust,
      contentment: theme.colors.contentment,
      neutral: theme.colors.neutral,
    };
    
    return emotionColors[emotion.toLowerCase()] || theme.colors.primary;
  };
  
  // Show loading indicator while initializing
  if (!isInitialized) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Initializing...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How are you feeling?</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sliders' ? styles.activeTab : null]}
          onPress={() => setActiveTab('sliders')}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={activeTab === 'sliders' ? theme.colors.primary : theme.colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'sliders' ? styles.activeTabText : null
            ]}
          >
            Sliders
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drawing' ? styles.activeTab : null]}
          onPress={() => setActiveTab('drawing')}
        >
          <Ionicons 
            name="brush" 
            size={20} 
            color={activeTab === 'drawing' ? theme.colors.primary : theme.colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'drawing' ? styles.activeTabText : null
            ]}
          >
            Draw
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voice' ? styles.activeTab : null]}
          onPress={() => setActiveTab('voice')}
        >
          <Ionicons 
            name="mic" 
            size={20} 
            color={activeTab === 'voice' ? theme.colors.primary : theme.colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'voice' ? styles.activeTabText : null
            ]}
          >
            Voice
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'face' ? styles.activeTab : null]}
          onPress={() => setActiveTab('face')}
        >
          <Ionicons 
            name="camera" 
            size={20} 
            color={activeTab === 'face' ? theme.colors.primary : theme.colors.textLight} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'face' ? styles.activeTabText : null
            ]}
          >
            Face
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        // Disable scrolling when the drawing tab is active to prevent gesture conflicts
        scrollEnabled={activeTab !== 'drawing'}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'sliders' && (
          <View style={styles.slidersContainer}>
            <EmotionSlider
              label="Energy"
              value={emotionData.energy}
              onValueChange={(value) => handleSliderChange('energy', value)}
              minimumTrackTintColor="#3498db"
              maximumTrackTintColor="#bdc3c7"
              thumbTintColor="#3498db"
            />
            <EmotionSlider
              label="Calmness"
              value={emotionData.calmness}
              onValueChange={(value) => handleSliderChange('calmness', value)}
              minimumTrackTintColor="#2ecc71"
              maximumTrackTintColor="#bdc3c7"
              thumbTintColor="#2ecc71"
            />
            <EmotionSlider
              label="Tension"
              value={emotionData.tension}
              onValueChange={(value) => handleSliderChange('tension', value)}
              minimumTrackTintColor="#e74c3c"
              maximumTrackTintColor="#bdc3c7"
              thumbTintColor="#e74c3c"
            />
          </View>
        )}
        
        {activeTab === 'drawing' && (
          <View style={styles.drawingContainer}>
            {/* Ensure the drawing canvas takes up available space */}
            <DrawingCanvas 
              onDrawingComplete={handleDrawingComplete}
              height={400} // Explicit height for better drawing experience
            />
          </View>
        )}
        
        {activeTab === 'voice' && (
          <View style={styles.voiceContainer}>
            <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
          </View>
        )}
        
        {activeTab === 'face' && (
          <View style={styles.faceContainer}>
            <FaceCamera onEmotionDetected={handleFaceEmotionDetected} />
            
            {faceAnalysis && faceAnalysis.faceDetected && (
              <View style={styles.detectedEmotionContainer}>
                <Text style={styles.detectedEmotionTitle}>Detected Emotion:</Text>
                <Text style={styles.detectedEmotionText}>
                  {faceAnalysis.dominantEmotion.charAt(0).toUpperCase() + 
                   faceAnalysis.dominantEmotion.slice(1)}
                </Text>
                
                <View style={styles.emotionScoresContainer}>
                  {Object.entries(faceAnalysis.emotionScores).map(([emotion, score]) => (
                    <View key={`emotion-${emotion}`} style={styles.emotionScoreRow}>
                      <Text style={styles.emotionLabel}>{emotion}</Text>
                      <View style={styles.emotionScoreBarContainer}>
                        <View 
                          style={[
                            styles.emotionScoreBar, 
                            { width: `${(score as number) * 100}%` },
                            { backgroundColor: getEmotionColor(emotion) }
                          ]} 
                        />
                      </View>
                      <Text style={styles.emotionScoreText}>{((score as number) * 100).toFixed(0)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Analyze My Mood</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginTop: 2,
    fontWeight: '400',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  contentContainer: { // Added contentContainerStyle
    flexGrow: 1, // Allows content to grow within ScrollView
  },
  slidersContainer: {
    marginVertical: theme.spacing.md,
  },
  drawingContainer: {
    flex: 1, // Allow drawing container to take up available space
    marginVertical: theme.spacing.md,
    minHeight: 400, // Ensure minimum height for drawing area
    width: '100%', // Take full width
  },
  voiceContainer: {
    marginVertical: theme.spacing.md,
  },
  faceContainer: {
    marginVertical: theme.spacing.md,
  },
  detectedEmotionContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
  },
  detectedEmotionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  detectedEmotionText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.primary,
    marginVertical: theme.spacing.sm,
  },
  emotionScoresContainer: {
    marginTop: theme.spacing.sm,
  },
  emotionScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  emotionLabel: {
    width: 100,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  emotionScoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.sm,
  },
  emotionScoreBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  emotionScoreText: {
    width: 40,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    textAlign: 'right',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
}); 