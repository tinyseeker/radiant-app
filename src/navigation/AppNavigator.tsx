import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import EditAffirmationsScreen from '../screens/EditAffirmationsScreen';
import EditMorningRoutineScreen from '../screens/EditMorningRoutineScreen';
import EditEveningRoutineScreen from '../screens/EditEveningRoutineScreen';
import EditGoalsScreen from '../screens/EditGoalsScreen';
import EditTraitsScreen from '../screens/EditTraitsScreen';
import EditStandardsScreen from '../screens/EditStandardsScreen';
import EditRemindersScreen from '../screens/EditRemindersScreen';
import EditVisionBoardScreen from '../screens/EditVisionBoardScreen';
import ViewJournalScreen from '../screens/ViewJournalScreen';
import DailyCheckInScreen from '../screens/DailyCheckInScreen';
import VisionBoardSlideshowScreen from '../screens/VisionBoardSlideshowScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFF9F5',
          },
          headerTintColor: '#2C3E50',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditAffirmations"
          component={EditAffirmationsScreen}
          options={{ title: 'Edit Affirmations' }}
        />
        <Stack.Screen
          name="EditMorningRoutine"
          component={EditMorningRoutineScreen}
          options={{ title: 'Morning Routine' }}
        />
        <Stack.Screen
          name="EditEveningRoutine"
          component={EditEveningRoutineScreen}
          options={{ title: 'Evening Routine' }}
        />
        <Stack.Screen
          name="EditGoals"
          component={EditGoalsScreen}
          options={{ title: 'Edit Goals' }}
        />
        <Stack.Screen
          name="EditTraits"
          component={EditTraitsScreen}
          options={{ title: 'Edit Traits' }}
        />
        <Stack.Screen
          name="EditStandards"
          component={EditStandardsScreen}
          options={{ title: 'Standards' }}
        />
        <Stack.Screen
          name="EditReminders"
          component={EditRemindersScreen}
          options={{ title: 'Daily Reminders' }}
        />
        <Stack.Screen
          name="EditVisionBoard"
          component={EditVisionBoardScreen}
          options={{ title: 'Vision Board' }}
        />
        <Stack.Screen
          name="ViewJournal"
          component={ViewJournalScreen}
          options={{ title: 'My Journal' }}
        />
        <Stack.Screen
          name="DailyCheckIn"
          component={DailyCheckInScreen}
          options={{ title: 'Daily Check-in' }}
        />
        <Stack.Screen
          name="VisionBoardSlideshow"
          component={VisionBoardSlideshowScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
