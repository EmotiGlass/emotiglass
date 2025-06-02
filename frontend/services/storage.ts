import { Platform } from 'react-native';
import { MoodEntry } from '../types';
import { generateMoodEntries } from './dummyData';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

// Storage directory for mood entries
const MOOD_ENTRIES_KEY = 'emotiglass_mood_entries_index';
const MOOD_ENTRIES_DIR = Platform.OS !== 'web' && FileSystem.documentDirectory 
  ? FileSystem.documentDirectory + 'mood_entries/' 
  : null;

export type { MoodEntry };

// Helper function to ensure directory exists (mobile only)
const ensureDirectoryExists = async (directory: string): Promise<boolean> => {
  if (Platform.OS === 'web' || !FileSystem) {
    return true; // On web, directories don't need to be created
  }

  try {
    const dirInfo = await FileSystem.getInfoAsync(directory);
    
    if (!dirInfo.exists) {
      console.log(`Creating directory: ${directory}`);
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring directory exists: ${directory}`, error);
    return false;
  }
};

// Initialize storage
export const initStorage = async (): Promise<boolean> => {
  try {
    // Create mood entries directory if needed (mobile only)
    if (Platform.OS !== 'web' && MOOD_ENTRIES_DIR) {
      const dirCreated = await ensureDirectoryExists(MOOD_ENTRIES_DIR);
      
      if (!dirCreated) {
        console.error('Failed to create mood entries directory');
        return false;
      }
    }
    
    // Check if we have any entries already
    const entryIds = await getEntryIndex();
    
    // If no entries, generate some dummy data for prototype
    if (entryIds.length === 0) {
      console.log('No entries found, generating dummy data');
      const dummyEntries = generateMoodEntries(30);
      
      // Save each dummy entry
      for (const entry of dummyEntries) {
        await saveMoodEntry(entry);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    return false;
  }
};

// Get entry index from secure storage or localStorage
export const getEntryIndex = async (): Promise<string[]> => {
  try {
    let indexJson: string | null = null;
    
    if (Platform.OS === 'web') {
      // Use localStorage on web
      indexJson = localStorage.getItem(MOOD_ENTRIES_KEY);
    } else {
      // Use SecureStore on native
      indexJson = await SecureStore.getItemAsync(MOOD_ENTRIES_KEY);
    }
    
    if (!indexJson) {
      return [];
    }
    
    return JSON.parse(indexJson);
  } catch (error) {
    console.error('Failed to get entry index:', error);
    return [];
  }
};

// Update entry index
export const updateEntryIndex = async (entryIds: string[]): Promise<boolean> => {
  try {
    const indexJson = JSON.stringify(entryIds);
    
    if (Platform.OS === 'web') {
      // Use localStorage on web
      localStorage.setItem(MOOD_ENTRIES_KEY, indexJson);
    } else {
      // Use SecureStore on native
      await SecureStore.setItemAsync(MOOD_ENTRIES_KEY, indexJson);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update entry index:', error);
    return false;
  }
};

// Save a mood entry
export const saveMoodEntry = async (entry: MoodEntry): Promise<boolean> => {
  try {
    // Ensure directory exists (mobile only)
    if (Platform.OS !== 'web' && MOOD_ENTRIES_DIR) {
      const dirCreated = await ensureDirectoryExists(MOOD_ENTRIES_DIR);
      if (!dirCreated) {
        console.error('Failed to ensure mood entries directory exists');
        return false;
      }
    }
    
    // Get current entry index
    const entryIds = await getEntryIndex();
    
    // Add entry ID to index if not already present
    if (!entryIds.includes(entry.id)) {
      entryIds.push(entry.id);
      await updateEntryIndex(entryIds);
    }
    
    // Save entry data
    const entryJson = JSON.stringify(entry);
    
    if (Platform.OS === 'web') {
      // Use localStorage on web
      localStorage.setItem(`${MOOD_ENTRIES_KEY}_${entry.id}`, entryJson);
    } else if (MOOD_ENTRIES_DIR) {
      // Use FileSystem on native
      const entryPath = MOOD_ENTRIES_DIR + entry.id + '.json';
      await FileSystem.writeAsStringAsync(entryPath, entryJson);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save mood entry:', error);
    return false;
  }
};

// Get a single mood entry
export const getMoodEntry = async (id: string): Promise<MoodEntry | null> => {
  try {
    let entryJson: string | null = null;
    
    if (Platform.OS === 'web') {
      // Use localStorage on web
      entryJson = localStorage.getItem(`${MOOD_ENTRIES_KEY}_${id}`);
      if (!entryJson) {
        // Clean up the index by removing the non-existent entry
        const entryIds = await getEntryIndex();
        if (entryIds.includes(id)) {
          const newEntryIds = entryIds.filter(entryId => entryId !== id);
          await updateEntryIndex(newEntryIds);
        }
        return null;
      }
      
      return JSON.parse(entryJson) as MoodEntry;
    } else if (MOOD_ENTRIES_DIR) {
      // Use FileSystem on native
      const entryPath = MOOD_ENTRIES_DIR + id + '.json';
      
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(entryPath);
      if (!fileInfo.exists) {
        // Clean up the index
        const entryIds = await getEntryIndex();
        if (entryIds.includes(id)) {
          const newEntryIds = entryIds.filter(entryId => entryId !== id);
          await updateEntryIndex(newEntryIds);
        }
        return null;
      }
      
      try {
        entryJson = await FileSystem.readAsStringAsync(entryPath);
        return JSON.parse(entryJson) as MoodEntry;
      } catch (readError) {
        console.error(`Error reading mood entry file ${entryPath}:`, readError);
        await FileSystem.deleteAsync(entryPath, { idempotent: true });
        
        // Remove from index
        const entryIds = await getEntryIndex();
        if (entryIds.includes(id)) {
          const newEntryIds = entryIds.filter(entryId => entryId !== id);
          await updateEntryIndex(newEntryIds);
        }
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get mood entry ${id}:`, error);
    return null;
  }
};

// Get all mood entries
export const getAllMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    // Get entry index
    const entryIds = await getEntryIndex();
    
    // Load each entry
    const entries: MoodEntry[] = [];
    const validEntryIds: string[] = [];
    
    for (const id of entryIds) {
      const entry = await getMoodEntry(id);
      if (entry) {
        entries.push(entry);
        validEntryIds.push(id);
      }
    }
    
    // If we found fewer valid entries than were in the index,
    // update the index to contain only valid entries
    if (validEntryIds.length < entryIds.length) {
      console.log(`Updating entry index: ${entryIds.length} -> ${validEntryIds.length} entries`);
      await updateEntryIndex(validEntryIds);
    }
    
    return entries;
  } catch (error) {
    console.error('Failed to get all mood entries:', error);
    return [];
  }
};

// Delete a mood entry
export const deleteMoodEntry = async (id: string): Promise<boolean> => {
  try {
    // Remove from index
    const entryIds = await getEntryIndex();
    const newEntryIds = entryIds.filter(entryId => entryId !== id);
    await updateEntryIndex(newEntryIds);
    
    // Delete entry data
    if (Platform.OS === 'web') {
      // Use localStorage on web
      localStorage.removeItem(`${MOOD_ENTRIES_KEY}_${id}`);
    } else if (MOOD_ENTRIES_DIR) {
      // Use FileSystem on native
      const entryPath = MOOD_ENTRIES_DIR + id + '.json';
      
      // Check if file exists before deleting
      const fileInfo = await FileSystem.getInfoAsync(entryPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(entryPath);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete mood entry ${id}:`, error);
    return false;
  }
};

// Search mood entries
export const searchMoodEntries = async (query: string): Promise<MoodEntry[]> => {
  try {
    // Get all entries
    const allEntries = await getAllMoodEntries();
    
    // Filter entries based on query
    // Simple implementation: search in notes and dominant emotion
    const queryLower = query.toLowerCase();
    
    return allEntries.filter(entry => 
      (entry.notes && entry.notes.toLowerCase().includes(queryLower)) ||
      entry.dominantEmotion.toLowerCase().includes(queryLower)
    );
  } catch (error) {
    console.error('Failed to search mood entries:', error);
    return [];
  }
};

// Get entries within date range
export const getEntriesInDateRange = async (startDate: Date, endDate: Date): Promise<MoodEntry[]> => {
  try {
    // Get all entries
    const allEntries = await getAllMoodEntries();
    
    // Convert dates to timestamps
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    
    // Filter entries based on date range
    return allEntries.filter(entry => 
      entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp
    );
  } catch (error) {
    console.error('Failed to get entries in date range:', error);
    return [];
  }
}; 