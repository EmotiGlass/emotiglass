import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getJournalEntries } from '../../storage/JournalSaver';
import { JournalEntry, EmotionData } from '../../types';

const screenWidth = Dimensions.get('window').width;

interface JournalSummaryProps {
  timeRange?: 'week' | 'month' | 'year';
}

const JournalSummary: React.FC<JournalSummaryProps> = ({ timeRange = 'week' }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [moodData, setMoodData] = useState<{labels: string[], datasets: any}>(
    {labels: [], datasets: [{data: []}]}
  );
  const [emotionCounts, setEmotionCounts] = useState<{labels: string[], data: number[]}>(
    {labels: [], data: []}
  );

  useEffect(() => {
    loadJournalData();
  }, [timeRange]);

  const loadJournalData = async () => {
    try {
      setLoading(true);
      const allEntries = await getJournalEntries();
      
      // Filter entries based on timeRange
      const filteredEntries = filterEntriesByTimeRange(allEntries, timeRange);
      setEntries(filteredEntries);
      
      // Process data for charts
      processChartData(filteredEntries);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading journal data:', error);
      setLoading(false);
    }
  };

  const filterEntriesByTimeRange = (entries: JournalEntry[], range: string): JournalEntry[] => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (range) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return entries.filter(entry => new Date(entry.timestamp) >= cutoffDate);
  };

  const processChartData = (entries: JournalEntry[]) => {
    if (entries.length === 0) {
      return;
    }

    // Process mood data for line chart
    const dateLabels: string[] = [];
    const moodValues: number[] = [];
    const energyValues: number[] = [];
    
    // Process primary emotions for bar chart
    const emotionLabels = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise'];
    const emotionValues = [0, 0, 0, 0, 0];
    
    // Sort entries by date ascending
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Get data points for charts
    sortedEntries.forEach(entry => {
      // Format date for label
      const date = new Date(entry.timestamp);
      const dateLabel = `${date.getMonth()+1}/${date.getDate()}`;
      dateLabels.push(dateLabel);
      
      // Extract mood data
      if (entry.emotionData && entry.emotionData.sliderValues) {
        moodValues.push(entry.emotionData.sliderValues.mood || 0);
        energyValues.push(entry.emotionData.sliderValues.energy || 0);
      }
      
      // Count emotions
      if (entry.emotionData && entry.emotionData.primaryEmotion) {
        const emotion = entry.emotionData.primaryEmotion;
        const index = emotionLabels.indexOf(emotion);
        if (index !== -1) {
          emotionValues[index]++;
        }
      }
    });
    
    // Set data for charts
    setMoodData({
      labels: dateLabels,
      datasets: [
        {
          data: moodValues,
          color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // mood line
          strokeWidth: 2,
        },
        {
          data: energyValues,
          color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`, // energy line
          strokeWidth: 2,
        },
      ],
      legend: ['Mood', 'Energy']
    });
    
    setEmotionCounts({
      labels: emotionLabels,
      data: emotionValues
    });
  };

  const calculateAverageMood = (): number => {
    if (entries.length === 0) return 0;
    
    let totalMood = 0;
    let count = 0;
    
    entries.forEach(entry => {
      if (entry.emotionData?.sliderValues?.mood !== undefined) {
        totalMood += entry.emotionData.sliderValues.mood;
        count++;
      }
    });
    
    return count > 0 ? Number((totalMood / count).toFixed(1)) : 0;
  };

  const getPrimaryEmotion = (): string => {
    if (emotionCounts.data.length === 0) return 'None';
    
    const maxIndex = emotionCounts.data.indexOf(Math.max(...emotionCounts.data));
    return emotionCounts.labels[maxIndex] || 'None';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4169E1" />
        <Text style={styles.loadingText}>Analyzing your emotional journey...</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No journal entries found for the selected time period.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCards}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Average Mood</Text>
          <Text style={styles.cardValue}>{calculateAverageMood()}/10</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Primary Emotion</Text>
          <Text style={styles.cardValue}>{getPrimaryEmotion()}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Entries</Text>
          <Text style={styles.cardValue}>{entries.length}</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Mood & Energy Over Time</Text>
      {moodData.labels.length > 1 ? (
        <LineChart
          data={moodData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#f5f5f5',
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '1',
            }
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>Not enough data for chart</Text>
      )}
      
      <Text style={styles.sectionTitle}>Emotion Distribution</Text>
      {emotionCounts.data.some(count => count > 0) ? (
        <BarChart
          data={{
            labels: emotionCounts.labels,
            datasets: [{ data: emotionCounts.data }]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#f5f5f5',
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>Not enough data for chart</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default JournalSummary; 