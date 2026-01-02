import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { JournalProvider } from './src/context/JournalContext';
import { ActivityProvider } from './src/context/ActivityContext';
import { SettingsProvider } from './src/context/SettingsContext';
import AppNavigator from './src/navigation/AppNavigator';
import { setupWidgetTaskHandler } from './src/utils/widgetTaskHandler';

export default function App() {
  useEffect(() => {
    // Setup widget task handler for iOS widgets
    setupWidgetTaskHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <JournalProvider>
        <ActivityProvider>
          <SettingsProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </SettingsProvider>
        </ActivityProvider>
      </JournalProvider>
    </SafeAreaProvider>
  );
}
