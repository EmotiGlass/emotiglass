import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import SessionScreen from '../screens/SessionScreen';
import JournalScreen from '../screens/JournalScreen';
import JournalEntryDetailScreen from '../screens/JournalEntryDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Define types for navigation
export type RootStackParamList = {
  Main: undefined;
  JournalEntryDetail: { entryId: string };
};

export type MainTabParamList = {
  Session: undefined;
  Journal: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Session') {
            iconName = focused ? 'recording' : 'recording-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4169E1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Session" 
        component={SessionScreen} 
        options={{ tabBarLabel: 'Track Emotions' }}
      />
      <Tab.Screen 
        name="Journal" 
        component={JournalScreen} 
        options={{ tabBarLabel: 'Journal' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="JournalEntryDetail"
          component={JournalEntryDetailScreen}
          options={{ 
            title: 'Journal Entry',
            headerBackTitleVisible: false,
            headerTintColor: '#4169E1',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 