import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllJournalEntries } from '../storage/JournalSaver';

const STORAGE_KEYS = {
  USE_DARK_THEME: 'emotiglass_dark_theme',
  USE_NOTIFICATIONS: 'emotiglass_notifications',
  USE_ENCRYPTION: 'emotiglass_encryption',
};

const SettingsScreen: React.FC = () => {
  const [darkThemeEnabled, setDarkThemeEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  const toggleSetting = async (key: string, value: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      setter(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
      setter(!value);
      Alert.alert('Error', 'Failed to save your setting. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your journal entries? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllJournalEntries();
              Alert.alert('Success', 'All journal entries have been deleted.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color="#4169E1" style={styles.icon} />
              <View>
                <Text style={styles.settingTitle}>Dark Theme</Text>
                <Text style={styles.settingDescription}>Use dark theme for the app interface</Text>
              </View>
            </View>
            <Switch
              value={darkThemeEnabled}
              onValueChange={(value) => toggleSetting(STORAGE_KEYS.USE_DARK_THEME, value, setDarkThemeEnabled)}
              trackColor={{ false: '#d1d1d1', true: '#a4c7fc' }}
              thumbColor={darkThemeEnabled ? '#4169E1' : '#f4f4f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#4169E1" style={styles.icon} />
              <View>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>Enable push notifications</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => toggleSetting(STORAGE_KEYS.USE_NOTIFICATIONS, value, setNotificationsEnabled)}
              trackColor={{ false: '#d1d1d1', true: '#a4c7fc' }}
              thumbColor={notificationsEnabled ? '#4169E1' : '#f4f4f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed" size={24} color="#4169E1" style={styles.icon} />
              <View>
                <Text style={styles.settingTitle}>Encrypt Data</Text>
                <Text style={styles.settingDescription}>Encrypt your journal entries</Text>
              </View>
            </View>
            <Switch
              value={encryptionEnabled}
              onValueChange={(value) => toggleSetting(STORAGE_KEYS.USE_ENCRYPTION, value, setEncryptionEnabled)}
              trackColor={{ false: '#d1d1d1', true: '#a4c7fc' }}
              thumbColor={encryptionEnabled ? '#4169E1' : '#f4f4f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <Ionicons name="trash" size={20} color="#fff" style={styles.dangerButtonIcon} />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>EmotiGlass v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
  },
  dangerButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dangerButtonIcon: {
    marginRight: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});

export default SettingsScreen; 