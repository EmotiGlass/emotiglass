import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { JournalEntry } from '../types';

// Storage keys
const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'emotiglass_journal_entries',
  ENCRYPTION_KEY: 'emotiglass_encryption_key',
};

// Whether to encrypt journal data
const USE_ENCRYPTION = true;
// Secret key for encryption (in a real app, this would be securely stored)
const SECRET_KEY = 'EmotiGlass2023';

/**
 * Saves a journal entry to local storage
 */
export const saveJournalEntry = async (entry: JournalEntry): Promise<void> => {
  try {
    // First, get existing entries
    const existingEntries = await getJournalEntries();
    
    // Add new entry to the beginning (most recent first)
    const updatedEntries = [entry, ...existingEntries];
    
    // Save the updated entries
    await saveEntries(updatedEntries);
    
    console.log('Journal entry saved successfully', entry.id);
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw new Error('Failed to save journal entry');
  }
};

/**
 * Retrieves all journal entries from storage
 */
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    // Get data from storage
    const data = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    
    if (!data) {
      return [];
    }
    
    // Decrypt data if encryption is enabled
    const decryptedData = USE_ENCRYPTION ? decrypt(data) : data;
    
    // Parse and return the entries
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error retrieving journal entries:', error);
    return [];
  }
};

/**
 * Retrieves a specific journal entry by ID
 */
export const getJournalEntryById = async (id: string): Promise<JournalEntry | null> => {
  try {
    const entries = await getJournalEntries();
    const entry = entries.find(e => e.id === id);
    return entry || null;
  } catch (error) {
    console.error('Error retrieving journal entry by ID:', error);
    return null;
  }
};

/**
 * Deletes a journal entry by ID
 */
export const deleteJournalEntry = async (id: string): Promise<boolean> => {
  try {
    const entries = await getJournalEntries();
    const updatedEntries = entries.filter(e => e.id !== id);
    
    // If no entries were removed, return false
    if (updatedEntries.length === entries.length) {
      return false;
    }
    
    // Save the updated entries
    await saveEntries(updatedEntries);
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
};

/**
 * Deletes all journal entries
 */
export const clearAllJournalEntries = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
  } catch (error) {
    console.error('Error clearing journal entries:', error);
    throw new Error('Failed to clear journal entries');
  }
};

/**
 * Helper function to save entries to storage
 */
const saveEntries = async (entries: JournalEntry[]): Promise<void> => {
  // Convert entries to JSON string
  const entriesJson = JSON.stringify(entries);
  
  // Encrypt the data if encryption is enabled
  const dataToSave = USE_ENCRYPTION ? encrypt(entriesJson) : entriesJson;
  
  // Save to AsyncStorage
  await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, dataToSave);
};

/**
 * Encrypts a string using AES encryption
 */
const encrypt = (text: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    // Fall back to unencrypted data if encryption fails
    return text;
  }
};

/**
 * Decrypts an encrypted string
 */
const decrypt = (encryptedText: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    // If decryption fails, return empty array JSON to prevent app crashes
    return '[]';
  }
}; 