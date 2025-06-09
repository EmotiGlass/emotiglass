import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JournalEntry } from '../../types';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
  onDelete?: (id: string) => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  onDelete
}) => {
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getEmotionColor = (emotion: string | undefined): string => {
    if (!emotion) return '#999';
    
    const emotionColors: Record<string, string> = {
      'Joy': '#FFD700',
      'Happiness': '#FFD700',
      'Sadness': '#4682B4',
      'Anger': '#FF6347',
      'Fear': '#9370DB',
      'Surprise': '#20B2AA',
      'Disgust': '#8FBC8F',
      'Neutral': '#B0C4DE',
      'Calm': '#87CEEB',
      'Excited': '#FF7F50',
      'Anxious': '#DDA0DD',
      'Stressed': '#CD5C5C'
    };
    
    return emotionColors[emotion] || '#999';
  };

  const getMoodEmoji = (mood: number | undefined): string => {
    if (mood === undefined) return '😐';
    
    if (mood >= 8) return '😁';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '🙁';
    return '😞';
  };

  const getEnergyEmoji = (energy: number | undefined): string => {
    if (energy === undefined) return '⚡';
    
    if (energy >= 8) return '⚡⚡⚡';
    if (energy >= 6) return '⚡⚡';
    if (energy >= 4) return '⚡';
    if (energy >= 2) return '💤';
    return '😴';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formatDate(entry.timestamp)}</Text>
          <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
        </View>
        
        {onDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete(entry.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        {entry.emotionData?.primaryEmotion && (
          <View style={[
            styles.emotionTag, 
            {backgroundColor: getEmotionColor(entry.emotionData.primaryEmotion)}
          ]}>
            <Text style={styles.emotionText}>{entry.emotionData.primaryEmotion}</Text>
          </View>
        )}
        
        <View style={styles.valuesContainer}>
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Mood</Text>
            <Text style={styles.value}>
              {getMoodEmoji(entry.emotionData?.sliderValues?.mood)} 
              {entry.emotionData?.sliderValues?.mood !== undefined 
                ? entry.emotionData.sliderValues.mood.toFixed(1) 
                : '-'}
            </Text>
          </View>
          
          <View style={styles.valueItem}>
            <Text style={styles.valueLabel}>Energy</Text>
            <Text style={styles.value}>
              {getEnergyEmoji(entry.emotionData?.sliderValues?.energy)} 
              {entry.emotionData?.sliderValues?.energy !== undefined 
                ? entry.emotionData.sliderValues.energy.toFixed(1) 
                : '-'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.inputTypes}>
          {entry.emotionData?.drawingData && (
            <View style={styles.inputTypeIcon}>
              <Ionicons name="brush" size={16} color="#666" />
            </View>
          )}
          
          {entry.emotionData?.voiceData && (
            <View style={styles.inputTypeIcon}>
              <Ionicons name="mic" size={16} color="#666" />
            </View>
          )}
          
          {entry.emotionData?.faceData && (
            <View style={styles.inputTypeIcon}>
              <Ionicons name="camera" size={16} color="#666" />
            </View>
          )}
          
          {entry.emotionData?.sliderValues && (
            <View style={styles.inputTypeIcon}>
              <Ionicons name="options" size={16} color="#666" />
            </View>
          )}
        </View>
        
        {entry.notes && (
          <View style={styles.notesPreview}>
            <Ionicons name="document-text-outline" size={16} color="#666" style={styles.notesIcon} />
            <Text style={styles.notesText} numberOfLines={1}>
              {entry.notes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'column',
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 5,
  },
  content: {
    marginBottom: 15,
  },
  emotionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  emotionText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  valueItem: {
    marginRight: 20,
  },
  valueLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  inputTypes: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputTypeIcon: {
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  notesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesIcon: {
    marginRight: 5,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default JournalEntryCard; 