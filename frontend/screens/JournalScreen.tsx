import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import JournalEntryCard from '../components/journaling/JournalEntryCard';
import JournalSummary from '../components/journaling/JournalSummary';
import { getJournalEntries, deleteJournalEntry } from '../storage/JournalSaver';
import { JournalEntry } from '../types';

type TimeRange = 'week' | 'month' | 'year';

const JournalScreen: React.FC<any> = ({ navigation }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const journalEntries = await getJournalEntries();
      setEntries(journalEntries);
      setLoading(false);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, [loadEntries]);

  const handleEntryPress = (entry: JournalEntry) => {
    navigation.navigate('JournalEntryDetail', { entryId: entry.id });
  };

  const handleDeleteEntry = (id: string) => {
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
              const success = await deleteJournalEntry(id);
              if (success) {
                setEntries(entries.filter(entry => entry.id !== id));
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

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
      <Text style={styles.emptyText}>
        Start tracking your emotions by creating a new emotion session.
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('Session')}
      >
        <Text style={styles.createButtonText}>Create New Session</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Your Emotional Journal</Text>
      
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={viewMode === 'list' ? '#4169E1' : '#999'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'summary' && styles.toggleButtonActive]}
          onPress={() => setViewMode('summary')}
        >
          <Ionicons 
            name="stats-chart" 
            size={20} 
            color={viewMode === 'summary' ? '#4169E1' : '#999'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTimeRangePicker = () => (
    <View style={styles.timeRangePicker}>
      <TouchableOpacity
        style={[styles.timeRangeButton, timeRange === 'week' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('week')}
      >
        <Text style={[
          styles.timeRangeText, 
          timeRange === 'week' && styles.timeRangeTextActive
        ]}>
          Week
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeRangeButton, timeRange === 'month' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('month')}
      >
        <Text style={[
          styles.timeRangeText, 
          timeRange === 'month' && styles.timeRangeTextActive
        ]}>
          Month
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.timeRangeButton, timeRange === 'year' && styles.timeRangeButtonActive]}
        onPress={() => setTimeRange('year')}
      >
        <Text style={[
          styles.timeRangeText, 
          timeRange === 'year' && styles.timeRangeTextActive
        ]}>
          Year
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {viewMode === 'summary' ? (
        <View style={styles.summaryContainer}>
          {renderTimeRangePicker()}
          <JournalSummary timeRange={timeRange} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onPress={handleEntryPress}
              onDelete={handleDeleteEntry}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Session')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 80, // Make room for FAB
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4169E1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4169E1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryContainer: {
    flex: 1,
  },
  timeRangePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  timeRangeButtonActive: {
    backgroundColor: '#4169E1',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default JournalScreen; 