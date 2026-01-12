import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types';
import { useTheme } from '../hooks/useTheme';

import SplashScreen from '../screens/SplashScreen';
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
const Tab = createBottomTabNavigator();

// Custom tab bar with sliding indicator
function CustomTabBar({ state, descriptors, navigation, isDarkMode }: any) {
  const { colors } = useTheme();
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Calculate tab width based on container width
  const tabWidth = tabBarWidth / 4;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth]);

  const iconNames: Array<keyof typeof Ionicons.glyphMap> = [
    'book-outline',
    'flame-outline',
    'sparkles-outline',
    'settings-outline'
  ];

  return (
    <View
      style={{
        backgroundColor: colors.backgroundLight,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        height: 65,
        paddingTop: 10,
        paddingBottom: 8,
        borderRadius: 24,
        position: 'absolute',
        bottom: 20,
        marginHorizontal: 24,
        alignSelf: 'center',
        width: '90%',
        flexDirection: 'row',
      }}
      onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
    >
      {/* Sliding background indicator */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          width: tabWidth,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateX: slideAnim }],
        }}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
            borderRadius: 18,
            width: 50,
            height: 50,
          }}
        />
      </Animated.View>

      {/* Tab buttons */}
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={route.key}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onTouchEnd={onPress}
          >
            <Ionicons
              name={iconNames[index]}
              size={26}
              color={isFocused ? colors.primary : colors.text.secondary}
            />
          </View>
        );
      })}
    </View>
  );
}

// Bottom Tab Navigator with 4 main tabs
function MainTabs() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} isDarkMode={isDarkMode} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="DailyCheckIn" component={DailyCheckInScreen} />
      <Tab.Screen name="ViewJournal" component={ViewJournalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.backgroundLight,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
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
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditAffirmations"
          component={EditAffirmationsScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditMorningRoutine"
          component={EditMorningRoutineScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditEveningRoutine"
          component={EditEveningRoutineScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditGoals"
          component={EditGoalsScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditTraits"
          component={EditTraitsScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditStandards"
          component={EditStandardsScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditReminders"
          component={EditRemindersScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="EditVisionBoard"
          component={EditVisionBoardScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
          }}
        />
        <Stack.Screen
          name="VisionBoardSlideshow"
          component={VisionBoardSlideshowScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
