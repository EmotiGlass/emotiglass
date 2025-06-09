import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getJournalEntryById, deleteJournalEntry } from '../storage/JournalSaver';
import { JournalEntry } from '../types';

const JournalEntryDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const journalEntry = await getJournalEntryById(entryId);
      setEntry(journalEntry);
      setLoading(false);
    } catch (error) {
      console.error('Error loading journal entry:', error);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!entry) return;
    
    try {
      const emotionText = entry.emotionData?.primaryEmotion 
        ? `I felt ${entry.emotionData.primaryEmotion} today` 
        : 'I tracked my emotions today';
      
      const moodText = entry.emotionData?.sliderValues?.mood !== undefined
        ? `\nMood: ${entry.emotionData.sliderValues.mood}/10`
        : '';
      
      const notesText = entry.notes
        ? `\n\nNotes: ${entry.notes}`
        : '';
      
      const message = `${emotionText}${moodText}${notesText}\n\n- Shared from EmotiGlass`;
      
      await Share.share({
        message,
        title: 'My Emotion Journal',
      });
    } catch (error) {
      console.error('Error sharing journal entry:', error);
      Alert.alert('Error', 'Could not share the journal entry.');
    }
  };

  const handleDelete = () => {
    if (!entry) return;
    
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteJournalEntry(entry.id);
              if (success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Could not delete the entry. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'An error occurred while deleting the entry.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmotionColor = (emotion: string): string => {
    const emotionColors: Record<string, string> = {
      'Joy': '#FFD700',
      'Happiness': '#FFD700',
      'Sadness': '#4682B4',
      'Anger': '#FF6347',
      'Fear': '#9370DB',
      'Surprise': '#20B2AA',
    };
    
    return emotionColors[emotion] || '#999';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4169E1" />
        <Text style={styles.loadingText}>Loading journal entry...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Journal Entry Not Found</Text>
        <Text style={styles.errorText}>
          The journal entry you're looking for could not be found.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{formatDate(entry.timestamp)}</Text>
            <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color="#4169E1" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
        
        {entry.emotionData?.primaryEmotion && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Emotion</Text>
            <View style={[
              styles.emotionTag, 
              {backgroundColor: getEmotionColor(entry.emotionData.primaryEmotion)}
            ]}>
              <Text style={styles.emotionText}>{entry.emotionData.primaryEmotion}</Text>
            </View>
          </View>
        )}
        
        {entry.emotionData?.sliderValues && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emotion Sliders</Text>
            
            {entry.emotionData.sliderValues.mood !== undefined && (
              <View style={styles.sliderItem}>
                <Text style={styles.sliderLabel}>Mood: {entry.emotionData.sliderValues.mood.toFixed(1)}/10</Text>
                <View style={styles.sliderBar}>
                  <View style={[styles.sliderFill, {width: `${entry.emotionData.sliderValues.mood * 10}%`}]} />
                </View>
              </View>
            )}
            
            {entry.emotionData.sliderValues.energy !== undefined && (
              <View style={styles.sliderItem}>
                <Text style={styles.sliderLabel}>Energy: {entry.emotionData.sliderValues.energy.toFixed(1)}/10</Text>
                <View style={styles.sliderBar}>
                  <View style={[styles.sliderFill, {width: `${entry.emotionData.sliderValues.energy * 10}%`}]} />
                </View>
              </View>
            )}
            
            {entry.emotionData.sliderValues.anxiety !== undefined && (
              <View style={styles.sliderItem}>
                <Text style={styles.sliderLabel}>Anxiety: {entry.emotionData.sliderValues.anxiety.toFixed(1)}/10</Text>
                <View style={styles.sliderBar}>
                  <View style={[styles.sliderFill, {width: `${entry.emotionData.sliderValues.anxiety * 10}%`}]} />
                </View>
              </View>
            )}
            
            {entry.emotionData.sliderValues.calmness !== undefined && (
              <View style={styles.sliderItem}>
                <Text style={styles.sliderLabel}>Calmness: {entry.emotionData.sliderValues.calmness.toFixed(1)}/10</Text>
                <View style={styles.sliderBar}>
                  <View style={[styles.sliderFill, {width: `${entry.emotionData.sliderValues.calmness * 10}%`}]} />
                </View>
              </View>
            )}
          </View>
        )}
        
        {entry.emotionData?.voiceData?.transcription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Recording</Text>
            <View style={styles.contentBox}>
              <Text style={styles.quotedText}>"{entry.emotionData.voiceData.transcription}"</Text>
            </View>
          </View>
        )}
        
        {entry.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.contentBox}>
              <Text style={styles.notesText}>{entry.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#4169E1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  date: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 16,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emotionTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  emotionText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  sliderItem: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  sliderBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#4169E1',
    borderRadius: 6,
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quotedText: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default JournalEntryDetailScreen; 