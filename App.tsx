import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ToastProvider } from './frontend/components/ui/Toast';
import AppNavigator from './frontend/navigation/AppNavigator';
import { initStorage } from './frontend/services/storage';
import { initAudioStorage } from './frontend/services/audioService';
import { initSoundDirectory } from './frontend/services/ambientGenerator';
import theme from './frontend/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as tf from '@tensorflow/tfjs';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initStatus, setInitStatus] = useState<string>('Initializing...');

  // Initialize app data and services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set status for better UX
        setInitStatus('Initializing storage...');
        
        // Initialize storage
        const storageInitialized = await initStorage();
        
        if (!storageInitialized) {
          setError('Failed to initialize storage. Please restart the app.');
          return;
        }
        
        // Initialize audio services
        setInitStatus('Initializing audio services...');
        const audioInitialized = await initAudioStorage();
        
        if (!audioInitialized) {
          console.warn('Audio services initialization failed. Some features may not work properly.');
        }
        
        // Initialize ambient sound directory
        setInitStatus('Initializing ambient services...');
        const ambientInitialized = await initSoundDirectory();
        
        if (!ambientInitialized) {
          console.warn('Ambient services initialization failed. Some features may not work properly.');
        }
        
        // Initialize TensorFlow.js (for ML models)
        setInitStatus('Initializing ML services...');
        await tf.ready();
        
        // Create necessary directories
        await ensureDirectoriesExist();
        
        setInitStatus('Ready!');
      } catch (err) {
        console.error('Initialization error:', err);
        setError('An error occurred during app initialization.');
      } finally {
        // Simulate a minimum loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    initializeApp();
  }, []);
  
  // Ensure all required directories exist
  const ensureDirectoriesExist = async () => {
    const dirs = [
      `${FileSystem.documentDirectory}recordings/`,
      `${FileSystem.documentDirectory}images/`,
      `${FileSystem.documentDirectory}drawings/`,
      `${FileSystem.documentDirectory}ambient_sounds/`,
      `${FileSystem.documentDirectory}models/`,
    ];
    
    for (const dir of dirs) {
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading EmotiGlass...</Text>
        <Text style={styles.statusText}>{initStatus}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please restart the application</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  statusText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  errorSubtext: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
}); 