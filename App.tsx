import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { JournalProvider } from './src/context/JournalContext';
import { ActivityProvider } from './src/context/ActivityContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <JournalProvider>
        <ActivityProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ActivityProvider>
      </JournalProvider>
    </SafeAreaProvider>
  );
}
