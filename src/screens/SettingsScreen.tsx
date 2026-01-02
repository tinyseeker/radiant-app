import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useSettings } from '../context/SettingsContext';
import { useJournal } from '../context/JournalContext';
import { useActivity } from '../context/ActivityContext';
import { exportService } from '../utils/exportService';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

type SettingsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { settings, updateSettings, enableNotifications, disableNotifications, testNotification } =
    useSettings();
  const { journal } = useJournal();
  const { activity } = useActivity();
  const [isEnabling, setIsEnabling] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      setIsEnabling(true);
      const success = await enableNotifications();
      setIsEnabling(false);

      if (!success) {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        );
      }
    } else {
      await disableNotifications();
    }
  };

  const handleUpdateTime = (type: 'morning' | 'evening', time: string) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [type === 'morning' ? 'morningTime' : 'eveningTime']: time,
      },
    });
  };

  const handleToggleMorning = async (value: boolean) => {
    await updateSettings({
      notifications: {
        ...settings.notifications,
        morningEnabled: value,
      },
    });
  };

  const handleToggleEvening = async (value: boolean) => {
    await updateSettings({
      notifications: {
        ...settings.notifications,
        eveningEnabled: value,
      },
    });
  };

  const handleToggleStreakProtection = async (value: boolean) => {
    await updateSettings({
      notifications: {
        ...settings.notifications,
        streakProtectionEnabled: value,
      },
    });
  };

  const handleTestNotification = async () => {
    try {
      await testNotification();
      Alert.alert('Success!', 'Check your notifications - a test notification was sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification. Please check permissions.');
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExportingJSON(true);
      await exportService.exportAsJSON(journal, activity);
      Alert.alert(
        'Export Successful',
        'Your journal data has been exported as JSON. You can import this file later to restore your data.'
      );
    } catch (error) {
      console.error('Export JSON error:', error);
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    } finally {
      setIsExportingJSON(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      await exportService.exportAsPDF(journal, activity);
      Alert.alert(
        'Export Successful',
        'Your journal has been exported as HTML. You can open it in any browser or convert to PDF.'
      );
    } catch (error: any) {
      console.error('Export PDF error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      Alert.alert('Export Failed', `Unable to export your journal. Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const timeOptions = {
    morning: [
      '05:00',
      '06:00',
      '07:00',
      '08:00',
      '09:00',
      '10:00',
    ],
    evening: [
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00',
      '23:00',
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your notifications and preferences</Text>
      </LinearGradient>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        {/* Enable/Disable Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Receive notifications to maintain your practice
            </Text>
          </View>
          <Switch
            value={settings.notifications.enabled}
            onValueChange={handleToggleNotifications}
            disabled={isEnabling}
            trackColor={{ false: '#D0D0D0', true: colors.primary }}
            thumbColor={settings.notifications.enabled ? colors.primaryDark : '#F4F4F4'}
          />
        </View>

        {settings.notifications.enabled && (
          <>
            {/* Morning Notification */}
            <View style={styles.settingGroup}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Morning Reminder</Text>
                  <Text style={styles.settingDescription}>Start your day with gratitude</Text>
                </View>
                <Switch
                  value={settings.notifications.morningEnabled}
                  onValueChange={handleToggleMorning}
                  trackColor={{ false: '#D0D0D0', true: colors.primary }}
                  thumbColor={settings.notifications.morningEnabled ? colors.primaryDark : '#F4F4F4'}
                />
              </View>

              {settings.notifications.morningEnabled && (
                <View style={styles.timeSelector}>
                  <Text style={styles.timeSelectorLabel}>Time:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {timeOptions.morning.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeButton,
                          settings.notifications.morningTime === time && styles.timeButtonActive,
                        ]}
                        onPress={() => handleUpdateTime('morning', time)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            settings.notifications.morningTime === time &&
                              styles.timeButtonTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Evening Notification */}
            <View style={styles.settingGroup}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Evening Reminder</Text>
                  <Text style={styles.settingDescription}>Reflect on your day</Text>
                </View>
                <Switch
                  value={settings.notifications.eveningEnabled}
                  onValueChange={handleToggleEvening}
                  trackColor={{ false: '#D0D0D0', true: colors.primary }}
                  thumbColor={settings.notifications.eveningEnabled ? colors.primaryDark : '#F4F4F4'}
                />
              </View>

              {settings.notifications.eveningEnabled && (
                <View style={styles.timeSelector}>
                  <Text style={styles.timeSelectorLabel}>Time:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {timeOptions.evening.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeButton,
                          settings.notifications.eveningTime === time && styles.timeButtonActive,
                        ]}
                        onPress={() => handleUpdateTime('evening', time)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            settings.notifications.eveningTime === time &&
                              styles.timeButtonTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Streak Protection */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Streak Protection</Text>
                <Text style={styles.settingDescription}>
                  Remind me if I haven't checked in by 8 PM
                </Text>
              </View>
              <Switch
                value={settings.notifications.streakProtectionEnabled}
                onValueChange={handleToggleStreakProtection}
                trackColor={{ false: '#D0D0D0', true: colors.primary }}
                thumbColor={
                  settings.notifications.streakProtectionEnabled ? colors.primaryDark : '#F4F4F4'
                }
              />
            </View>

            {/* Test Notification Button */}
            <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
              <LinearGradient
                colors={colors.gradients.secondary}
                style={styles.testButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.testButtonText}>Send Test Notification</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <View style={styles.settingInfo}>
          <Text style={styles.settingDescription}>
            Export your journal data for backup or to view outside the app.
          </Text>
        </View>

        {/* Export as JSON (Backup) */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportJSON}
          disabled={isExportingJSON}
        >
          <LinearGradient
            colors={colors.gradients.secondary}
            style={styles.exportButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isExportingJSON ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.exportButtonIcon}>💾</Text>
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>Export as Backup</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    Save all data as JSON (can be restored later)
                  </Text>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Export as PDF/HTML */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportPDF}
          disabled={isExportingPDF}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.exportButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isExportingPDF ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.exportButtonIcon}>📄</Text>
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>Export as Journal</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    Beautiful HTML format (printable & shareable)
                  </Text>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.exportNote}>
          <Text style={styles.exportNoteText}>
            💡 Tip: Export regularly to keep a backup of your journey
          </Text>
        </View>
      </View>

      {/* Info Note */}
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          {Platform.OS === 'ios'
            ? 'Notifications require a development build. Run "npx expo run:ios" to test this feature.'
            : 'Notifications require a development build. Run "npx expo run:android" to test this feature.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.white,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  settingGroup: {
    marginBottom: spacing.md,
  },
  timeSelector: {
    marginTop: spacing.sm,
    marginLeft: spacing.md,
  },
  timeSelectorLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  timeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  timeButtonText: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 14,
  },
  timeButtonTextActive: {
    color: colors.text.white,
    fontWeight: '700',
  },
  testButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  testButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  testButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 16,
  },
  exportButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 80,
  },
  exportButtonIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 16,
    marginBottom: 4,
  },
  exportButtonSubtitle: {
    ...typography.caption,
    color: colors.text.white,
    opacity: 0.9,
    fontSize: 12,
  },
  exportNote: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
  },
  exportNoteText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: '#1976D2',
    flex: 1,
    lineHeight: 20,
  },
});
