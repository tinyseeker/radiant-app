import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { JournalProvider } from './src/context/JournalContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { settings } = useSettings();

  return (
    <>
      <AppNavigator />
      <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <JournalProvider>
        <ActivityProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </ActivityProvider>
      </JournalProvider>
    </SafeAreaProvider>
  );
}
